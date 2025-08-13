// Archivo principal para centralizar todas las rutas
const authRoutes = require('./auth');
const supplierRoutes = require('./suppliers');
const clientRoutes = require('./clients');
const productRoutes = require('./products');
const invoiceRoutes = require('./invoices');

module.exports = {
  authRoutes,
  supplierRoutes,
  clientRoutes,
  productRoutes,
  invoiceRoutes
};
