import { create } from 'zustand';
import api from '../lib/api';

const useBranchStore = create((set) => ({
  branches: [],
  loading: false,

  fetchBranches: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/branches');
      set({ branches: data, loading: false });
    } catch { set({ loading: false }); }
  },

  createBranch: async (branchData) => {
    const { data } = await api.post('/branches', branchData);
    set((s) => ({ branches: [...s.branches, data] }));
    return data;
  },

  updateBranch: async (id, branchData) => {
    const { data } = await api.put(`/branches/${id}`, branchData);
    set((s) => ({ branches: s.branches.map((b) => (b.id === id ? data : b)) }));
    return data;
  },

  toggleBranch: async (id) => {
    const { data } = await api.put(`/branches/${id}/toggle`);
    set((s) => ({ branches: s.branches.map((b) => (b.id === id ? data : b)) }));
    return data;
  },
}));

export default useBranchStore;
