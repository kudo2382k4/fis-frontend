import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, InputNumber, Divider, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { VariantImageUpload } from '../../components/VariantImageUpload';
import type { ProductRequest } from '../../types';

const { Title } = Typography;

export default function CreateProductPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: ProductRequest) => {
    setLoading(true);
    try {
      await productApi.create(values);
      message.success('Tạo sản phẩm thành công!');
      navigate('/products');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Tạo sản phẩm thất bại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Tạo Sản Phẩm Mới</Title>
        <Button onClick={() => navigate('/products')}>Quay Lại</Button>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ variants: [{}] }}>
        <Card title="Thông Tin Sản Phẩm" bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
          <Form.Item label="Tên Sản Phẩm" name="name" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
            <Input placeholder="Ví dụ: Áo Thun Nam Oversize" size="large" />
          </Form.Item>
          <Form.Item label="Mô Tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về sản phẩm..." />
          </Form.Item>
        </Card>

        <Card
          title="Biến Thể (SKU)"
          bordered={false}
          style={{ borderRadius: 12 }}
          extra={<Typography.Text type="secondary">Thêm ít nhất 1 biến thể</Typography.Text>}
        >
          <Form.List name="variants" rules={[{ validator: async (_, v) => !v?.length ? Promise.reject('Cần ít nhất 1 biến thể') : Promise.resolve() }]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <div key={key} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, marginBottom: 12, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Typography.Text strong>Biến Thể #{name + 1}</Typography.Text>
                      {fields.length > 1 && (
                        <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)}>Xóa</Button>
                      )}
                    </div>

                    {/* Ảnh + Các trường thông tin */}
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      {/* Upload ảnh biến thể */}
                      <Form.Item {...rest} label="Ảnh Biến Thể" name={[name, 'imageUrl']} style={{ marginBottom: 0 }}>
                        <VariantImageUpload />
                      </Form.Item>

                      {/* Các trường thông tin */}
                      <Space wrap size={[16, 0]} style={{ flex: 1 }}>
                        <Form.Item {...rest} label="SKU" name={[name, 'sku']} rules={[{ required: true, message: 'Nhập SKU' }]} style={{ minWidth: 180 }}>
                          <Input placeholder="VD: AT-NAM-XL-TRANG" />
                        </Form.Item>
                        <Form.Item {...rest} label="Màu Sắc" name={[name, 'color']} style={{ minWidth: 130 }}>
                          <Input placeholder="Trắng" />
                        </Form.Item>
                        <Form.Item {...rest} label="Kích Cỡ" name={[name, 'size']} style={{ minWidth: 100 }}>
                          <Input placeholder="XL" />
                        </Form.Item>
                        <Form.Item {...rest} label="Giá Bán (₫)" name={[name, 'price']} rules={[{ required: true, message: 'Nhập giá' }]} style={{ minWidth: 140 }}>
                          <InputNumber min={0} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                        <Form.Item {...rest} label="Giá Nhập (₫)" name={[name, 'cost']} rules={[{ required: true, message: 'Nhập giá nhập' }]} style={{ minWidth: 140 }}>
                          <InputNumber min={0} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                        <Form.Item {...rest} label="Ngưỡng Cảnh Báo" name={[name, 'lowStockThreshold']} initialValue={5} style={{ minWidth: 140 }}>
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Space>
                    </div>
                  </div>
                ))}
                <Form.ErrorList errors={errors} />
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()} style={{ marginTop: 8 }}>
                  Thêm Biến Thể
                </Button>
              </>
            )}
          </Form.List>

          <Divider />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => navigate('/products')}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none' }}>
              Tạo Sản Phẩm
            </Button>
          </div>
        </Card>
      </Form>
    </>
  );
}
