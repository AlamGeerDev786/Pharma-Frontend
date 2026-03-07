import { create } from 'zustand';
import api from '../lib/api';

const useSaleStore = create((set) => ({
  sales: [],
  pagination: null,
  loading: false,
  error: null,

  fetchSales: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/sales', { params });
      set({ sales: data.data, pagination: data.pagination, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch sales', loading: false });
    }
  },

  createSale: async (saleData) => {
    const { data } = await api.post('/sales', saleData);
    set((s) => ({ sales: [data, ...s.sales] }));
    return data;
  },

  refundSale: async (id) => {
    await api.post(`/sales/${id}/refund`);
    set((s) => ({
      sales: s.sales.map((sale) => (sale.id === id ? { ...sale, status: 'REFUNDED' } : sale)),
    }));
  },
}));

export default useSaleStore;
