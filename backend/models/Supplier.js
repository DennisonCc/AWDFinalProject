const mongoose = require('mongoose');

// Esquema para productos del catálogo del proveedor
const catalogProductSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    trim: true
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'COP',
    enum: ['COP', 'USD', 'EUR']
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrder: {
    type: Number,
    default: 1,
    min: 1
  },
  images: [{
    type: String // URLs de imágenes
  }],
  specifications: {
    weight: String,
    dimensions: String,
    color: String,
    material: String
  },
  isActive: {
    type: Boolean,
    default: true
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

// Esquema principal de Proveedores
const supplierSchema = new mongoose.Schema({
  supplierId: {
    type: String,
    unique: true,
    required: true
  },
  identificationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d+$/.test(v); // Solo números
      },
      message: 'El número de identificación solo debe contener números'
    }
  },
  company: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  contactName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
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
    required: true
  },
  catalog: [catalogProductSchema],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true // Crea automáticamente createdAt y updatedAt
});

// Middleware para generar supplierId automáticamente
supplierSchema.pre('save', async function(next) {
  if (!this.supplierId) {
    const count = await mongoose.model('Supplier').countDocuments();
    this.supplierId = `SUP-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Índices para optimizar búsquedas
supplierSchema.index({ identificationNumber: 1 });
supplierSchema.index({ supplierId: 1 });
supplierSchema.index({ company: 'text', contactName: 'text' });
supplierSchema.index({ status: 1 });

// Métodos del esquema
supplierSchema.methods.addProduct = function(productData) {
  this.catalog.push(productData);
  return this.save();
};

supplierSchema.methods.removeProduct = function(productId) {
  this.catalog = this.catalog.filter(product => product.productId !== productId);
  return this.save();
};

supplierSchema.methods.updateProduct = function(productId, updateData) {
  const productIndex = this.catalog.findIndex(product => product.productId === productId);
  if (productIndex !== -1) {
    Object.assign(this.catalog[productIndex], updateData);
    return this.save();
  }
  throw new Error('Producto no encontrado en el catálogo');
};

// Método estático para buscar proveedores
supplierSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
