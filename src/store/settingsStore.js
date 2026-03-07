import { create } from 'zustand';
import api from '../lib/api';

const useSettingsStore = create((set) => ({
  users: [],
  customers: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/settings/users');
      set({ users: data, loading: false });
    } catch { set({ loading: false }); }
  },

  createUser: async (userData) => {
    const { data } = await api.post('/settings/users', userData);
    set((s) => ({ users: [...s.users, data] }));
    return data;
  },

  updateUser: async (id, userData) => {
    const { data } = await api.put(`/settings/users/${id}`, userData);
    set((s) => ({ users: s.users.map((u) => (u.id === id ? data : u)) }));
    return data;
  },

  updatePharmacy: async (pharmacyData) => {
    const { data } = await api.put('/settings/pharmacy', pharmacyData);
    return data;
  },

  fetchCustomers: async (search = '') => {
    try {
      const { data } = await api.get('/settings/customers', { params: { search } });
      set({ customers: data });
    } catch {}
  },

  createCustomer: async (customerData) => {
    const { data } = await api.post('/settings/customers', customerData);
    set((s) => ({ customers: [...s.customers, data] }));
    return data;
  },
}));

export default useSettingsStore;
