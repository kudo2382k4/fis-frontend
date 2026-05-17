import { useEffect, useState } from 'react';
import { Table, Button, Tag, Typography, Space, Popconfirm, message, Card, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import type { Product, ProductVariant } from '../../types';

const { Title, Text } = Typography;

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

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
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailProduct(record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/products/${record.id}/edit`)} />
          <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const variantColumns = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 64,
      render: (url: string) =>
        url ? (
          <img
            src={url}
            alt="variant"
            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }}
          />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            📦
          </div>
        ),
    },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v: string) => <Text code>{v}</Text> },
    { title: 'Màu', dataIndex: 'color', key: 'color', render: (v: string) => v ?? '—' },
    { title: 'Size', dataIndex: 'size', key: 'size', render: (v: string) => v ?? '—' },
    { title: 'Giá Bán', dataIndex: 'price', key: 'price', render: (v: number) => `${v?.toLocaleString('vi-VN')} ₫` },
    { title: 'Giá Nhập', dataIndex: 'cost', key: 'cost', render: (v: number) => `${v?.toLocaleString('vi-VN')} ₫` },
    { title: 'Tổng Kho', dataIndex: 'totalStock', key: 'totalStock', render: (v: number) => <Tag color={v > 0 ? 'green' : 'error'}>{v}</Tag> },
    { title: 'Có Thể Bán', dataIndex: 'availableStock', key: 'availableStock', render: (v: number) => <Tag color={v > 0 ? 'cyan' : 'warning'}>{v}</Tag> },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Danh Sách Sản Phẩm</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/create')}
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none' }}>
          Tạo Sản Phẩm
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} sản phẩm` }}
        />
      </Card>

      <Modal
        open={!!detailProduct}
        title={detailProduct?.name}
        onCancel={() => setDetailProduct(null)}
        footer={null}
        width={900}
      >
        {detailProduct && (
          <Table
            dataSource={detailProduct.variants}
            columns={variantColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        )}
      </Modal>
    </>
  );
}
