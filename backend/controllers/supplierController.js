const { Supplier } = require('../models');
const logger = require('../utils/logger');

// @desc    Obtener todos los proveedores
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, sortBy = 'company' } = req.query;

    // Construir filtros
    const filters = {};
    
    if (search) {
      filters.$or = [
        { company: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { supplierId: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filters.status = status;
    }

    // Opciones de paginación
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: 1 }
    };

    const suppliers = await Supplier.paginate(filters, options);

    res.json({
      success: true,
      data: suppliers.docs,
      pagination: {
        currentPage: suppliers.page,
        totalPages: suppliers.totalPages,
        totalDocs: suppliers.totalDocs,
        hasNextPage: suppliers.hasNextPage,
        hasPrevPage: suppliers.hasPrevPage
      }
    });

  } catch (error) {
    logger.error('Error obteniendo proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener un proveedor por ID
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findOne({ supplierId: id });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      data: supplier
    });

  } catch (error) {
    logger.error('Error obteniendo proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Crear nuevo proveedor
// @route   POST /api/suppliers
// @access  Private (requiere permisos de supplier_create)
const createSupplier = async (req, res) => {
  try {
    const {
      identificationNumber,
      company,
      contactName,
      phone,
      email,
      bankAccount,
      bankName,
      address,
      catalog
    } = req.body;

    // Verificar si ya existe un proveedor con el mismo número de identificación
    const existingSupplier = await Supplier.findOne({ identificationNumber });

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un proveedor con ese número de identificación'
      });
    }

    // Crear nuevo proveedor
    const supplier = new Supplier({
      identificationNumber,
      company,
      contactName,
      phone,
      email,
      bankAccount,
      bankName,
      address,
      catalog: catalog || []
    });

    await supplier.save();

    logger.info(`Proveedor creado: ${company} (${supplier.supplierId}) por usuario ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      data: supplier
    });

  } catch (error) {
    logger.error('Error creando proveedor:', error);
    
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

// @desc    Actualizar proveedor
// @route   PUT /api/suppliers/:id
// @access  Private (requiere permisos de supplier_update)
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const supplier = await Supplier.findOne({ supplierId: id });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    // Actualizar campos
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'supplierId') {
        supplier[key] = updateData[key];
      }
    });

    await supplier.save();

    logger.info(`Proveedor actualizado: ${supplier.company} (${supplier.supplierId}) por usuario ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Proveedor actualizado exitosamente',
      data: supplier
    });

  } catch (error) {
    logger.error('Error actualizando proveedor:', error);
    
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

// @desc    Eliminar proveedor (soft delete)
// @route   DELETE /api/suppliers/:id
// @access  Private (requiere permisos de supplier_delete)
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findOne({ supplierId: id });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    // Soft delete - cambiar status a inactive
    supplier.status = 'inactive';
    await supplier.save();

    logger.info(`Proveedor eliminado: ${supplier.company} (${supplier.supplierId}) por usuario ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente'
    });

  } catch (error) {
    logger.error('Error eliminando proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener catálogo de un proveedor
// @route   GET /api/suppliers/:id/catalog
// @access  Private
const getSupplierCatalog = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, search } = req.query;

    const supplier = await Supplier.findOne({ supplierId: id });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    let catalog = supplier.catalog;

    // Filtrar por categoría
    if (category) {
      catalog = catalog.filter(item => 
        item.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Filtrar por búsqueda
    if (search) {
      catalog = catalog.filter(item => 
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: {
        supplierId: supplier.supplierId,
        company: supplier.company,
        catalog
      }
    });

  } catch (error) {
    logger.error('Error obteniendo catálogo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Agregar producto al catálogo del proveedor
// @route   POST /api/suppliers/:id/catalog
// @access  Private (requiere permisos de supplier_update)
const addToCatalog = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const supplier = await Supplier.findOne({ supplierId: id });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    // Verificar si el producto ya existe en el catálogo
    const existingProduct = supplier.catalog.find(
      item => item.productId === productData.productId
    );

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'El producto ya existe en el catálogo del proveedor'
      });
    }

    // Agregar producto al catálogo
    supplier.catalog.push(productData);
    await supplier.save();

    logger.info(`Producto agregado al catálogo: ${productData.productName} al proveedor ${supplier.company} por usuario ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Producto agregado al catálogo exitosamente',
      data: productData
    });

  } catch (error) {
    logger.error('Error agregando al catálogo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Actualizar producto del catálogo
// @route   PUT /api/suppliers/:id/catalog/:productId
// @access  Private (requiere permisos de supplier_update)
const updateCatalogProduct = async (req, res) => {
  try {
    const { id, productId } = req.params;
    const updateData = req.body;

    const supplier = await Supplier.findOne({ supplierId: id });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    const productIndex = supplier.catalog.findIndex(
      item => item.productId === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el catálogo'
      });
    }

    // Actualizar producto
    supplier.catalog[productIndex] = { ...supplier.catalog[productIndex].toObject(), ...updateData };
    await supplier.save();

    logger.info(`Producto del catálogo actualizado: ${productId} del proveedor ${supplier.company} por usuario ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Producto del catálogo actualizado exitosamente',
      data: supplier.catalog[productIndex]
    });

  } catch (error) {
    logger.error('Error actualizando producto del catálogo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierCatalog,
  addToCatalog,
  updateCatalogProduct
};
