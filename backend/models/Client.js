const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Esquema principal de Clientes - simplificado para coincidir con frontend
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
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  country: {
    type: String,
    trim: true,
    default: 'Colombia'
  },
  documentType: {
    type: String,
    required: true,
    enum: ['DNI', 'Cedula', 'Pasaporte', 'RUC'],
    default: 'DNI'
  },
  documentNumber: {
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
