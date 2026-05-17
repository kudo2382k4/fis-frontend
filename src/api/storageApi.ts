import api from './axios';
import type { StorageLocation } from '../types';

export const storageApi = {
  getAll: () => api.get<StorageLocation[]>('/storage-locations').then((r) => r.data),
  getById: (id: string) => api.get<StorageLocation>(`/storage-locations/${id}`).then((r) => r.data),
  create: (data: Partial<StorageLocation>) =>
    api.post<StorageLocation>('/storage-locations', data).then((r) => r.data),
  update: (id: string, data: Partial<StorageLocation>) =>
    api.put<StorageLocation>(`/storage-locations/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/storage-locations/${id}`),
};
