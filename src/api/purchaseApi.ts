import api from './axios';
import type { PurchaseOrder, PurchaseOrderRequest } from '../types';

export const purchaseApi = {
  getAll: () => api.get<PurchaseOrder[]>('/purchase-orders').then((r) => r.data),
  getById: (id: string) => api.get<PurchaseOrder>(`/purchase-orders/${id}`).then((r) => r.data),
  create: (data: PurchaseOrderRequest) =>
    api.post<PurchaseOrder>('/purchase-orders', data).then((r) => r.data),
  receive: (id: string) => api.patch<PurchaseOrder>(`/purchase-orders/${id}/receive`).then((r) => r.data),
  cancel: (id: string) => api.patch<PurchaseOrder>(`/purchase-orders/${id}/cancel`).then((r) => r.data),
};
