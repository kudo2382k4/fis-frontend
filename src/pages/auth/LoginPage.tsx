import { Form, Input, Button, Card, Typography, message, theme } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../stores/authStore';
import type { LoginRequest } from '../../types';

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginRequest) => {
    try {
      const resp = await authApi.login(values);
      login(resp);
      message.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Email hoặc mật khẩu không đúng';
      message.error(msg);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${token.colorBgLayout} 0%, #1a1035 100%)`,
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 24,
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            }}
          >
            F
          </div>
          <Title level={3} style={{ margin: 0, color: token.colorText }}>
            Family Inventory System
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Đăng nhập để tiếp tục
          </Text>
        </div>

        <Card
          style={{
            borderRadius: 16,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
          styles={{ body: { padding: 32 } }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{ email: 'admin@fis.com', password: 'admin123' }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="admin@fis.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Mật Khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="••••••••"
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  border: 'none',
                  height: 48,
                  fontSize: 15,
                  fontWeight: 600,
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                }}
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
