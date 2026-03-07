import { create } from 'zustand';
import api from '../lib/api';

const useSupplierStore = create((set) => ({
  suppliers: [],
  pagination: null,
  loading: false,
  error: null,

  fetchSuppliers: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/suppliers', { params });
      set({ suppliers: data.data, pagination: data.pagination, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch suppliers', loading: false });
    }
  },

  createSupplier: async (supplierData) => {
    const { data } = await api.post('/suppliers', supplierData);
    set((s) => ({ suppliers: [data, ...s.suppliers] }));
    return data;
  },

  updateSupplier: async (id, supplierData) => {
    const { data } = await api.put(`/suppliers/${id}`, supplierData);
    set((s) => ({ suppliers: s.suppliers.map((sup) => (sup.id === id ? { ...sup, ...data } : sup)) }));
    return data;
  },

  deleteSupplier: async (id) => {
    await api.delete(`/suppliers/${id}`);
    set((s) => ({ suppliers: s.suppliers.filter((sup) => sup.id !== id) }));
  },
}));

export default useSupplierStore;
