const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth');
const supplierRoutes = require('./routes/suppliers');
const clientRoutes = require('./routes/clients');
const productRoutes = require('./routes/products');
const invoiceRoutes = require('./routes/invoices');

// Importar middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Conectado exitosamente a MongoDB Atlas');
  console.log('✅ Conectado a MongoDB Atlas');
})
.catch((error) => {
  logger.error('Error conectando a MongoDB:', error);
  console.error('❌ Error conectando a MongoDB:', error);
  process.exit(1);
});

// Rutas principales
app.get('/', (req, res) => {
  res.json({
    message: 'API del Sistema Bazar - Funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      suppliers: '/api/suppliers',
      clients: '/api/clients',
      products: '/api/products',
      invoices: '/api/invoices'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  logger.info(`Servidor iniciado en puerto ${PORT}`);
});

module.exports = app;
