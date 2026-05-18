import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Typography, Space, Popconfirm, message, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ArrowLeftOutlined, FileExcelOutlined } from '@ant-design/icons';
import { salesApi } from '../../api/salesApi';
import { exportSingleOrder } from '../../utils/exportExcel';
import type { SalesOrder, SalesOrderItem } from '../../types';

const { Title, Text } = Typography;

const statusConfig = {
  PENDING:   { color: 'gold',    label: 'Chờ Xử Lý' },
  COMPLETED: { color: 'success', label: 'Hoàn Thành' },
  CANCELED:  { color: 'error',   label: 'Đã Hủy' },
};

export default function SODetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    setLoading(true);
    try { setOrder(await salesApi.getById(id!)); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleProcess = async () => {
    try { await salesApi.process(id!); message.success('Đơn hàng hoàn thành!'); fetchOrder(); }
    catch (err: any) { message.error(err?.response?.data?.message); }
  };

  const handleCancel = async () => {
    try { await salesApi.cancel(id!); message.success('Đã hủy đơn hàng'); fetchOrder(); }
    catch (err: any) { message.error(err?.response?.data?.message); }
  };

  const itemColumns = [
    { title: 'SKU', dataIndex: 'variantSku', key: 'sku', render: (v: string) => <Text code>{v}</Text> },
    { title: 'Màu / Size', key: 'variant', render: (_: unknown, r: SalesOrderItem) => `${r.variantColor ?? ''} ${r.variantSize ?? ''}`.trim() || '—' },
    { title: 'Kho', dataIndex: 'storageLocationName', key: 'location' },
    { title: 'Số Lượng', dataIndex: 'quantity', key: 'qty' },
    { title: 'Đơn Giá', dataIndex: 'unitPrice', key: 'price', render: (v: number) => `${v?.toLocaleString('vi-VN')} ₫` },
    { title: 'Thành Tiền', dataIndex: 'subtotal', key: 'subtotal', render: (v: number) => <Text strong>{v?.toLocaleString('vi-VN')} ₫</Text> },
  ];

  if (loading) return <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 80 }} />;
  if (!order) return <Title level={4}>Không tìm thấy đơn hàng</Title>;

  const status = order.status as keyof typeof statusConfig;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/sales')}>Quay Lại</Button>
          <Title level={4} style={{ margin: 0 }}>Chi Tiết Đơn Hàng</Title>
          <Tag color={statusConfig[status]?.color} style={{ fontSize: 13 }}>{statusConfig[status]?.label}</Tag>
        </Space>
        <Space>
          <Button
            icon={<FileExcelOutlined />}
            onClick={() => exportSingleOrder(order)}
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#fff' }}
          >
            Xuất Excel
          </Button>
          {order.status === 'PENDING' && (
            <>
              <Popconfirm title="Xác nhận hoàn thành?" onConfirm={handleProcess} okText="Xác Nhận">
                <Button type="primary" icon={<CheckCircleOutlined />} style={{ background: '#6366F1', border: 'none' }}>Xác Nhận & Xuất Kho</Button>
              </Popconfirm>
              <Popconfirm title="Hủy đơn hàng này?" onConfirm={handleCancel} okText="Hủy Đơn" okButtonProps={{ danger: true }}>
                <Button danger icon={<CloseCircleOutlined />}>Hủy Đơn</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} bordered size="small">
          <Descriptions.Item label="Khách Hàng"><Text strong>{order.customerName}</Text></Descriptions.Item>
          <Descriptions.Item label="Số Điện Thoại">{order.customerPhone}</Descriptions.Item>
          <Descriptions.Item label="Tổng Tiền"><Text strong style={{ color: '#6366F1', fontSize: 16 }}>{order.totalAmount?.toLocaleString('vi-VN')} ₫</Text></Descriptions.Item>
          <Descriptions.Item label="Người Tạo">{order.createdByEmail}</Descriptions.Item>
          <Descriptions.Item label="Ngày Tạo">{new Date(order.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
          <Descriptions.Item label="Ghi Chú">{order.notes ?? '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Danh Sách Sản Phẩm" bordered={false} style={{ borderRadius: 12 }}>
        <Table dataSource={order.items} columns={itemColumns} rowKey="id" pagination={false} summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={5} index={0}><Text strong>Tổng Cộng</Text></Table.Summary.Cell>
            <Table.Summary.Cell index={5}><Text strong style={{ color: '#6366F1' }}>{order.totalAmount?.toLocaleString('vi-VN')} ₫</Text></Table.Summary.Cell>
          </Table.Summary.Row>
        )} />
      </Card>
    </>
  );
}
