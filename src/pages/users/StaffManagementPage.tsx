import { useEffect, useState } from 'react';
import {
  Table, Button, Card, Typography, Tag, Space, Modal, Form,
  Input, Popconfirm, message, Badge, Tooltip, Avatar,
} from 'antd';
import {
  PlusOutlined, UserOutlined, LockOutlined,
  CheckCircleOutlined, StopOutlined, KeyOutlined,
} from '@ant-design/icons';
import { userApi, type StaffUser, type CreateStaffRequest } from '../../api/userApi';

const { Title, Text } = Typography;

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [resetModal, setResetModal] = useState<{ open: boolean; user?: StaffUser }>({ open: false });
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  const fetchStaff = async () => {
    setLoading(true);
    try { setStaff(await userApi.getAllStaff()); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreate = async (values: CreateStaffRequest) => {
    setCreateLoading(true);
    try {
      await userApi.createStaff(values);
      message.success(`Tạo tài khoản ${values.email} thành công!`);
      setCreateModal(false);
      createForm.resetFields();
      fetchStaff();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Tạo tài khoản thất bại');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggle = async (user: StaffUser) => {
    try {
      await userApi.toggleActive(user.id);
      message.success(`${user.isActive ? 'Đã vô hiệu hóa' : 'Đã kích hoạt'} tài khoản ${user.email}`);
      fetchStaff();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Thao tác thất bại');
    }
  };

  const handleResetPassword = async (values: { newPassword: string }) => {
    try {
      await userApi.resetPassword(resetModal.user!.id, values.newPassword);
      message.success('Đặt lại mật khẩu thành công!');
      setResetModal({ open: false });
      resetForm.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Đặt lại mật khẩu thất bại');
    }
  };

  const columns = [
    {
      title: 'Nhân Viên',
      key: 'user',
      render: (_: unknown, r: StaffUser) => (
        <Space>
          <Avatar style={{ background: '#10B981' }} icon={<UserOutlined />} size={36} />
          <div>
            <div style={{ fontWeight: 600 }}>{r.fullName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phoneNumber',
      key: 'phone',
      render: (v: string) => v ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'Vai Trò',
      dataIndex: 'role',
      key: 'role',
      render: () => <Tag color="green">STAFF</Tag>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) =>
        v ? (
          <Badge status="success" text={<Text style={{ color: '#10B981' }}>Đang Hoạt Động</Text>} />
        ) : (
          <Badge status="error" text={<Text type="secondary">Đã Vô Hiệu</Text>} />
        ),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: StaffUser) => (
        <Space>
          <Tooltip title="Đặt lại mật khẩu">
            <Button
              size="small"
              icon={<KeyOutlined />}
              onClick={() => { setResetModal({ open: true, user: record }); resetForm.resetFields(); }}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt lại'}>
            <Popconfirm
              title={record.isActive ? `Vô hiệu hóa tài khoản ${record.fullName}?` : `Kích hoạt lại tài khoản ${record.fullName}?`}
              onConfirm={() => handleToggle(record)}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{ danger: record.isActive }}
            >
              <Button
                size="small"
                icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                danger={record.isActive}
                type={record.isActive ? 'default' : 'primary'}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Quản Lý Tài Khoản</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Tạo và quản lý tài khoản nhân viên (Staff)</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setCreateModal(true); createForm.resetFields(); }}
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none' }}
        >
          Tạo Tài Khoản
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          dataSource={staff}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} tài khoản` }}
          locale={{ emptyText: 'Chưa có tài khoản Staff nào' }}
        />
      </Card>

      {/* Modal Tạo Tài Khoản */}
      <Modal
        open={createModal}
        title={
          <Space>
            <Avatar style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }} icon={<UserOutlined />} />
            Tạo Tài Khoản Nhân Viên
          </Space>
        }
        onCancel={() => setCreateModal(false)}
        onOk={() => createForm.submit()}
        okText="Tạo Tài Khoản"
        cancelText="Hủy"
        confirmLoading={createLoading}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none' } }}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item
            label="Họ và Tên"
            name="fullName"
            rules={[{ required: true, message: 'Nhập họ tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item
            label="Email (dùng để đăng nhập)"
            name="email"
            rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="staff@company.com" />
          </Form.Item>
          <Form.Item
            label="Số Điện Thoại"
            name="phoneNumber"
          >
            <Input placeholder="0912345678" />
          </Form.Item>
          <Form.Item
            label="Mật Khẩu"
            name="password"
            rules={[{ required: true, message: 'Nhập mật khẩu' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 6 ký tự" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Reset Mật Khẩu */}
      <Modal
        open={resetModal.open}
        title={`Đặt Lại Mật Khẩu — ${resetModal.user?.fullName}`}
        onCancel={() => setResetModal({ open: false })}
        onOk={() => resetForm.submit()}
        okText="Đặt Lại"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Form form={resetForm} layout="vertical" onFinish={handleResetPassword} style={{ marginTop: 16 }}>
          <Form.Item
            label="Mật Khẩu Mới"
            name="newPassword"
            rules={[{ required: true, message: 'Nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 6 ký tự" />
          </Form.Item>
          <Form.Item
            label="Xác Nhận Mật Khẩu"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
