import api from './axios';

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStaffRequest {
  email: string;
  fullName: string;
  password: string;
  phoneNumber?: string;
}

export const userApi = {
  getAllStaff: () => api.get<StaffUser[]>('/users/staff').then((r) => r.data),
  createStaff: (data: CreateStaffRequest) => api.post<StaffUser>('/users/staff', data).then((r) => r.data),
  toggleActive: (id: string) => api.patch<StaffUser>(`/users/${id}/toggle-active`).then((r) => r.data),
  resetPassword: (id: string, newPassword: string) =>
    api.patch(`/users/${id}/reset-password`, { newPassword }).then((r) => r.data),
};
