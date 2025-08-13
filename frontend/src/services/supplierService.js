import api from './api';

export const supplierService = {
  // Obtener todos los proveedores con paginación
  getAll: async (page = 1, limit = 10, search = '') => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      
      const response = await api.get('/suppliers', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener proveedores' };
    }
  },

  // Obtener proveedor por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener proveedor' };
    }
  },

  // Crear nuevo proveedor
  create: async (supplierData) => {
    try {
      const response = await api.post('/suppliers', supplierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear proveedor' };
    }
  },

  // Actualizar proveedor
  update: async (id, supplierData) => {
    try {
      const response = await api.put(`/suppliers/${id}`, supplierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar proveedor' };
    }
  },

  // Eliminar proveedor
  delete: async (id) => {
    try {
      const response = await api.delete(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar proveedor' };
    }
  }
};

export default supplierService;
