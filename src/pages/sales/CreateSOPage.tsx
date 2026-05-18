import { useEffect, useState, useCallback } from 'react';
import {
  Form, Button, Card, Typography, Select, Input,
  InputNumber, Space, message, Divider, Alert, Tag, Modal,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined, WarningOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { salesApi } from '../../api/salesApi';
import { customerApi } from '../../api/customerApi';
import { productApi } from '../../api/productApi';
import { inventoryApi } from '../../api/inventoryApi';
import type { Customer, Product, StockLevel } from '../../types';

const { Title, Text } = Typography;

// State riêng cho từng dòng item trong đơn hàng
interface ItemState {
  // Danh sách kho có hàng của variant đang chọn
  availableLocations: StockLevel[];
  // Giá bán gốc của variant (để tự tính đơn giá)
  unitPriceBase: number;
  // Cảnh báo hết hàng
  outOfStock: boolean;
}

export default function CreateSOPage() {
  const [form] = Form.useForm();
  const [newCustForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [itemStates, setItemStates] = useState<Record<number, ItemState>>({});
  // Modal tạo khách mới
  const [showNewCust, setShowNewCust] = useState(false);
  const [custLoading, setCustLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([customerApi.getAll(), productApi.getAll()]).then(([c, p]) => {
      setCustomers(c);
      setProducts(p);
    });
  }, []);

  // Flatten tất cả variants từ tất cả sản phẩm
  const allVariants = products.flatMap((p) =>
    (p.variants ?? []).map((v) => ({ ...v, productName: p.name }))
  );

  // Khi user chọn 1 SKU trong dòng `fieldName`
  const handleVariantChange = useCallback(async (variantId: string, fieldName: number) => {
    const variant = allVariants.find((v) => v.id === variantId);
    if (!variant) return;

    // Reset kho + đơn giá của dòng này
    const items = form.getFieldValue('items') as any[];
    items[fieldName] = {
      ...items[fieldName],
      variantId,
      storageLocationId: undefined,
      unitPrice: undefined,
      quantity: 1,
    };
    form.setFieldValue('items', items);

    // Kiểm tra hết hàng ngay lập tức
    const outOfStock = (variant.availableStock ?? 0) === 0;

    // Lấy danh sách kho có tồn kho > 0 cho variant này
    let availableLocations: StockLevel[] = [];
    try {
      const stocks = await inventoryApi.getStockByVariant(variantId);
      availableLocations = stocks.filter((s) => s.quantity > 0);
    } catch {
      // nếu lỗi thì để rỗng
    }

    setItemStates((prev) => ({
      ...prev,
      [fieldName]: {
        availableLocations,
        unitPriceBase: Number(variant.price) || 0,
        outOfStock,
      },
    }));
  }, [allVariants, form]);

  // Khi user nhập số lượng → tự tính đơn giá = price * quantity
  const handleQuantityChange = (qty: number | null, fieldName: number) => {
    const base = itemStates[fieldName]?.unitPriceBase ?? 0;
    if (qty != null && base > 0) {
      const items = form.getFieldValue('items') as any[];
      items[fieldName] = { ...items[fieldName], unitPrice: base };
      form.setFieldValue('items', items);
    }
  };

  // Tạo khách hàng mới từ Modal
  const handleCreateCustomer = async (values: any) => {
    setCustLoading(true);
    try {
      const newCust = await customerApi.create(values);
      setCustomers((prev) => [...prev, newCust]);
      // Tự động chọn khách vừa tạo vào form
      form.setFieldValue('customerId', newCust.id);
      message.success(`Đã thêm khách hàng: ${newCust.fullName}`);
      setShowNewCust(false);
      newCustForm.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Thêm khách hàng thất bại');
    } finally {
      setCustLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await salesApi.create(values);
      message.success('Tạo đơn hàng thành công!');
      navigate('/sales');
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Tạo đơn thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Tạo Đơn Hàng Mới</Title>
        <Button onClick={() => navigate('/sales')}>Quay Lại</Button>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ items: [{}] }}>
        <Card title="Thông Tin Đơn Hàng" bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
          <Space wrap size={[16, 0]}>
            <Form.Item
              label="Khách Hàng"
              name="customerId"
              rules={[{ required: true, message: 'Chọn khách hàng' }]}
              style={{ minWidth: 320 }}
            >
              <Select
                showSearch
                placeholder="Tìm khách hàng hoặc thêm mới..."
                optionFilterProp="label"
                options={customers.map((c) => ({ label: `${c.fullName} — ${c.phoneNumber}`, value: c.id }))}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '6px 0' }} />
                    <Button
                      type="text"
                      icon={<UserAddOutlined />}
                      block
                      style={{ color: '#6366F1', fontWeight: 600 }}
                      onClick={() => setShowNewCust(true)}
                    >
                      + Thêm Khách Hàng Mới
                    </Button>
                  </>
                )}
              />
            </Form.Item>
            <Form.Item label="Ghi Chú" name="notes" style={{ minWidth: 300 }}>
              <Input placeholder="Ghi chú đơn hàng..." />
            </Form.Item>
          </Space>
        </Card>

        <Card title="Sản Phẩm Trong Đơn" bordered={false} style={{ borderRadius: 12 }}>
          <Form.List name="items" rules={[{ validator: async (_, v) => !v?.length ? Promise.reject('Cần ít nhất 1 sản phẩm') : Promise.resolve() }]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...rest }) => {
                  const state = itemStates[name];
                  const qty: number = form.getFieldValue(['items', name, 'quantity']) || 1;

                  return (
                    <div
                      key={key}
                      style={{
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: 16, borderRadius: 10, marginBottom: 12,
                        background: state?.outOfStock ? 'rgba(255,77,79,0.05)' : 'rgba(255,255,255,0.01)',
                      }}
                    >
                      {/* Cảnh báo hết hàng */}
                      {state?.outOfStock && (
                        <Alert
                          message="Sản phẩm này hiện không còn hàng"
                          type="error"
                          showIcon
                          icon={<WarningOutlined />}
                          style={{ marginBottom: 12 }}
                        />
                      )}

                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        {/* SKU */}
                        <Form.Item
                          {...rest}
                          label="SKU / Biến Thể"
                          name={[name, 'variantId']}
                          rules={[{ required: true, message: 'Chọn SKU' }]}
                          style={{ flex: 2, minWidth: 260 }}
                        >
                          <Select
                            showSearch
                            placeholder="Chọn SKU..."
                            optionFilterProp="label"
                            onChange={(val) => handleVariantChange(val, name)}
                            options={allVariants.map((v) => {
                              const stock = v.availableStock ?? 0;
                              return {
                                label: `${v.sku} (${v.productName}) — còn ${stock}`,
                                value: v.id,
                                // disable nếu hết hàng
                                disabled: stock === 0,
                              };
                            })}
                            optionRender={(opt) => {
                              const v = allVariants.find((x) => x.id === opt.value);
                              const stock = v?.availableStock ?? 0;
                              return (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{opt.label as string}</span>
                                  <Tag color={stock === 0 ? 'error' : stock <= 5 ? 'warning' : 'success'}>
                                    {stock === 0 ? 'Hết hàng' : `Còn ${stock}`}
                                  </Tag>
                                </div>
                              );
                            }}
                          />
                        </Form.Item>

                        {/* Kho xuất — chỉ hiển thị kho có tồn kho > 0 */}
                        <Form.Item
                          {...rest}
                          label={
                            <span>
                              Kho Xuất
                              {state && !state.outOfStock && (
                                <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                                  ({state.availableLocations.length} kho có hàng)
                                </Text>
                              )}
                            </span>
                          }
                          name={[name, 'storageLocationId']}
                          rules={[{ required: true, message: 'Chọn kho' }]}
                          style={{ flex: 1, minWidth: 200 }}
                        >
                          <Select
                            placeholder="Chọn kho..."
                            disabled={!state || state.outOfStock || state.availableLocations.length === 0}
                            options={(state?.availableLocations ?? []).map((loc) => ({
                              label: `${loc.storageLocationName} (${loc.quantity})`,
                              value: loc.storageLocationId,
                            }))}
                          />
                        </Form.Item>

                        {/* Số lượng */}
                        <Form.Item
                          {...rest}
                          label="Số Lượng"
                          name={[name, 'quantity']}
                          rules={[{ required: true, message: 'Nhập SL' }]}
                          style={{ width: 110 }}
                        >
                          <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            onChange={(val) => handleQuantityChange(val, name)}
                          />
                        </Form.Item>

                        {/* Đơn giá — tự động điền từ giá bán */}
                        <Form.Item
                          {...rest}
                          label={
                            <span>
                              Đơn Giá (₫)
                              {state?.unitPriceBase > 0 && (
                                <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                                  (giá gốc: {state.unitPriceBase.toLocaleString('vi-VN')}₫)
                                </Text>
                              )}
                            </span>
                          }
                          name={[name, 'unitPrice']}
                          rules={[{ required: true, message: 'Nhập giá' }]}
                          style={{ width: 170 }}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          />
                        </Form.Item>

                        {/* Thành tiền (hiển thị, không submit) */}
                        {state && state.unitPriceBase > 0 && (
                          <div style={{ marginBottom: 24, minWidth: 140 }}>
                            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>
                              Thành tiền
                            </Text>
                            <Text
                              strong
                              style={{
                                color: '#6366F1', fontSize: 14,
                                background: 'rgba(99,102,241,0.1)',
                                padding: '4px 10px', borderRadius: 6, display: 'block',
                              }}
                            >
                              {(state.unitPriceBase * qty).toLocaleString('vi-VN')} ₫
                            </Text>
                          </div>
                        )}

                        {/* Nút xóa dòng */}
                        {fields.length > 1 && (
                          <Button
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => {
                              remove(name);
                              setItemStates((prev) => {
                                const next = { ...prev };
                                delete next[name];
                                return next;
                              });
                            }}
                            style={{ marginBottom: 24 }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                <Form.ErrorList errors={errors} />
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()} style={{ marginTop: 8 }}>
                  Thêm Sản Phẩm
                </Button>
              </>
            )}
          </Form.List>

          <Divider />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => navigate('/sales')}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none' }}
            >
              Tạo Đơn Hàng
            </Button>
          </div>
        </Card>
      </Form>

      {/* ===== Modal Thêm Khách Hàng Mới ===== */}
      <Modal
        open={showNewCust}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserAddOutlined style={{ color: '#6366F1' }} />
            Thêm Khách Hàng Mới
          </span>
        }
        onCancel={() => { setShowNewCust(false); newCustForm.resetFields(); }}
        footer={null}
        width={480}
        destroyOnClose
      >
        <Form
          form={newCustForm}
          layout="vertical"
          onFinish={handleCreateCustomer}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Họ Tên Khách Hàng"
            name="fullName"
            rules={[{ required: true, message: 'Nhập họ tên khách hàng' }]}
          >
            <Input
              placeholder="Ví dụ: Nguyễn Văn A"
              size="large"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            label="Số Điện Thoại"
            name="phoneNumber"
            rules={[
              { required: true, message: 'Nhập số điện thoại' },
              { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ (9–11 chữ số)' },
            ]}
          >
            <Input placeholder="0912345678" size="large" />
          </Form.Item>

          <Form.Item label="Địa Chỉ" name="address">
            <Input.TextArea rows={2} placeholder="Địa chỉ giao hàng (tùy chọn)..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button onClick={() => { setShowNewCust(false); newCustForm.resetFields(); }}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={custLoading}
              icon={<UserAddOutlined />}
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none' }}
            >
              Thêm Khách Hàng
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
