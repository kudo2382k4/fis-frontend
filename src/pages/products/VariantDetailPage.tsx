import { useEffect, useState } from 'react';
import {
  Card, Typography, Button, Tag, Spin, Row, Col, Breadcrumb,
  Table, Divider, Statistic, Timeline, Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  ShopOutlined,
  SwapOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { inventoryApi } from '../../api/inventoryApi';
import type { Product, ProductVariant, StockLevel, InventoryTransaction } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TX_TYPE_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  IN:         { color: '#10B981', label: 'Nhập Kho',    icon: <ArrowUpOutlined /> },
  OUT:        { color: '#EF4444', label: 'Xuất Kho',    icon: <ArrowDownOutlined /> },
  ADJUSTMENT: { color: '#F59E0B', label: 'Điều Chỉnh',  icon: <SyncOutlined /> },
  TRANSFER:   { color: '#6366F1', label: 'Chuyển Kho',  icon: <SwapOutlined /> },
};

export default function VariantDetailPage() {
  const { id, variantId } = useParams<{ id: string; variantId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !variantId) return;
    setLoading(true);
    Promise.all([
      productApi.getById(id),
      inventoryApi.getStockByVariant(variantId),
      inventoryApi.getTransactions(variantId),
    ]).then(([prod, stock, txs]) => {
      setProduct(prod);
      const found = prod.variants.find(v => v.id === variantId) ?? null;
      setVariant(found);
      setStockLevels(stock);
      setTransactions(txs);
    }).finally(() => setLoading(false));
  }, [id, variantId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product || !variant) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Text type="secondary">Không tìm thấy biến thể.</Text>
        <br />
        <Button style={{ marginTop: 16 }} onClick={() => navigate(`/products/${id}`)}>Quay lại</Button>
      </div>
    );
  }

  const profit = variant.price - variant.cost;
  const margin = variant.cost > 0 ? ((profit / variant.cost) * 100).toFixed(1) : '—';

  const stockCols = [
    {
      title: 'Kho Hàng',
      dataIndex: 'storageLocationName',
      key: 'storageLocationName',
      render: (v: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShopOutlined style={{ color: '#6366F1' }} />
          <Text strong>{v}</Text>
        </div>
      ),
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (v: number) => (
        <Tag
          color={v <= 0 ? 'error' : v <= 5 ? 'warning' : 'success'}
          style={{ fontSize: 13, fontWeight: 700, padding: '2px 10px' }}
        >
          {v} cái
        </Tag>
      ),
    },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/products">Sản Phẩm</Link> },
          { title: <Link to={`/products/${id}`}>{product.name}</Link> },
          { title: variant.sku },
        ]}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/products/${id}`)}
          style={{ borderRadius: 8 }}
        />
        <div>
          <Title level={3} style={{ margin: 0 }}>Chi Tiết Biến Thể</Title>
          <Text type="secondary">{product.name}</Text>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {/* Left column: variant info + image */}
        <Col xs={24} lg={8}>
          {/* Variant Image */}
          <Card bordered={false} style={{ borderRadius: 16, marginBottom: 16, overflow: 'hidden', padding: 0 }}>
            {variant.imageUrl ? (
              <div style={{ height: 260, overflow: 'hidden' }}>
                <img
                  src={variant.imageUrl}
                  alt={variant.sku}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div style={{
                height: 260, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.03)', gap: 12,
              }}>
                <div style={{ fontSize: 60 }}>📦</div>
                <Text type="secondary">Chưa có ảnh</Text>
              </div>
            )}
          </Card>

          {/* Variant Attributes */}
          <Card
            bordered={false}
            style={{ borderRadius: 16, background: 'linear-gradient(135deg, #1e1e2e, #1a1a2e)' }}
            title={<Text style={{ color: '#818CF8' }}>Thông Tin Biến Thể</Text>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Row>
                <Col span={10}><Text type="secondary">SKU</Text></Col>
                <Col span={14}><Text code style={{ color: '#818CF8' }}>{variant.sku}</Text></Col>
              </Row>
              <Row>
                <Col span={10}><Text type="secondary">Màu Sắc</Text></Col>
                <Col span={14}>
                  {variant.color
                    ? <Tag style={{ borderRadius: 20 }}>🎨 {variant.color}</Tag>
                    : <Text type="secondary">—</Text>}
                </Col>
              </Row>
              <Row>
                <Col span={10}><Text type="secondary">Kích Cỡ</Text></Col>
                <Col span={14}>
                  {variant.size
                    ? <Tag color="geekblue" style={{ borderRadius: 20 }}>📐 {variant.size}</Tag>
                    : <Text type="secondary">—</Text>}
                </Col>
              </Row>
              <Row>
                <Col span={10}><Text type="secondary">Ngưỡng Cảnh Báo</Text></Col>
                <Col span={14}><Tag color="orange">{variant.lowStockThreshold} cái</Tag></Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* Right column: pricing + stock + transactions */}
        <Col xs={24} lg={16}>
          {/* Pricing cards */}
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Giá Bán</Text>
                <Text strong style={{ fontSize: 20, color: '#10B981' }}>
                  {variant.price?.toLocaleString('vi-VN')} ₫
                </Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Giá Nhập</Text>
                <Text strong style={{ fontSize: 20, color: '#F59E0B' }}>
                  {variant.cost?.toLocaleString('vi-VN')} ₫
                </Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: profit >= 0 ? 'rgba(99,102,241,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${profit >= 0 ? 'rgba(99,102,241,0.2)' : 'rgba(239,68,68,0.2)'}`, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Lợi Nhuận</Text>
                <Text strong style={{ fontSize: 20, color: profit >= 0 ? '#6366F1' : '#EF4444' }}>
                  {profit?.toLocaleString('vi-VN')} ₫
                </Text>
                <Text style={{ fontSize: 11, color: '#9CA3AF', display: 'block' }}>Margin {margin}%</Text>
              </Card>
            </Col>
          </Row>

          {/* Stock summary */}
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center', background: '#1a1a2e' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: 12 }}>Tổng Tồn Kho</Text>}
                  value={variant.totalStock}
                  suffix="cái"
                  valueStyle={{ color: '#3B82F6', fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center', background: '#1a1a2e' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: 12 }}>Có Thể Bán</Text>}
                  value={variant.availableStock}
                  suffix="cái"
                  valueStyle={{ color: variant.availableStock > 0 ? '#10B981' : '#EF4444', fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>

          {/* Stock by warehouse */}
          <Card
            title={<><ShopOutlined style={{ color: '#6366F1', marginRight: 8 }} />Tồn Kho Theo Kho</>}
            bordered={false}
            style={{ borderRadius: 16, marginBottom: 16 }}
          >
            {stockLevels.length === 0 ? (
              <Empty description="Chưa có dữ liệu tồn kho" />
            ) : (
              <Table
                dataSource={stockLevels}
                columns={stockCols}
                rowKey="storageLocationId"
                pagination={false}
                size="middle"
              />
            )}
          </Card>

          {/* Transaction history */}
          <Card
            title={<><ClockCircleOutlined style={{ color: '#F59E0B', marginRight: 8 }} />Lịch Sử Giao Dịch</>}
            bordered={false}
            style={{ borderRadius: 16 }}
          >
            {transactions.length === 0 ? (
              <Empty description="Chưa có giao dịch nào" />
            ) : (
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                <Timeline
                  style={{ paddingTop: 8 }}
                  items={transactions.slice(0, 20).map(tx => {
                    const cfg = TX_TYPE_CONFIG[tx.transactionType] ?? { color: '#6B7280', label: tx.transactionType, icon: null };
                    const isPositive = tx.quantityChanged > 0;
                    return {
                      color: cfg.color,
                      dot: <span style={{ color: cfg.color, fontSize: 14 }}>{cfg.icon}</span>,
                      children: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 4 }}>
                          <div>
                            <Tag
                              style={{ borderRadius: 20, fontSize: 11, marginBottom: 2 }}
                              color={cfg.color}
                            >
                              {cfg.label}
                            </Tag>
                            <div>
                              <Text
                                strong
                                style={{ color: isPositive ? '#10B981' : '#EF4444', fontSize: 15, marginRight: 6 }}
                              >
                                {isPositive ? '+' : ''}{tx.quantityChanged}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>cái</Text>
                            </div>
                            {tx.performedBy && (
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                Bởi: {tx.performedBy}
                              </Text>
                            )}
                          </div>
                          <Text type="secondary" style={{ fontSize: 11, textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                            {dayjs(tx.createdAt).format('DD/MM/YYYY')}
                            <br />
                            {dayjs(tx.createdAt).format('HH:mm')}
                          </Text>
                        </div>
                      ),
                    };
                  })}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}
