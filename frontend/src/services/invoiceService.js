import api from './api';

export const invoiceService = {
  // Obtener todas las facturas con paginación
  getAll: async (page = 1, limit = 10, search = '') => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      
      const response = await api.get('/invoices', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener facturas' };
    }
  },

  // Obtener factura por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener factura' };
    }
  },

  // Crear nueva factura
  create: async (invoiceData) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear factura' };
    }
  },

  // Actualizar factura
  update: async (id, invoiceData) => {
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar factura' };
    }
  },

  // Eliminar factura
  delete: async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar factura' };
    }
  },

  // Actualizar estado de pago
  updatePaymentStatus: async (id, status) => {
    try {
      const response = await api.patch(`/invoices/${id}/payment-status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar estado de pago' };
    }
  },

  // Generar PDF de factura
  generatePDF: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al generar PDF' };
    }
  }
};

export default invoiceService;
