const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Esquema para items de la factura - simplificado
const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Esquema principal de Facturas - simplificado para coincidir con frontend
const invoiceSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
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
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    required: true,
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Middleware para calcular el total automáticamente
invoiceSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.total = this.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
  }
  next();
});

// Agregar plugin de paginación
invoiceSchema.plugin(mongoosePaginate);

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
