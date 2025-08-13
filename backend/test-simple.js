// Script para probar la autenticación sin dependencias externas
const http = require('http');
const https = require('https');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuth() {
  try {
    console.log('🔐 Probando login...');
    
    // 1. Login
    const loginOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    const loginResponse = await makeRequest(loginOptions, loginData);
    
    if (loginResponse.status === 200) {
      console.log('✅ Login exitoso');
      console.log('📋 Usuario:', loginResponse.data.data.username);
      console.log('👤 Rol:', loginResponse.data.data.role);
      console.log('🔑 Permisos:', loginResponse.data.data.permissions.length);
      console.log('📝 Permisos específicos:', loginResponse.data.data.permissions);
      
      const token = loginResponse.data.token;
      
      // 2. Probar crear un proveedor
      console.log('\n📝 Probando crear proveedor...');
      
      const supplierOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/suppliers',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
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
      
      const supplierResponse = await makeRequest(supplierOptions, supplierData);
      
      if (supplierResponse.status === 201) {
        console.log('✅ Proveedor creado exitosamente');
        console.log('📋 ID del proveedor:', supplierResponse.data.data.supplierId);
      } else {
        console.log('❌ Error al crear proveedor');
        console.log('📋 Status:', supplierResponse.status);
        console.log('📋 Respuesta:', supplierResponse.data);
      }
      
    } else {
      console.log('❌ Error en login');
      console.log('📋 Status:', loginResponse.status);
      console.log('📋 Respuesta:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuth();
