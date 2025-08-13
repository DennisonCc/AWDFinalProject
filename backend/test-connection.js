require('dotenv').config();
const mongoose = require('mongoose');

console.log('🚀 Script de prueba iniciado');
console.log('📋 Variables de entorno:');
console.log('- MONGODB_URI existe:', !!process.env.MONGODB_URI);
console.log('- MONGODB_URI longitud:', process.env.MONGODB_URI?.length);

const testConnection = async () => {
  try {
    console.log('🔄 Intentando conectar...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    
    console.log('✅ Conexión exitosa a MongoDB');
    
    // Test simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📦 Colecciones encontradas:', collections.length);
    
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📍 Código de error:', error.code);
    if (error.reason) {
      console.error('🎯 Razón:', error.reason);
    }
  }
};

testConnection();
