import api from './axios';
import type { DailyRevenue, LowStockAlert, StockMovementSummary, TopSellingProduct, RecentOrder, TopCustomer } from '../types';

export const reportApi = {
  getDailyRevenue: (from: string, to: string) =>
    api.get<DailyRevenue[]>('/reports/revenue/daily', { params: { from, to } }).then((r) => r.data),
  getLowStock: () =>
    api.get<LowStockAlert[]>('/reports/inventory/low-stock').then((r) => r.data),
  getStockMovements: (from: string, to: string) =>
    api.get<StockMovementSummary[]>('/reports/inventory/movements', { params: { from, to } }).then((r) => r.data),
  getTopSellingProducts: (from: string, to: string, limit = 5) =>
    api.get<TopSellingProduct[]>('/reports/top-selling-products', { params: { from, to, limit } }).then((r) => r.data),
  getRecentOrders: (limit = 10) =>
    api.get<RecentOrder[]>('/reports/recent-orders', { params: { limit } }).then((r) => r.data),
  getTopCustomers: (limit = 5) =>
    api.get<TopCustomer[]>('/reports/top-customers', { params: { limit } }).then((r) => r.data),
};
