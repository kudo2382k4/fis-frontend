import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Alert, Progress } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { reportApi } from '../../api/reportApi';
import type { LowStockAlert } from '../../types';

const { Title, Text } = Typography;

export default function LowStockPage() {
  const [data, setData] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi.getLowStock().then(setData).finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v: string) => <Text code>{v}</Text> },
    { title: 'Sản Phẩm', dataIndex: 'productName', key: 'productName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Màu / Size', key: 'variant', render: (_: unknown, r: LowStockAlert) => `${r.color ?? ''} ${r.size ?? ''}`.trim() || '—' },
    {
      title: 'Tồn Kho Còn',
      dataIndex: 'availableStock',
      key: 'availableStock',
      render: (v: number, r: LowStockAlert) => (
        <div style={{ minWidth: 120 }}>
          <Tag color={v === 0 ? 'error' : 'warning'} icon={<WarningOutlined />}>{v} còn lại</Tag>
          <Progress
            percent={Math.round((v / (r.lowStockThreshold || 1)) * 100)}
            size="small"
            status={v === 0 ? 'exception' : 'active'}
            showInfo={false}
            style={{ marginTop: 4 }}
            strokeColor={v === 0 ? '#ff4d4f' : '#faad14'}
          />
        </div>
      ),
    },
    {
      title: 'Ngưỡng Cảnh Báo',
      dataIndex: 'lowStockThreshold',
      key: 'lowStockThreshold',
      render: (v: number) => <Tag>{v}</Tag>,
    },
    {
      title: 'Mức Độ',
      key: 'level',
      render: (_: unknown, r: LowStockAlert) =>
        r.availableStock === 0
          ? <Tag color="error">Hết Hàng</Tag>
          : <Tag color="warning">Sắp Hết</Tag>,
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Cảnh Báo Hàng Sắp Hết</Title>
      </div>

      {data.length > 0 && (
        <Alert
          message={`Có ${data.length} SKU đang ở mức tồn kho thấp hoặc hết hàng. Cần nhập hàng sớm!`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="variantId"
          loading={loading}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: '🎉 Tất cả hàng hóa đang đủ tồn kho!' }}
        />
      </Card>
    </>
  );
}
