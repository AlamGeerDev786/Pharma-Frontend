import { create } from 'zustand';
import api from '../lib/api';

const useMedicineStore = create((set, get) => ({
  medicines: [],
  categories: [],
  pagination: null,
  loading: false,
  error: null,

  fetchMedicines: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/medicines', { params });
      set({ medicines: data.data, pagination: data.pagination, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch medicines', loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await api.get('/categories');
      set({ categories: data });
    } catch {}
  },

  createMedicine: async (medicineData) => {
    const { data } = await api.post('/medicines', medicineData);
    set((s) => ({ medicines: [data, ...s.medicines] }));
    return data;
  },

  updateMedicine: async (id, medicineData) => {
    const { data } = await api.put(`/medicines/${id}`, medicineData);
    set((s) => ({ medicines: s.medicines.map((m) => (m.id === id ? { ...m, ...data } : m)) }));
    return data;
  },

  deleteMedicine: async (id) => {
    await api.delete(`/medicines/${id}`);
    set((s) => ({ medicines: s.medicines.filter((m) => m.id !== id) }));
  },

  addBatch: async (medicineId, batchData) => {
    const { data } = await api.post(`/medicines/${medicineId}/batches`, batchData);
    return data;
  },

  createCategory: async (name) => {
    const { data } = await api.post('/categories', { name });
    set((s) => ({ categories: [...s.categories, data] }));
    return data;
  },
}));

export default useMedicineStore;
