import api from './axios';
import type { Customer, CustomerDto } from '../types';

export const customerApi = {
  getAll: () => api.get<Customer[]>('/customers').then((r) => r.data),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`).then((r) => r.data),
  findByPhone: (phone: string) => api.get<Customer>(`/customers/phone/${phone}`).then((r) => r.data),
  create: (data: CustomerDto) => api.post<Customer>('/customers', data).then((r) => r.data),
  update: (id: string, data: CustomerDto) => api.put<Customer>(`/customers/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};
