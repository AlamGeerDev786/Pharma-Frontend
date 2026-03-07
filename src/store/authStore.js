import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  tenant: null,
  organization: null,
  branches: [],
  currentBranchId: null,
  loading: true,

  // Initialize from localStorage
  init: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { set({ loading: false }); return; }
    try {
      const { data } = await api.get('/auth/me');
      const savedBranchId = localStorage.getItem('currentBranchId');
      set({
        user: data.user,
        tenant: data.tenant,
        organization: data.organization || null,
        branches: data.branches || [],
        currentBranchId: savedBranchId || data.tenant?.id || null,
        loading: false,
      });
    } catch {
      localStorage.clear();
      set({ user: null, tenant: null, organization: null, branches: [], currentBranchId: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const branchId = data.tenant?.id || null;
    localStorage.setItem('currentBranchId', branchId);
    set({
      user: data.user,
      tenant: data.tenant,
      organization: data.organization || null,
      branches: data.branches || [],
      currentBranchId: branchId,
    });
    return data;
  },

  register: async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const branchId = data.tenant?.id || null;
    localStorage.setItem('currentBranchId', branchId);
    set({
      user: data.user,
      tenant: data.tenant,
      organization: data.organization || null,
      branches: data.branches || [],
      currentBranchId: branchId,
    });
    return data;
  },

  // Switch active branch (ORG_ADMIN only)
  switchBranch: (branchId) => {
    const { branches } = get();
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      localStorage.setItem('currentBranchId', branchId);
      set({ currentBranchId: branchId });
    }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, tenant: null, organization: null, branches: [], currentBranchId: null });
    window.location.href = '/login';
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/settings/profile', profileData);
    set({ user: data });
  },
}));

export default useAuthStore;
