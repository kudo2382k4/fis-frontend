import api from './axios';
import type { Supplier, SupplierDto } from '../types';

export const supplierApi = {
  getAll: () => api.get<Supplier[]>('/suppliers').then((r) => r.data),
  getById: (id: string) => api.get<Supplier>(`/suppliers/${id}`).then((r) => r.data),
  create: (data: SupplierDto) => api.post<Supplier>('/suppliers', data).then((r) => r.data),
  update: (id: string, data: SupplierDto) => api.put<Supplier>(`/suppliers/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
};
