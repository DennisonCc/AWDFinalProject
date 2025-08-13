// Exportar todos los modelos desde un solo archivo
const Supplier = require('./Supplier');
const Client = require('./Client');
const Product = require('./Product');
const Invoice = require('./Invoice');
const User = require('./User');

module.exports = {
  Supplier,
  Client,
  Product,
  Invoice,
  User
};
