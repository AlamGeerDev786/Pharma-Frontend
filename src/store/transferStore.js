import { create } from 'zustand';
import api from '../lib/api';

const useTransferStore = create((set) => ({
  transfers: [],
  loading: false,

  fetchTransfers: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/branches/transfers/list');
      set({ transfers: data.data || data, loading: false });
    } catch { set({ loading: false }); }
  },

  createTransfer: async (transferData) => {
    const { data } = await api.post('/branches/transfers', transferData);
    set((s) => ({ transfers: [data, ...s.transfers] }));
    return data;
  },

  approveTransfer: async (id) => {
    const { data } = await api.put(`/branches/transfers/${id}/approve`);
    set((s) => ({ transfers: s.transfers.map((t) => (t.id === id ? data : t)) }));
    return data;
  },

  completeTransfer: async (id) => {
    const { data } = await api.put(`/branches/transfers/${id}/complete`);
    set((s) => ({ transfers: s.transfers.map((t) => (t.id === id ? data : t)) }));
    return data;
  },

  rejectTransfer: async (id) => {
    const { data } = await api.put(`/branches/transfers/${id}/reject`);
    set((s) => ({ transfers: s.transfers.map((t) => (t.id === id ? data : t)) }));
    return data;
  },
}));

export default useTransferStore;
