import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Button, theme, Tag } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  AppstoreOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DatabaseOutlined,
  WarningOutlined,
  PlusCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { token } = theme.useToken();

  const isOwner = user?.role === 'ROLE_OWNER';

  // Build menu dựa trên role
  const menuItems = [
    // Dashboard — chỉ OWNER
    ...(isOwner ? [{ key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' }] : []),

    // Sản Phẩm — STAFF chỉ xem, không tạo
    {
      key: 'products',
      icon: <AppstoreOutlined />,
      label: 'Sản Phẩm',
      children: [
        { key: '/products', label: 'Danh Sách' },
        // Chỉ OWNER thấy nút Tạo Mới
        ...(isOwner ? [{ key: '/products/create', label: 'Tạo Mới', icon: <PlusCircleOutlined /> }] : []),
      ],
    },

    // Kho Hàng — STAFF được phép tất cả
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: 'Kho Hàng',
      children: [
        { key: '/inventory', label: 'Tồn Kho', icon: <DatabaseOutlined /> },
        { key: '/inventory/low-stock', label: 'Sắp Hết', icon: <WarningOutlined /> },
        { key: '/inventory/adjust', label: 'Kiểm Kho' },
      ],
    },

    // Đơn Hàng — STAFF được phép tất cả
    {
      key: 'sales',
      icon: <ShoppingCartOutlined />,
      label: 'Đơn Hàng',
      children: [
        { key: '/sales', label: 'Danh Sách' },
        { key: '/sales/create', label: 'Tạo Đơn' },
      ],
    },

    // Nhập Hàng — chỉ OWNER
    ...(isOwner
      ? [
          {
            key: 'purchase',
            icon: <ShopOutlined />,
            label: 'Nhập Hàng',
            children: [
              { key: '/purchase', label: 'Danh Sách' },
              { key: '/purchase/create', label: 'Tạo PO' },
            ],
          },
        ]
      : []),

    // Báo Cáo — chỉ OWNER
    ...(isOwner ? [{ key: '/reports', icon: <BarChartOutlined />, label: 'Báo Cáo' }] : []),

    // Quản Lý Tài Khoản — chỉ OWNER
    ...(isOwner ? [{ key: '/users/staff', icon: <TeamOutlined />, label: 'Tài Khoản' }] : []),
  ];

  const selectedKeys = [location.pathname];
  const openKeys = menuItems
    .filter((m: any) => m.children?.some((c: any) => location.pathname.startsWith(c.key)))
    .map((m: any) => m.key);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng Xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            F
          </div>
          {!collapsed && (
            <Text strong style={{ fontSize: 16, color: token.colorText }}>
              FIS System
            </Text>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 99,
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            height: 64,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 40, height: 40 }}
          />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 8,
              }}
            >
              <Avatar
                style={{
                  background: isOwner
                    ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  verticalAlign: 'middle',
                }}
                icon={<UserOutlined />}
                size={36}
              />
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: token.colorText }}>{user?.email}</div>
                <div>
                  <Tag
                    color={isOwner ? 'purple' : 'green'}
                    style={{ fontSize: 10, padding: '0 6px', marginRight: 0 }}
                  >
                    {isOwner ? 'OWNER' : 'STAFF'}
                  </Tag>
                </div>
              </div>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)', background: token.colorBgLayout }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
