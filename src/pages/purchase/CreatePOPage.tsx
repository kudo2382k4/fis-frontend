import { useEffect, useState } from 'react';
import { Form, Button, Card, Typography, Select, Input, InputNumber, Space, message, Divider, DatePicker } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { purchaseApi } from '../../api/purchaseApi';
import { supplierApi } from '../../api/supplierApi';
import { productApi } from '../../api/productApi';
import { storageApi } from '../../api/storageApi';
import type { Supplier, Product, StorageLocation } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function CreatePOPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([supplierApi.getAll(), productApi.getAll(), storageApi.getAll()]).then(([s, p, l]) => {
      setSuppliers(s); setProducts(p); setLocations(l);
    });
  }, []);

  const allVariants = products.flatMap((p) => (p.variants ?? []).map((v) => ({ ...v, productName: p.name })));

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        expectedDate: values.expectedDate ? dayjs(values.expectedDate).format('YYYY-MM-DD') : undefined,
      };
      await purchaseApi.create(payload);
      message.success('Tạo phiếu nhập thành công!');
      navigate('/purchase');
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Tạo phiếu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Tạo Phiếu Nhập Hàng</Title>
        <Button onClick={() => navigate('/purchase')}>Quay Lại</Button>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ items: [{}] }}>
        <Card title="Thông Tin Phiếu" bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
          <Space wrap size={[16, 0]}>
            <Form.Item label="Nhà Cung Cấp" name="supplierId" rules={[{ required: true, message: 'Chọn NCC' }]} style={{ minWidth: 280 }}>
              <Select showSearch placeholder="Tìm nhà cung cấp..." optionFilterProp="label"
                options={suppliers.map((s) => ({ label: s.name, value: s.id }))} />
            </Form.Item>
            <Form.Item label="Ngày Dự Kiến Nhận" name="expectedDate" style={{ minWidth: 200 }}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày..." />
            </Form.Item>
            <Form.Item label="Ghi Chú" name="notes" style={{ minWidth: 300 }}>
              <Input placeholder="Ghi chú phiếu nhập..." />
            </Form.Item>
          </Space>
        </Card>

        <Card title="Hàng Hóa" bordered={false} style={{ borderRadius: 12 }}>
          <Form.List name="items" rules={[{ validator: async (_, v) => !v?.length ? Promise.reject('Cần ít nhất 1 mặt hàng') : Promise.resolve() }]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 12, flexWrap: 'wrap', border: '1px solid rgba(255,255,255,0.08)', padding: 16, borderRadius: 10 }}>
                    <Form.Item {...rest} label="SKU / Biến Thể" name={[name, 'variantId']} rules={[{ required: true, message: 'Chọn SKU' }]} style={{ flex: 2, minWidth: 220 }}>
                      <Select showSearch placeholder="Chọn SKU..." optionFilterProp="label"
                        options={allVariants.map((v) => ({ label: `${v.sku} (${v.productName})`, value: v.id }))} />
                    </Form.Item>
                    <Form.Item {...rest} label="Nhập Vào Kho" name={[name, 'storageLocationId']} rules={[{ required: true, message: 'Chọn kho' }]} style={{ flex: 1, minWidth: 150 }}>
                      <Select placeholder="Kho..." options={locations.map((l) => ({ label: l.name, value: l.id }))} />
                    </Form.Item>
                    <Form.Item {...rest} label="Số Lượng" name={[name, 'quantity']} rules={[{ required: true, message: 'Nhập SL' }]} style={{ width: 100 }}>
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item {...rest} label="Giá Nhập (₫)" name={[name, 'unitCost']} rules={[{ required: true, message: 'Nhập giá' }]} style={{ width: 150 }}>
                      <InputNumber min={0} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} style={{ marginBottom: 24 }} />
                    )}
                  </div>
                ))}
                <Form.ErrorList errors={errors} />
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()} style={{ marginTop: 8 }}>
                  Thêm Mặt Hàng
                </Button>
              </>
            )}
          </Form.List>

          <Divider />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => navigate('/purchase')}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none' }}>
              Tạo Phiếu Nhập
            </Button>
          </div>
        </Card>
      </Form>
    </>
  );
}
