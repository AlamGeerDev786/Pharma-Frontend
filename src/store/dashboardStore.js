import { create } from 'zustand';
import api from '../lib/api';

const useDashboardStore = create((set) => ({
  stats: null,
  revenue: [],
  recentSales: [],
  alerts: [],
  loading: false,

  fetchStats: async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      set({ stats: data });
    } catch {}
  },

  fetchRevenue: async (period = 'weekly') => {
    try {
      const { data } = await api.get('/dashboard/revenue', { params: { period } });
      set({ revenue: data });
    } catch {}
  },

  fetchRecentSales: async () => {
    try {
      const { data } = await api.get('/dashboard/recent-sales');
      set({ recentSales: data });
    } catch {}
  },

  fetchAlerts: async () => {
    try {
      const { data } = await api.get('/dashboard/alerts');
      set({ alerts: data });
    } catch {}
  },

  fetchAll: async (period = 'weekly') => {
    set({ loading: true });
    try {
      const [stats, revenue, recentSales, alerts] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue', { params: { period } }),
        api.get('/dashboard/recent-sales'),
        api.get('/dashboard/alerts'),
      ]);
      set({
        stats: stats.data,
        revenue: revenue.data,
        recentSales: recentSales.data,
        alerts: alerts.data,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
}));

export default useDashboardStore;
