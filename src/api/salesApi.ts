import api from './axios';
import type { SalesOrder, SalesOrderRequest } from '../types';

export const salesApi = {
  getAll: () => api.get<SalesOrder[]>('/sales-orders').then((r) => r.data),
  getById: (id: string) => api.get<SalesOrder>(`/sales-orders/${id}`).then((r) => r.data),
  create: (data: SalesOrderRequest) => api.post<SalesOrder>('/sales-orders', data).then((r) => r.data),
  process: (id: string) => api.patch<SalesOrder>(`/sales-orders/${id}/process`).then((r) => r.data),
  cancel: (id: string) => api.patch<SalesOrder>(`/sales-orders/${id}/cancel`).then((r) => r.data),
};
