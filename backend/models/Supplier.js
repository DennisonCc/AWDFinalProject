const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Esquema para dirección simplificado
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  state: {
    type: String,
    trim: true,
    default: ''
  },
  country: {
    type: String,
    trim: true,
    default: 'Colombia'
  }
}, { _id: false });

// Esquema principal de Proveedores - simplificado para coincidir con frontend
const supplierSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  identificationNumber: {
    type: String,
    required: true,
    trim: true
  },
  contactName: {
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
  bankAccount: {
    type: String,
    required: true,
    trim: true
  },
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: addressSchema,
    default: {}
  }
}, {
  timestamps: true
});

// Agregar plugin de paginación
supplierSchema.plugin(mongoosePaginate);

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
