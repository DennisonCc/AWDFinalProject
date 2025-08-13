const mongoose = require('mongoose');

// Esquema para información personal
const personalInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  fullName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Formato de email inválido'
    }
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\+]?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Formato de teléfono inválido'
    }
  }
}, { _id: false });

// Esquema para información comercial
const businessInfoSchema = new mongoose.Schema({
  companyName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  businessType: {
    type: String,
    enum: ['retail', 'wholesale', 'service', 'manufacturing', 'other'],
    default: 'retail'
  },
  registrationNumber: {
    type: String,
    trim: true
  }
}, { _id: false });

// Esquema para dirección
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'Colombia'
  },
  zipCode: {
    type: String,
    trim: true
  }
}, { _id: false });

// Esquema para historial de facturas
const invoiceHistorySchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue', 'cancelled'],
    required: true
  }
}, { _id: false });

// Esquema para preferencias del cliente
const preferencesSchema = new mongoose.Schema({
  preferredPaymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'credit'],
    default: 'cash'
  },
  discountLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { _id: false });

// Esquema principal de Clientes
const clientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    unique: true,
    required: true
  },
  taxId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d+$/.test(v); // Solo números
      },
      message: 'El número de identificación fiscal solo debe contener números'
    }
  },
  clientType: {
    type: String,
    enum: ['registered', 'final_consumer'],
    required: true,
    default: 'final_consumer'
  },
  personalInfo: {
    type: personalInfoSchema,
    required: true
  },
  businessInfo: businessInfoSchema,
  address: {
    type: addressSchema,
    required: true
  },
  invoiceHistory: [invoiceHistorySchema],
  preferences: {
    type: preferencesSchema,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Middleware para generar clientId automáticamente
clientSchema.pre('save', async function(next) {
  if (!this.clientId) {
    const count = await mongoose.model('Client').countDocuments();
    this.clientId = `CLI-${String(count + 1).padStart(3, '0')}`;
  }
  
  // Generar fullName automáticamente
  if (this.personalInfo.firstName && this.personalInfo.lastName) {
    this.personalInfo.fullName = `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
  }
  
  next();
});

// Índices
clientSchema.index({ taxId: 1 });
clientSchema.index({ clientId: 1 });
clientSchema.index({ 'personalInfo.email': 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ clientType: 1 });

// Métodos del esquema
clientSchema.methods.addInvoice = function(invoiceData) {
  this.invoiceHistory.push(invoiceData);
  return this.save();
};

clientSchema.methods.getTotalPurchases = function() {
  return this.invoiceHistory.reduce((total, invoice) => {
    return invoice.status === 'paid' ? total + invoice.amount : total;
  }, 0);
};

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
