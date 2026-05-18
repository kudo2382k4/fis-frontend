import { useEffect, useState } from 'react';
import { Table, Button, Tag, Typography, Space, Popconfirm, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import type { Product, ProductVariant } from '../../types'; // ProductVariant used in render

const { Title, Text } = Typography;

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const role = localStorage.getItem('fis_user')
    ? JSON.parse(localStorage.getItem('fis_user')!).role
    : null;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      setProducts(await productApi.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await productApi.delete(id);
      message.success('Đã xóa sản phẩm');
      fetchProducts();
    } catch {
      message.error('Không thể xóa sản phẩm');
    }
  };

  const columns = [
    { title: 'Tên Sản Phẩm', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Mô Tả', dataIndex: 'description', key: 'description', render: (v: string) => v ?? <Text type="secondary">—</Text> },
    {
      title: 'Số Biến Thể',
      dataIndex: 'variants',
      key: 'variants',
      render: (v: ProductVariant[]) => <Tag color="blue">{v?.length ?? 0} SKU</Tag>,
    },
    {
      title: 'Tổng Tồn Kho',
      dataIndex: 'variants',
      key: 'totalStock',
      render: (v: ProductVariant[]) => {
        const total = v?.reduce((s, vv) => s + vv.totalStock, 0) ?? 0;
        return <Tag color={total > 0 ? 'green' : 'error'}>{total}</Tag>;
      },
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: Product) => (
        <Space onClick={e => e.stopPropagation()}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/products/${record.id}`)}
            title="Xem biến thể"
          />
          {role === 'ROLE_OWNER' && (
            <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/products/${record.id}/edit`)} />
          )}
          {role === 'ROLE_OWNER' && (
            <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Danh Sách Sản Phẩm</Title>
        {role === 'ROLE_OWNER' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/create')}
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none' }}>
            Tạo Sản Phẩm
          </Button>
        )}
      </div>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} sản phẩm` }}
          onRow={(record) => ({
            onClick: () => navigate(`/products/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </>
  );
}
