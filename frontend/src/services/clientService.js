import api from './api';

export const clientService = {
  // Obtener todos los clientes con paginación
  getAll: async (page = 1, limit = 10, search = '') => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      
      const response = await api.get('/clients', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener clientes' };
    }
  },

  // Obtener cliente por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener cliente' };
    }
  },

  // Crear nuevo cliente
  create: async (clientData) => {
    try {
      const response = await api.post('/clients', clientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear cliente' };
    }
  },

  // Actualizar cliente
  update: async (id, clientData) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar cliente' };
    }
  },

  // Eliminar cliente
  delete: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar cliente' };
    }
  }
};

export default clientService;
