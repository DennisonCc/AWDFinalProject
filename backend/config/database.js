const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Conectado: ${conn.connection.host}`);
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    logger.error('Error conectando a MongoDB:', error);
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Eventos de conexión
mongoose.connection.on('connected', () => {
  logger.info('Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Error de conexión Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose desconectado de MongoDB');
});

// Cerrar conexión cuando la aplicación termina
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Conexión a MongoDB cerrada debido a terminación de aplicación');
  process.exit(0);
});

module.exports = connectDB;
