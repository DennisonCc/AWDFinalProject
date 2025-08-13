const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Esquema para información del cliente en la factura
const clientInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  taxId: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  }
}, { _id: false });

// Esquema para items de la factura
const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 19
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Esquema para totales de la factura
const totalsSchema = new mongoose.Schema({
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'COP',
    enum: ['COP', 'USD', 'EUR']
  }
}, { _id: false });

// Esquema para información de pago
const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'credit', 'check'],
    required: true,
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'overdue', 'cancelled'],
    required: true,
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  paymentDate: {
    type: Date
  },
  reference: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { _id: false });

// Esquema para fechas importantes
const datesSchema = new mongoose.Schema({
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  }
}, { _id: false });

// Esquema para información del PDF
const pdfInfoSchema = new mongoose.Schema({
  fileName: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  generatedAt: {
    type: Date
  },
  size: {
    type: Number // Tamaño en bytes
  }
}, { _id: false });

// Esquema principal de Facturas
const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    unique: true,
    required: true
  },
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  clientInfo: {
    type: clientInfoSchema,
    required: true
  },
  items: {
    type: [invoiceItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'La factura debe tener al menos un item'
    }
  },
  totals: {
    type: totalsSchema,
    required: true
  },
  paymentInfo: {
    type: paymentInfoSchema,
    required: true,
    default: {}
  },
  dates: {
    type: datesSchema,
    required: true,
    default: {}
  },
  pdfInfo: pdfInfoSchema,
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled', 'overdue'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Middleware para generar IDs automáticamente
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceId) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceId = `INV-${String(count + 1).padStart(3, '0')}`;
  }
  
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Invoice').countDocuments({
      'dates.issueDate': {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`)
      }
    });
    this.invoiceNumber = `FAC-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Establecer fecha de vencimiento automáticamente (30 días por defecto)
  if (!this.dates.dueDate && this.dates.issueDate) {
    this.dates.dueDate = new Date(this.dates.issueDate.getTime() + (30 * 24 * 60 * 60 * 1000));
  }
  
  next();
});

// Middleware para calcular totales automáticamente
invoiceSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    let subtotal = 0;
    let taxAmount = 0;
    
    // Calcular totales por item
    this.items.forEach(item => {
      item.subtotal = item.quantity * item.unitPrice;
      item.taxAmount = (item.subtotal * item.taxRate) / 100;
      item.total = item.subtotal + item.taxAmount;
      
      subtotal += item.subtotal;
      taxAmount += item.taxAmount;
    });
    
    // Calcular totales generales
    this.totals.subtotal = subtotal;
    this.totals.taxAmount = taxAmount;
    this.totals.total = subtotal + taxAmount - (this.totals.discount || 0);
  }
  
  next();
});

// Índices
invoiceSchema.index({ invoiceId: 1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ clientId: 1 });
invoiceSchema.index({ 'dates.issueDate': -1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ 'paymentInfo.status': 1 });

// Métodos del esquema
invoiceSchema.methods.markAsPaid = function(paymentData = {}) {
  this.paymentInfo.status = 'paid';
  this.paymentInfo.paidAmount = this.totals.total;
  this.paymentInfo.paymentDate = paymentData.paymentDate || new Date();
  this.paymentInfo.reference = paymentData.reference;
  this.dates.paidDate = this.paymentInfo.paymentDate;
  this.status = 'paid';
  
  return this.save();
};

invoiceSchema.methods.addPayment = function(amount, paymentData = {}) {
  this.paymentInfo.paidAmount = (this.paymentInfo.paidAmount || 0) + amount;
  
  if (this.paymentInfo.paidAmount >= this.totals.total) {
    this.paymentInfo.status = 'paid';
    this.status = 'paid';
    this.dates.paidDate = paymentData.paymentDate || new Date();
  } else {
    this.paymentInfo.status = 'partial';
  }
  
  if (paymentData.reference) {
    this.paymentInfo.reference = paymentData.reference;
  }
  
  return this.save();
};

invoiceSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.paymentInfo.status = 'cancelled';
  this.notes = (this.notes || '') + `\nCancelada: ${reason}`;
  
  return this.save();
};

invoiceSchema.methods.isOverdue = function() {
  return this.dates.dueDate < new Date() && this.paymentInfo.status !== 'paid';
};

// Métodos estáticos
invoiceSchema.statics.findOverdue = function() {
  return this.find({
    'dates.dueDate': { $lt: new Date() },
    'paymentInfo.status': { $ne: 'paid' },
    status: { $ne: 'cancelled' }
  });
};

invoiceSchema.statics.getTotalSales = function(startDate, endDate) {
  const match = {
    'paymentInfo.status': 'paid',
    'dates.issueDate': {}
  };
  
  if (startDate) match['dates.issueDate'].$gte = new Date(startDate);
  if (endDate) match['dates.issueDate'].$lte = new Date(endDate);
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totals.total' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Agregar plugin de paginación
invoiceSchema.plugin(mongoosePaginate);

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
