import { create } from 'zustand';
import api from '../lib/api';

const usePurchaseStore = create((set) => ({
  purchases: [],
  pagination: null,
  loading: false,
  error: null,

  fetchPurchases: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/purchases', { params });
      set({ purchases: data.data, pagination: data.pagination, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch purchases', loading: false });
    }
  },

  createPurchase: async (purchaseData) => {
    const { data } = await api.post('/purchases', purchaseData);
    set((s) => ({ purchases: [data, ...s.purchases] }));
    return data;
  },

  receivePurchase: async (id, items) => {
    const { data } = await api.put(`/purchases/${id}/receive`, { items });
    set((s) => ({
      purchases: s.purchases.map((p) => (p.id === id ? { ...p, status: 'RECEIVED' } : p)),
    }));
    return data;
  },
}));

export default usePurchaseStore;
