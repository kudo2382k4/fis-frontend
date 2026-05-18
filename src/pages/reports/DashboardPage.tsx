import { useEffect, useState } from 'react';
import {
  Row, Col, Card, Statistic, Typography, Table, Tag, Spin, DatePicker,
  Avatar, Progress, Badge,
} from 'antd';
import {
  ShoppingCartOutlined,
  InboxOutlined,
  WarningOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { reportApi } from '../../api/reportApi';
import type { DailyRevenue, LowStockAlert, TopSellingProduct, RecentOrder, TopCustomer } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  COMPLETED: { color: 'success', label: 'Hoàn thành' },
  PENDING: { color: 'warning', label: 'Chờ xử lý' },
  CANCELED: { color: 'error', label: 'Đã huỷ' },
};

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#6366F1', '#10B981'];
const RANK_ICONS = ['👑', '🥈', '🥉', '4️⃣', '5️⃣'];

export default function DashboardPage() {
  const [revenue, setRevenue] = useState<DailyRevenue[]>([]);
  const [lowStock, setLowStock] = useState<LowStockAlert[]>([]);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const from = dateRange[0].format('YYYY-MM-DD');
      const to = dateRange[1].format('YYYY-MM-DD');
      const [rev, ls, tp, ro, tc] = await Promise.all([
        reportApi.getDailyRevenue(from, to),
        reportApi.getLowStock(),
        reportApi.getTopSellingProducts(from, to, 5),
        reportApi.getRecentOrders(10),
        reportApi.getTopCustomers(5),
      ]);
      setRevenue(rev);
      setLowStock(ls);
      setTopProducts(tp);
      setRecentOrders(ro);
      setTopCustomers(tc);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  const totalRevenue = revenue.reduce((s, r) => s + r.totalRevenue, 0);
  const totalOrders = revenue.reduce((s, r) => s + r.totalOrders, 0);

  const maxQtySold = topProducts.length > 0 ? topProducts[0].totalQuantitySold : 1;
  const maxSpent = topCustomers.length > 0 ? topCustomers[0].totalSpent : 1;

  const lowStockCols = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v: string) => <Text code>{v}</Text> },
    { title: 'Sản Phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Màu / Size', key: 'variant', render: (_: unknown, r: LowStockAlert) => `${r.color ?? ''} ${r.size ?? ''}`.trim() || '—' },
    { title: 'Tồn Kho', dataIndex: 'availableStock', key: 'availableStock', render: (v: number) => <Tag color="error">{v}</Tag> },
    { title: 'Ngưỡng', dataIndex: 'lowStockThreshold', key: 'lowStockThreshold' },
  ];

  const recentOrderCols = [
    {
      title: 'Khách Hàng',
      key: 'customer',
      render: (_: unknown, r: RecentOrder) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={32} icon={<UserOutlined />} style={{ background: '#6366F1' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.customerName}</div>
            <div style={{ color: '#9CA3AF', fontSize: 11 }}>{r.customerPhone}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => {
        const cfg = STATUS_CONFIG[v] ?? { color: 'default', label: v };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => (
        <Text strong style={{ color: '#6366F1' }}>
          {v?.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(v).format('DD/MM HH:mm')}
        </Text>
      ),
    },
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

      {/* Revenue Chart + Low Stock */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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

      {/* Top Selling Products + Recent Orders */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Top Selling Products */}
        <Col xs={24} lg={10}>
          <Card
            title={<><FireOutlined style={{ color: '#EF4444' }} /> Sản Phẩm Bán Chạy</>}
            extra={<Text type="secondary" style={{ fontSize: 12 }}>Trong kỳ chọn</Text>}
            bordered={false}
            style={{ borderRadius: 12, height: '100%' }}
          >
            {topProducts.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Text type="secondary">Chưa có dữ liệu</Text>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {topProducts.map((p, idx) => (
                  <div key={p.sku} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: RANK_COLORS[idx] + '22',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {RANK_ICONS[idx]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text strong style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.productName}
                        </Text>
                        <Text style={{ color: RANK_COLORS[idx], fontWeight: 700, marginLeft: 8, flexShrink: 0 }}>
                          {p.totalQuantitySold} sp
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Progress
                          percent={Math.round((p.totalQuantitySold / maxQtySold) * 100)}
                          showInfo={false}
                          strokeColor={RANK_COLORS[idx]}
                          size="small"
                          style={{ flex: 1, margin: 0 }}
                        />
                        <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>
                          {p.totalRevenue?.toLocaleString('vi-VN')} ₫
                        </Text>
                      </div>
                      <Text code style={{ fontSize: 10 }}>
                        {p.sku}{p.color ? ` · ${p.color}` : ''}{p.size ? ` · ${p.size}` : ''}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24} lg={14}>
          <Card
            title={<><ClockCircleOutlined style={{ color: '#6366F1' }} /> Đơn Hàng Gần Đây</>}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Table
              dataSource={recentOrders}
              columns={recentOrderCols}
              rowKey="orderId"
              pagination={{ pageSize: 6, size: 'small', showSizeChanger: false }}
              size="small"
              locale={{ emptyText: 'Chưa có đơn hàng nào' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Top Customers */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title={<><CrownOutlined style={{ color: '#FFD700' }} /> Khách Hàng Thân Thiết</>}
            extra={<Text type="secondary" style={{ fontSize: 12 }}>Xếp hạng theo tổng chi tiêu</Text>}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            {topCustomers.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Text type="secondary">Chưa có dữ liệu</Text>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {topCustomers.map((c, idx) => (
                  <Col xs={24} sm={12} md={8} lg={24 / topCustomers.length} key={c.customerId}>
                    <div style={{
                      padding: '16px 20px',
                      borderRadius: 12,
                      background: idx === 0
                        ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                        : idx === 1
                          ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
                          : idx === 2
                            ? 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'
                            : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      color: '#fff',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute', top: -10, right: -10,
                        fontSize: 48, opacity: 0.15, lineHeight: 1,
                      }}>
                        {RANK_ICONS[idx]}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <Avatar
                          size={40}
                          style={{ background: 'rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, fontSize: 16 }}
                        >
                          {c.customerName.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{c.customerName}</div>
                          <div style={{ opacity: 0.85, fontSize: 12 }}>{c.customerPhone}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ opacity: 0.8, fontSize: 11, marginBottom: 2 }}>Tổng Chi Tiêu</div>
                          <div style={{ fontWeight: 800, fontSize: 15 }}>
                            {c.totalSpent?.toLocaleString('vi-VN')} ₫
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ opacity: 0.8, fontSize: 11, marginBottom: 2 }}>Số Đơn</div>
                          <div style={{ fontWeight: 700, fontSize: 18 }}>{c.totalOrders}</div>
                        </div>
                      </div>
                      <Progress
                        percent={Math.round((c.totalSpent / maxSpent) * 100)}
                        showInfo={false}
                        strokeColor="rgba(255,255,255,0.9)"
                        trailColor="rgba(255,255,255,0.25)"
                        size="small"
                        style={{ marginTop: 10, marginBottom: 0 }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </Spin>
  );
}
