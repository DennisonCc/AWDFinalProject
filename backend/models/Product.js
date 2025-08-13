const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Esquema para información de precios
const pricingSchema = new mongoose.Schema({
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  wholesalePrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'COP',
    enum: ['COP', 'USD', 'EUR']
  },
  taxRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 19 // IVA Colombia
  }
}, { _id: false });

// Esquema para información de inventario
const inventorySchema = new mongoose.Schema({
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  maximumStock: {
    type: Number,
    min: 0,
    default: 1000
  },
  reorderPoint: {
    type: Number,
    min: 0,
    default: 20
  },
  location: {
    type: String,
    trim: true,
    default: 'Bodega Principal'
  }
}, { _id: false });

// Esquema para proveedores del producto
const productSupplierSchema = new mongoose.Schema({
  supplierId: {
    type: String,
    required: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  supplierPrice: {
    type: Number,
    required: true,
    min: 0
  },
  leadTime: {
    type: Number,
    min: 1,
    default: 7 // días
  },
  isPreferred: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Esquema para especificaciones técnicas
const specificationsSchema = new mongoose.Schema({
  weight: String,
  dimensions: String,
  color: String,
  material: String,
  warranty: String,
  brand: String,
  model: String
}, { _id: false });

// Esquema para imágenes
const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    trim: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Esquema principal de Productos
const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    trim: true,
    sparse: true
  },
  barcode: {
    type: String,
    unique: true,
    trim: true,
    sparse: true
  },
  pricing: {
    type: pricingSchema,
    required: true
  },
  inventory: {
    type: inventorySchema,
    required: true,
    default: {}
  },
  suppliers: [productSupplierSchema],
  specifications: {
    type: specificationsSchema,
    default: {}
  },
  images: [imageSchema],
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Middleware para generar productId automáticamente
productSchema.pre('save', async function(next) {
  if (!this.productId) {
    const count = await mongoose.model('Product').countDocuments();
    this.productId = `PROD-${String(count + 1).padStart(3, '0')}`;
  }
  
  // Generar SKU automáticamente si no existe
  if (!this.sku) {
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const productNumber = String(await mongoose.model('Product').countDocuments() + 1).padStart(4, '0');
    this.sku = `${categoryCode}-${productNumber}`;
  }
  
  next();
});

// Índices
productSchema.index({ productId: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'inventory.currentStock': 1 });

// Métodos del esquema
productSchema.methods.updateStock = function(quantity, operation = 'add') {
  if (operation === 'add') {
    this.inventory.currentStock += quantity;
  } else if (operation === 'subtract') {
    this.inventory.currentStock = Math.max(0, this.inventory.currentStock - quantity);
  } else if (operation === 'set') {
    this.inventory.currentStock = Math.max(0, quantity);
  }
  return this.save();
};

productSchema.methods.needsReorder = function() {
  return this.inventory.currentStock <= this.inventory.reorderPoint;
};

productSchema.methods.isOutOfStock = function() {
  return this.inventory.currentStock === 0;
};

productSchema.methods.addSupplier = function(supplierData) {
  // Verificar si el proveedor ya existe
  const existingSupplier = this.suppliers.find(s => s.supplierId === supplierData.supplierId);
  if (existingSupplier) {
    throw new Error('El proveedor ya está asociado a este producto');
  }
  
  this.suppliers.push(supplierData);
  return this.save();
};

// Métodos estáticos
productSchema.statics.findLowStock = function() {
  return this.find({
    $expr: {
      $lte: ['$inventory.currentStock', '$inventory.reorderPoint']
    },
    status: 'active'
  });
};

productSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active' });
};

// Agregar plugin de paginación
productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
