import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Space, Button, message, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { purchaseApi } from '../../api/purchaseApi';
import type { PurchaseOrder } from '../../types';

const { Title, Text } = Typography;

const statusConfig = {
  PENDING:  { color: 'gold',    label: 'Chờ Nhận Hàng' },
  RECEIVED: { color: 'success', label: 'Đã Nhận' },
  CANCELED: { color: 'error',   label: 'Đã Hủy' },
};

export default function POListPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try { setOrders(await purchaseApi.getAll()); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleReceive = async (id: string) => {
    try {
      await purchaseApi.receive(id);
      message.success('Nhận hàng thành công! Tồn kho đã được cập nhật.');
      fetchOrders();
    } catch (err: any) { message.error(err?.response?.data?.message ?? 'Lỗi nhận hàng'); }
  };

  const handleCancel = async (id: string) => {
    try {
      await purchaseApi.cancel(id);
      message.success('Đã hủy phiếu nhập');
      fetchOrders();
    } catch (err: any) { message.error(err?.response?.data?.message ?? 'Lỗi hủy phiếu'); }
  };

  const columns = [
    { title: 'ID Phiếu', dataIndex: 'id', key: 'id', render: (v: string) => <Text code style={{ fontSize: 11 }}>{v.slice(0, 8)}...</Text> },
    { title: 'Nhà Cung Cấp', dataIndex: 'supplierName', key: 'supplier', render: (v: string) => <Text strong>{v}</Text> },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (v: keyof typeof statusConfig) => <Tag color={statusConfig[v]?.color}>{statusConfig[v]?.label}</Tag>,
      filters: Object.entries(statusConfig).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (value: unknown, record: PurchaseOrder) => record.status === value,
    },
    { title: 'Tổng Tiền Nhập', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => <Text strong style={{ color: '#10B981' }}>{v?.toLocaleString('vi-VN')} ₫</Text>, sorter: (a: PurchaseOrder, b: PurchaseOrder) => a.totalAmount - b.totalAmount },
    { title: 'Ngày Dự Kiến', dataIndex: 'expectedDate', key: 'expectedDate', render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '—' },
    { title: 'Ngày Tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => new Date(v).toLocaleDateString('vi-VN') },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: PurchaseOrder) => (
        <Space>
          <Tooltip title="Chi tiết"><Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/purchase/${record.id}`)} /></Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Popconfirm title="Xác nhận đã nhận hàng? Tồn kho sẽ được cộng thêm." onConfirm={() => handleReceive(record.id)} okText="Nhận Hàng">
                <Tooltip title="Nhận Hàng"><Button size="small" type="primary" icon={<CheckCircleOutlined />} style={{ background: '#10B981', border: 'none' }} /></Tooltip>
              </Popconfirm>
              <Popconfirm title="Hủy phiếu nhập này?" onConfirm={() => handleCancel(record.id)} okText="Hủy" okButtonProps={{ danger: true }}>
                <Tooltip title="Hủy Phiếu"><Button size="small" danger icon={<CloseCircleOutlined />} /></Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Phiếu Nhập Hàng</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/purchase/create')}
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none' }}>
          Tạo Phiếu Nhập
        </Button>
      </div>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} phiếu` }} />
      </Card>
    </>
  );
}
