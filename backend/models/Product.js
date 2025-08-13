const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Esquema principal de Productos - simplificado para coincidir con frontend
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStock: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  sku: {
    type: String,
    unique: true,
    trim: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Middleware para generar SKU automáticamente si no se proporciona
productSchema.pre('save', async function(next) {
  if (!this.sku) {
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const productNumber = String(await mongoose.model('Product').countDocuments() + 1).padStart(4, '0');
    this.sku = `${categoryCode}-${productNumber}`;
  }
  next();
});

// Agregar plugin de paginación
productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
