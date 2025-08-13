import api from './api';

export const authService = {
  // Login
  login: async (credentials) => {
    try {
      console.log('🔐 Intentando login con:', credentials);
      const response = await api.post('/auth/login', credentials);
      
      console.log('📋 Respuesta del backend:', response.data);
      
      // El backend devuelve: { success, message, data, token }
      const { token, data: user } = response.data;
      
      if (!token) {
        console.error('❌ No se recibió token en la respuesta');
        throw { message: 'No se recibió token de autenticación' };
      }
      
      if (!user) {
        console.error('❌ No se recibieron datos de usuario');
        throw { message: 'No se recibieron datos de usuario' };
      }
      
      console.log('✅ Login exitoso, guardando datos...');
      console.log('👤 Usuario:', user);
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error.response?.data || { message: error.message || 'Error en el login' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;
