import api from './axios';
import type { DailyRevenue, LowStockAlert, StockMovementSummary } from '../types';

export const reportApi = {
  getDailyRevenue: (from: string, to: string) =>
    api.get<DailyRevenue[]>('/reports/revenue/daily', { params: { from, to } }).then((r) => r.data),
  getLowStock: () =>
    api.get<LowStockAlert[]>('/reports/inventory/low-stock').then((r) => r.data),
  getStockMovements: (from: string, to: string) =>
    api.get<StockMovementSummary[]>('/reports/inventory/movements', { params: { from, to } }).then((r) => r.data),
};
