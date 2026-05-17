import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Spin, DatePicker } from 'antd';
import {
  ShoppingCartOutlined,
  InboxOutlined,
  WarningOutlined,
  DollarOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportApi } from '../../api/reportApi';
import type { DailyRevenue, LowStockAlert } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function DashboardPage() {
  const [revenue, setRevenue] = useState<DailyRevenue[]>([]);
  const [lowStock, setLowStock] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rev, ls] = await Promise.all([
        reportApi.getDailyRevenue(dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD')),
        reportApi.getLowStock(),
      ]);
      setRevenue(rev);
      setLowStock(ls);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  const totalRevenue = revenue.reduce((s, r) => s + r.totalRevenue, 0);
  const totalOrders = revenue.reduce((s, r) => s + r.totalOrders, 0);

  const lowStockCols = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v: string) => <Text code>{v}</Text> },
    { title: 'Sản Phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Màu / Size', key: 'variant', render: (_: unknown, r: LowStockAlert) => `${r.color ?? ''} ${r.size ?? ''}`.trim() || '—' },
    { title: 'Tồn Kho', dataIndex: 'availableStock', key: 'availableStock', render: (v: number) => <Tag color="error">{v}</Tag> },
    { title: 'Ngưỡng', dataIndex: 'lowStockThreshold', key: 'lowStockThreshold' },
  ];

  const kpiCards = [
    { title: 'Tổng Doanh Thu', value: totalRevenue, prefix: <DollarOutlined />, suffix: '₫', color: '#6366F1', formatter: (v: number) => v.toLocaleString('vi-VN') },
    { title: 'Số Đơn Hoàn Thành', value: totalOrders, prefix: <ShoppingCartOutlined />, color: '#10B981' },
    { title: 'SKU Sắp Hết Hàng', value: lowStock.length, prefix: <WarningOutlined />, color: '#F59E0B' },
    { title: 'Tổng SKU Theo Dõi', value: '-', prefix: <InboxOutlined />, color: '#8B5CF6' },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
        <RangePicker
          value={dateRange}
          onChange={(v) => v && setDateRange(v as [dayjs.Dayjs, dayjs.Dayjs])}
          format="DD/MM/YYYY"
        />
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title={<Text type="secondary" style={{ fontSize: 13 }}>{card.title}</Text>}
                value={card.value}
                prefix={<span style={{ color: card.color }}>{card.prefix}</span>}
                suffix={card.suffix}
                valueStyle={{ color: card.color, fontWeight: 700, fontSize: 24 }}
                formatter={card.formatter as any}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <ArrowUpOutlined style={{ color: '#10B981' }} /> Trong kỳ được chọn
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Revenue Chart */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Doanh Thu Theo Ngày" bordered={false} style={{ borderRadius: 12 }}>
            {revenue.length === 0 ? (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">Chưa có dữ liệu trong kỳ này</Text>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenue.map(r => ({ ...r, date: dayjs(r.date).format('DD/MM'), totalRevenue: r.totalRevenue / 1000 }))}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}K`} />
                  <Tooltip formatter={(v: any) => [`${(Number(v) * 1000).toLocaleString('vi-VN')} ₫`, 'Doanh thu']} />
                  <Area type="monotone" dataKey="totalRevenue" stroke="#6366F1" strokeWidth={2} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<><WarningOutlined style={{ color: '#F59E0B' }} /> Hàng Sắp Hết</>} bordered={false} style={{ borderRadius: 12 }}>
            <Table
              dataSource={lowStock.slice(0, 6)}
              columns={lowStockCols}
              rowKey="variantId"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
}
