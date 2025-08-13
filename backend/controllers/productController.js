const { Product, Supplier } = require('../models');
const logger = require('../utils/logger');

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      subcategory, 
      status, 
      inStock,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filters.category = { $regex: category, $options: 'i' };
    }

    if (subcategory) {
      filters.subcategory = { $regex: subcategory, $options: 'i' };
    }

    if (status) {
      filters.status = status;
    }

    if (inStock === 'true') {
      filters['inventory.currentStock'] = { $gt: 0 };
    } else if (inStock === 'false') {
      filters['inventory.currentStock'] = { $lte: 0 };
    }

    // Opciones de paginación
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortDirection }
    };

    const products = await Product.paginate(filters, options);

    res.json({
      success: true,
      data: products.docs,
      pagination: {
        currentPage: products.page,
        totalPages: products.totalPages,
        totalDocs: products.totalDocs,
        hasNextPage: products.hasNextPage,
        hasPrevPage: products.hasPrevPage
      }
    });

  } catch (error) {
    logger.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ productId: id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    logger.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Crear nuevo producto
// @route   POST /api/products
// @access  Private (requiere permisos de product_create)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      sku,
      barcode,
      pricing,
      inventory,
      specifications,
      suppliers
    } = req.body;

    // Verificar si ya existe un producto con el mismo SKU o código de barras
    const existingProduct = await Product.findOne({
      $or: [
        { sku: sku },
        { barcode: barcode }
      ]
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un producto con ese SKU o código de barras'
      });
    }

    // Verificar que los proveedores existen
    if (suppliers && suppliers.length > 0) {
      for (const supplier of suppliers) {
        const supplierExists = await Supplier.findOne({ supplierId: supplier.supplierId });
        if (!supplierExists) {
          return res.status(400).json({
            success: false,
            message: `Proveedor ${supplier.supplierId} no encontrado`
          });
        }
      }
    }

    // Crear nuevo producto
    const product = new Product({
      name,
      description,
      category,
      subcategory,
      sku,
      barcode,
      pricing,
      inventory,
      specifications: specifications || {},
      suppliers: suppliers || []
    });

    await product.save();

    logger.info(`Producto creado: ${name} (${product.productId}) por usuario ${'sistema'}`);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: product
    });

  } catch (error) {
    logger.error('Error creando producto:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Datos de validación incorrectos',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Actualizar producto
// @route   PUT /api/products/:id
// @access  Private (requiere permisos de product_update)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findOne({ productId: id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar SKU y código de barras únicos si se están actualizando
    if (updateData.sku && updateData.sku !== product.sku) {
      const existingSku = await Product.findOne({ 
        sku: updateData.sku,
        productId: { $ne: id }
      });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un producto con ese SKU'
        });
      }
    }

    if (updateData.barcode && updateData.barcode !== product.barcode) {
      const existingBarcode = await Product.findOne({ 
        barcode: updateData.barcode,
        productId: { $ne: id }
      });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un producto con ese código de barras'
        });
      }
    }

    // Verificar proveedores si se están actualizando
    if (updateData.suppliers && updateData.suppliers.length > 0) {
      for (const supplier of updateData.suppliers) {
        const supplierExists = await Supplier.findOne({ supplierId: supplier.supplierId });
        if (!supplierExists) {
          return res.status(400).json({
            success: false,
            message: `Proveedor ${supplier.supplierId} no encontrado`
          });
        }
      }
    }

    // Actualizar campos
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'productId') {
        if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
          // Para objetos anidados como pricing, inventory, specifications
          product[key] = { ...product[key]?.toObject(), ...updateData[key] };
        } else {
          product[key] = updateData[key];
        }
      }
    });

    await product.save();

    logger.info(`Producto actualizado: ${product.name} (${product.productId}) por usuario ${'sistema'}`);

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: product
    });

  } catch (error) {
    logger.error('Error actualizando producto:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Datos de validación incorrectos',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Eliminar producto (soft delete)
// @route   DELETE /api/products/:id
// @access  Private (requiere permisos de product_delete)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ productId: id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Soft delete - cambiar status a discontinued
    product.status = 'discontinued';
    await product.save();

    logger.info(`Producto eliminado: ${product.name} (${product.productId}) por usuario ${'sistema'}`);

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    logger.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Actualizar inventario de producto
// @route   PUT /api/products/:id/inventory
// @access  Private (requiere permisos de inventory_update)
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { operation, quantity, reason } = req.body;

    if (!operation || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Operación y cantidad son requeridos'
      });
    }

    const product = await Product.findOne({ productId: id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    let newStock = product.inventory.currentStock;

    switch (operation) {
      case 'add':
        newStock += quantity;
        break;
      case 'subtract':
        if (quantity > product.inventory.currentStock) {
          return res.status(400).json({
            success: false,
            message: 'No hay suficiente stock disponible'
          });
        }
        newStock -= quantity;
        break;
      case 'set':
        newStock = quantity;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Operación inválida. Use: add, subtract, o set'
        });
    }

    // Actualizar inventario
    const previousStock = product.inventory.currentStock;
    product.inventory.currentStock = newStock;
    product.inventory.lastUpdated = new Date();

    // Agregar al historial de movimientos
    product.inventory.movements.push({
      date: new Date(),
      type: operation,
      quantity: quantity,
      previousStock: previousStock,
      newStock: newStock,
      reason: reason || `Ajuste de inventario: ${operation}`,
      userId: 'sistema'
    });

    await product.save();

    logger.info(`Inventario actualizado: ${product.name} (${product.productId}) - ${operation} ${quantity} unidades por usuario ${'sistema'}`);

    res.json({
      success: true,
      message: 'Inventario actualizado exitosamente',
      data: {
        productId: product.productId,
        name: product.name,
        previousStock,
        newStock,
        operation,
        quantity
      }
    });

  } catch (error) {
    logger.error('Error actualizando inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener productos con bajo stock
// @route   GET /api/products/low-stock
// @access  Private
const getLowStockProducts = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const lowStockProducts = await Product.aggregate([
      {
        $match: {
          status: 'active',
          $expr: {
            $lte: ['$inventory.currentStock', '$inventory.reorderPoint']
          }
        }
      },
      {
        $sort: { 'inventory.currentStock': 1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: lowStockProducts,
      count: lowStockProducts.length
    });

  } catch (error) {
    logger.error('Error obteniendo productos con bajo stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener categorías de productos
// @route   GET /api/products/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { status: 'active' });
    const subcategories = await Product.distinct('subcategory', { status: 'active' });

    res.json({
      success: true,
      data: {
        categories: categories.sort(),
        subcategories: subcategories.sort()
      }
    });

  } catch (error) {
    logger.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Buscar productos por diferentes criterios
// @route   GET /api/products/search
// @access  Private
const searchProducts = async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Parámetro de búsqueda requerido'
      });
    }

    let searchFilters = { status: 'active' };

    switch (type) {
      case 'sku':
        searchFilters.sku = { $regex: q, $options: 'i' };
        break;
      case 'barcode':
        searchFilters.barcode = { $regex: q, $options: 'i' };
        break;
      case 'category':
        searchFilters.category = { $regex: q, $options: 'i' };
        break;
      default:
        searchFilters.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { sku: { $regex: q, $options: 'i' } },
          { barcode: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ];
    }

    const products = await Product.find(searchFilters)
      .limit(parseInt(limit))
      .select('productId name sku barcode category pricing.sellingPrice inventory.currentStock status')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    logger.error('Error buscando productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  getLowStockProducts,
  getCategories,
  searchProducts
};
