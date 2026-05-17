import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Select, Space, Button, message, Modal, Form, InputNumber, Input } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import { productApi } from '../../api/productApi';
import { storageApi } from '../../api/storageApi';
import { inventoryApi } from '../../api/inventoryApi';
import type { Product, ProductVariant, StorageLocation, StockLevel } from '../../types';

const { Title, Text } = Typography;

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [stockLevels, setStockLevels] = useState<Record<string, StockLevel[]>>({});
  const [loading, setLoading] = useState(true);
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; variant?: ProductVariant }>({ open: false });
  const [form] = Form.useForm();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prods, locs] = await Promise.all([productApi.getAll(), storageApi.getAll()]);
      setProducts(prods);
      setLocations(locs);

      // Fetch stock levels for each variant
      const allVariants = prods.flatMap((p) => p.variants ?? []);
      const results = await Promise.all(
        allVariants.map((v) => inventoryApi.getStockByVariant(v.id).catch(() => []))
      );
      const map: Record<string, StockLevel[]> = {};
      allVariants.forEach((v, i) => { map[v.id] = results[i]; });
      setStockLevels(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdjust = async (values: { storageLocationId: string; actualQuantity: number; reason: string }) => {
    try {
      await inventoryApi.adjust({ variantId: adjustModal.variant!.id, ...values });
      message.success('Điều chỉnh tồn kho thành công!');
      setAdjustModal({ open: false });
      form.resetFields();
      fetchAll();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Điều chỉnh thất bại');
    }
  };

  // Flatten all variants into rows
  const tableData = products.flatMap((p) =>
    (p.variants ?? []).map((v) => ({ ...v, productName: p.name, productId: p.id }))
  );

  const columns = [
    { title: 'Sản Phẩm', dataIndex: 'productName', key: 'productName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v: string) => <Text code>{v}</Text> },
    { title: 'Màu / Size', key: 'variant', render: (_: unknown, r: any) => `${r.color ?? ''} ${r.size ?? ''}`.trim() || '—' },
    { title: 'Tổng Kho', dataIndex: 'totalStock', key: 'totalStock', render: (v: number) => <Tag color={v > 0 ? 'green' : 'default'}>{v}</Tag> },
    { title: 'Có Thể Bán', dataIndex: 'availableStock', key: 'availableStock', render: (v: number) => <Tag color={v > 0 ? 'cyan' : 'warning'}>{v}</Tag> },
    {
      title: 'Phân Bổ Theo Kho',
      key: 'stockLevels',
      render: (_: unknown, r: any) => {
        const levels = stockLevels[r.id] ?? [];
        return levels.length === 0
          ? <Text type="secondary">Chưa nhập kho</Text>
          : <Space wrap>{levels.map((sl) => <Tag key={sl.storageLocationId}>{sl.storageLocationName}: <strong>{sl.quantity}</strong></Tag>)}</Space>;
      },
    },
    {
      title: 'Kiểm Kho',
      key: 'actions',
      render: (_: unknown, record: any) => (
        <Button size="small" icon={<ToolOutlined />} onClick={() => { setAdjustModal({ open: true, variant: record }); form.resetFields(); }}>
          Điều Chỉnh
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản Lý Tồn Kho</Title>
        <Text type="secondary">{tableData.length} SKU đang theo dõi</Text>
      </div>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          dataSource={tableData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15 }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        open={adjustModal.open}
        title={`Điều Chỉnh Tồn Kho: ${adjustModal.variant?.sku}`}
        onCancel={() => setAdjustModal({ open: false })}
        onOk={() => form.submit()}
        okText="Xác Nhận"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleAdjust} style={{ marginTop: 16 }}>
          <Form.Item label="Kho" name="storageLocationId" rules={[{ required: true, message: 'Chọn kho' }]}>
            <Select placeholder="Chọn kho hàng">
              {locations.map((l) => <Select.Option key={l.id} value={l.id}>{l.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Số Lượng Thực Tế (sau kiểm kho)" name="actualQuantity" rules={[{ required: true, message: 'Nhập số lượng' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Lý Do" name="reason">
            <Input.TextArea rows={2} placeholder="Ví dụ: Kiểm kho định kỳ tháng 5..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
