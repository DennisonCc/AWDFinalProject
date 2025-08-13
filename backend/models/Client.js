const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Esquema súper simplificado de Clientes - solo 5 campos básicos
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  document: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Agregar plugin de paginación
clientSchema.plugin(mongoosePaginate);

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
