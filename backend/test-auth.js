// Script para probar la autenticación y permisos
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  try {
    console.log('🔐 Probando login...');
    
    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login exitoso');
    console.log('📋 Datos del usuario:', loginResponse.data.data);
    console.log('🔑 Token recibido:', loginResponse.data.token ? 'SÍ' : 'NO');
    console.log('👤 Permisos:', loginResponse.data.data.permissions);
    
    const token = loginResponse.data.token;
    
    // 2. Probar crear un proveedor con el token
    console.log('\n📝 Probando crear proveedor...');
    
    const supplierData = {
      name: 'Proveedor Test',
      contactInfo: {
        email: 'test@proveedor.com',
        phone: '123456789'
      },
      address: {
        street: 'Calle Test 123',
        city: 'Ciudad Test',
        state: 'Estado Test',
        zipCode: '12345',
        country: 'País Test'
      },
      businessInfo: {
        taxId: '123456789',
        businessType: 'company'
      }
    };
    
    const supplierResponse = await axios.post(`${BASE_URL}/suppliers`, supplierData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Proveedor creado exitosamente');
    console.log('📋 Datos del proveedor:', supplierResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('🚫 Error de permisos detectado');
      console.log('📋 Respuesta completa:', error.response.data);
    }
    
    if (error.response?.status === 401) {
      console.log('🔐 Error de autenticación detectado');
      console.log('📋 Respuesta completa:', error.response.data);
    }
  }
}

testAuth();
