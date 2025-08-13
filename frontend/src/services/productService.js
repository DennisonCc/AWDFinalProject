import api from './api';

export const productService = {
  // Obtener todos los productos con paginación
  getAll: async (page = 1, limit = 10, search = '') => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener productos' };
    }
  },

  // Obtener producto por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener producto' };
    }
  },

  // Crear nuevo producto
  create: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear producto' };
    }
  },

  // Actualizar producto
  update: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar producto' };
    }
  },

  // Eliminar producto
  delete: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar producto' };
    }
  },

  // Actualizar stock del producto
  updateStock: async (id, quantity, operation = 'add') => {
    try {
      const response = await api.patch(`/products/${id}/stock`, { quantity, operation });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar stock' };
    }
  }
};

export default productService;
