import { useEffect, useState } from 'react';
import {
  Card, Typography, Button, Tag, Spin, Row, Col, Breadcrumb,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import type { Product, ProductVariant } from '../../types';

const { Title, Text } = Typography;

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <Tag color="error">Hết hàng</Tag>;
  if (stock <= 5) return <Tag color="warning">Sắp hết ({stock})</Tag>;
  return <Tag color="success">{stock} cái</Tag>;
}

function VariantCard({ variant, onClick }: { variant: ProductVariant; onClick: () => void }) {
  const profit = variant.price - variant.cost;
  const margin = variant.cost > 0 ? ((profit / variant.cost) * 100).toFixed(0) : '—';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, #1e1e2e 0%, #1a1a2e 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 16,
        padding: 0,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        position: 'relative',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(99,102,241,0.6)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(99,102,241,0.2)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(99,102,241,0.2)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', height: 180 }}>
        {variant.imageUrl ? (
          <img
            src={variant.imageUrl}
            alt={variant.sku}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ fontSize: 40 }}>📦</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Chưa có ảnh</Text>
          </div>
        )}
        {/* Stock badge overlay */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <StockBadge stock={variant.availableStock} />
        </div>
      </div>

      {/* Info area */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text code style={{ fontSize: 12, color: '#818CF8' }}>{variant.sku}</Text>
          <RightOutlined style={{ color: '#6366F1', fontSize: 12 }} />
        </div>

        {/* Color & Size tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {variant.color && (
            <Tag style={{ borderRadius: 20, fontSize: 11, padding: '0 8px', margin: 0 }}>
              🎨 {variant.color}
            </Tag>
          )}
          {variant.size && (
            <Tag color="geekblue" style={{ borderRadius: 20, fontSize: 11, padding: '0 8px', margin: 0 }}>
              📐 {variant.size}
            </Tag>
          )}
          {!variant.color && !variant.size && (
            <Text type="secondary" style={{ fontSize: 12 }}>Không có thuộc tính</Text>
          )}
        </div>

        {/* Pricing */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Giá Bán</Text>
            <Text strong style={{ color: '#10B981', fontSize: 15 }}>
              {variant.price?.toLocaleString('vi-VN')} ₫
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Giá Nhập</Text>
            <Text style={{ color: '#F59E0B', fontSize: 14 }}>
              {variant.cost?.toLocaleString('vi-VN')} ₫
            </Text>
          </div>
        </div>

        {/* Margin */}
        <div style={{
          background: profit >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          borderRadius: 8, padding: '4px 10px',
          display: 'flex', justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Lợi nhuận</Text>
          <Text style={{ fontSize: 12, fontWeight: 600, color: profit >= 0 ? '#10B981' : '#EF4444' }}>
            +{profit?.toLocaleString('vi-VN')} ₫ ({margin}%)
          </Text>
        </div>

        {/* Stock info */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Tổng Kho</Text>
            <Text strong style={{ fontSize: 13 }}>{variant.totalStock}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Có Thể Bán</Text>
            <Text strong style={{ fontSize: 13, color: '#6366F1' }}>{variant.availableStock}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Ngưỡng</Text>
            <Text strong style={{ fontSize: 13, color: '#F59E0B' }}>{variant.lowStockThreshold}</Text>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('fis_user')
    ? JSON.parse(localStorage.getItem('fis_user')!).role
    : null;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productApi.getById(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Text type="secondary">Không tìm thấy sản phẩm.</Text>
        <br />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/products')}>Quay lại</Button>
      </div>
    );
  }

  const totalStock = product.variants.reduce((s, v) => s + v.totalStock, 0);
  const availableStock = product.variants.reduce((s, v) => s + v.availableStock, 0);

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/products">Sản Phẩm</Link> },
          { title: product.name },
        ]}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/products')}
            style={{ borderRadius: 8 }}
          />
          <div>
            <Title level={3} style={{ margin: 0 }}>{product.name}</Title>
            {product.description && (
              <Text type="secondary" style={{ fontSize: 13 }}>{product.description}</Text>
            )}
          </div>
        </div>
        {role === 'ROLE_OWNER' && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${id}/edit`)}
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none', borderRadius: 8 }}
          >
            Chỉnh Sửa
          </Button>
        )}
      </div>

      {/* Summary KPI cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { icon: <AppstoreOutlined />, label: 'Số Biến Thể', value: `${product.variants.length} SKU`, color: '#6366F1' },
          { icon: <InboxOutlined />, label: 'Tổng Tồn Kho', value: totalStock, color: '#10B981' },
          { icon: <ShoppingOutlined />, label: 'Có Thể Bán', value: availableStock, color: '#3B82F6' },
          { icon: <DollarOutlined />, label: 'Giá Từ', value: `${Math.min(...product.variants.map(v => v.price))?.toLocaleString('vi-VN')} ₫`, color: '#F59E0B' },
        ].map(card => (
          <Col xs={12} sm={6} key={card.label}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#1a1a2e', textAlign: 'center' }}>
              <div style={{ fontSize: 24, color: card.color, marginBottom: 6 }}>{card.icon}</div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{card.label}</Text>
              <Text strong style={{ fontSize: 18, color: card.color }}>{card.value}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Variants Grid */}
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Click vào biến thể để xem chi tiết tồn kho và lịch sử giao dịch
        </Text>
      </div>
      <Row gutter={[16, 16]}>
        {product.variants.map(variant => (
          <Col xs={24} sm={12} md={8} lg={6} key={variant.id}>
            <VariantCard
              variant={variant}
              onClick={() => navigate(`/products/${id}/variants/${variant.id}`)}
            />
          </Col>
        ))}
      </Row>
    </>
  );
}
