import { create } from 'zustand';
import api from '../lib/api';

const useReportStore = create((set) => ({
  salesSummary: null,
  topSelling: [],
  inventoryHealth: null,
  expiryReport: null,
  profitReport: null,
  loading: false,

  fetchSalesSummary: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/reports/sales-summary', { params });
      set({ salesSummary: data, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchTopSelling: async (limit = 10) => {
    try {
      const { data } = await api.get('/reports/top-selling', { params: { limit } });
      set({ topSelling: data });
    } catch {}
  },

  fetchInventoryHealth: async () => {
    try {
      const { data } = await api.get('/reports/inventory-health');
      set({ inventoryHealth: data });
    } catch {}
  },

  fetchExpiryReport: async () => {
    try {
      const { data } = await api.get('/reports/expiry');
      set({ expiryReport: data });
    } catch {}
  },

  fetchProfitReport: async (params = {}) => {
    try {
      const { data } = await api.get('/reports/profit', { params });
      set({ profitReport: data });
    } catch {}
  },
}));

export default useReportStore;
