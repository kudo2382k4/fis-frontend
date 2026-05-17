import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AppLayout } from './layouts/AppLayout';
import { PrivateRoute } from './components/PrivateRoute';
import { RoleGuard } from './components/RoleGuard';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/reports/DashboardPage';
import ProductListPage from './pages/products/ProductListPage';
import CreateProductPage from './pages/products/CreateProductPage';
import EditProductPage from './pages/products/EditProductPage';
import InventoryPage from './pages/inventory/InventoryPage';
import LowStockPage from './pages/inventory/LowStockPage';
import SOListPage from './pages/sales/SOListPage';
import CreateSOPage from './pages/sales/CreateSOPage';
import SODetailPage from './pages/sales/SODetailPage';
import POListPage from './pages/purchase/POListPage';
import CreatePOPage from './pages/purchase/CreatePOPage';
import StaffManagementPage from './pages/users/StaffManagementPage';

export default function App() {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6366F1',
          borderRadius: 8,
          colorBgContainer: '#141414',
          colorBgLayout: '#0d0d0d',
          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
        },
        components: {
          Menu: { itemBg: '#141414' },
          Card: { colorBgContainer: '#1a1a1a' },
          Table: { colorBgContainer: '#1a1a1a' },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            {/* Root redirect: OWNER → Dashboard, STAFF → /sales */}
            <Route index element={<RoleGuardedIndex />} />

            {/* Dashboard — OWNER only */}
            <Route
              path="dashboard"
              element={
                <RoleGuard ownerOnly redirectTo="/sales">
                  <DashboardPage />
                </RoleGuard>
              }
            />

            {/* Products — tất cả xem được, chỉ OWNER tạo/sửa */}
            <Route path="products" element={<ProductListPage />} />
            <Route
              path="products/create"
              element={
                <RoleGuard ownerOnly redirectTo="/products">
                  <CreateProductPage />
                </RoleGuard>
              }
            />
            <Route
              path="products/:id/edit"
              element={
                <RoleGuard ownerOnly redirectTo="/products">
                  <EditProductPage />
                </RoleGuard>
              }
            />

            {/* Inventory — tất cả */}
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="inventory/low-stock" element={<LowStockPage />} />
            <Route path="inventory/adjust" element={<InventoryPage />} />

            {/* Sales — tất cả */}
            <Route path="sales" element={<SOListPage />} />
            <Route path="sales/create" element={<CreateSOPage />} />
            <Route path="sales/:id" element={<SODetailPage />} />

            {/* Purchase — OWNER only */}
            <Route
              path="purchase"
              element={
                <RoleGuard ownerOnly redirectTo="/sales">
                  <POListPage />
                </RoleGuard>
              }
            />
            <Route
              path="purchase/create"
              element={
                <RoleGuard ownerOnly redirectTo="/sales">
                  <CreatePOPage />
                </RoleGuard>
              }
            />

            {/* Reports — OWNER only */}
            <Route
              path="reports"
              element={
                <RoleGuard ownerOnly redirectTo="/sales">
                  <DashboardPage />
                </RoleGuard>
              }
            />

            {/* Staff Management — OWNER only */}
            <Route
              path="users/staff"
              element={
                <RoleGuard ownerOnly redirectTo="/sales">
                  <StaffManagementPage />
                </RoleGuard>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

/** Root index redirect theo role */
function RoleGuardedIndex() {
  const role = localStorage.getItem('fis_user')
    ? JSON.parse(localStorage.getItem('fis_user')!).role
    : null;
  return <Navigate to={role === 'ROLE_OWNER' ? '/dashboard' : '/sales'} replace />;
}
