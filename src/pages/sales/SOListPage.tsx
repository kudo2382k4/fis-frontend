import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Space, Button, message, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { salesApi } from '../../api/salesApi';
import { exportOrders } from '../../utils/exportExcel';
import type { SalesOrder } from '../../types';

const { Title, Text } = Typography;

const statusConfig = {
  PENDING:   { color: 'gold',    label: 'Chờ Xử Lý' },
  COMPLETED: { color: 'success', label: 'Hoàn Thành' },
  CANCELED:  { color: 'error',   label: 'Đã Hủy' },
};

export default function SOListPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try { setOrders(await salesApi.getAll()); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleProcess = async (id: string) => {
    try {
      await salesApi.process(id);
      message.success('Đơn hàng đã hoàn thành!');
      fetchOrders();
    } catch (err: any) { message.error(err?.response?.data?.message ?? 'Lỗi xử lý đơn'); }
  };

  const handleCancel = async (id: string) => {
    try {
      await salesApi.cancel(id);
      message.success('Đã hủy đơn hàng');
      fetchOrders();
    } catch (err: any) { message.error(err?.response?.data?.message ?? 'Lỗi hủy đơn'); }
  };

  const columns = [
    { title: 'ID Đơn', dataIndex: 'id', key: 'id', render: (v: string) => <Text code style={{ fontSize: 11 }}>{v.slice(0, 8)}...</Text> },
    { title: 'Khách Hàng', dataIndex: 'customerName', key: 'customerName', render: (v: string, r: SalesOrder) => <div><Text strong>{v}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>{r.customerPhone}</Text></div> },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (v: keyof typeof statusConfig) => <Tag color={statusConfig[v]?.color}>{statusConfig[v]?.label}</Tag>,
      filters: Object.entries(statusConfig).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (value: unknown, record: SalesOrder) => record.status === value,
    },
    { title: 'Tổng Tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => <Text strong style={{ color: '#6366F1' }}>{v?.toLocaleString('vi-VN')} ₫</Text>, sorter: (a: SalesOrder, b: SalesOrder) => a.totalAmount - b.totalAmount },
    { title: 'Ngày Tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => new Date(v).toLocaleDateString('vi-VN'), sorter: (a: SalesOrder, b: SalesOrder) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: SalesOrder) => (
        <Space>
          <Tooltip title="Chi tiết"><Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/sales/${record.id}`)} /></Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Popconfirm title="Xác nhận hoàn thành đơn?" onConfirm={() => handleProcess(record.id)} okText="Xác Nhận" cancelText="Hủy">
                <Tooltip title="Hoàn Thành"><Button size="small" type="primary" icon={<CheckCircleOutlined />} /></Tooltip>
              </Popconfirm>
              <Popconfirm title="Hủy đơn hàng này?" onConfirm={() => handleCancel(record.id)} okText="Hủy Đơn" cancelText="Không" okButtonProps={{ danger: true }}>
                <Tooltip title="Hủy Đơn"><Button size="small" danger icon={<CloseCircleOutlined />} /></Tooltip>
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
        <Title level={4} style={{ margin: 0 }}>Danh Sách Đơn Hàng</Title>
        <Space>
          <Button
            icon={<FileExcelOutlined />}
            onClick={() => exportOrders(orders)}
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#fff' }}
          >
            Xuất Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/sales/create')}
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none' }}>
            Tạo Đơn Hàng
          </Button>
        </Space>
      </div>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} đơn hàng` }} />
      </Card>
    </>
  );
}
