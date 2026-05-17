import { create } from 'zustand';
import type { LoginResponse } from '../types';

interface AuthState {
  token: string | null;
  user: Omit<LoginResponse, 'token'> | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('fis_token'),
  user: (() => {
    const raw = localStorage.getItem('fis_user');
    return raw ? JSON.parse(raw) : null;
  })(),
  isAuthenticated: !!localStorage.getItem('fis_token'),

  login: (data) => {
    localStorage.setItem('fis_token', data.token);
    localStorage.setItem('fis_user', JSON.stringify({ email: data.email, role: data.role }));
    set({ token: data.token, user: { email: data.email, role: data.role }, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('fis_token');
    localStorage.removeItem('fis_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
