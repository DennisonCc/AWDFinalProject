const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Limpiar todas las colecciones
const cleanDatabase = async () => {
  try {
    console.log('🧹 Limpiando base de datos...');
    
    // Eliminar todas las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (let collection of collections) {
      await mongoose.connection.db.collection(collection.name).drop();
      console.log(`✅ Eliminada colección: ${collection.name}`);
    }
    
    console.log('🎉 Base de datos limpiada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar
const run = async () => {
  await connectDB();
  await cleanDatabase();
};

run();
