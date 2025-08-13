const Supplier = require('../models/Supplier');
const logger = require('../utils/logger');

// @desc    Obtener todos los proveedores
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Construir filtros
    const filters = {};
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Opciones de paginación
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { name: 1 }
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

    const supplier = await Supplier.findById(id);

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
// @access  Private
const createSupplier = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      country
    } = req.body;

    // Verificar si ya existe un proveedor con el mismo email
    const existingSupplier = await Supplier.findOne({ email });

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un proveedor con ese email'
      });
    }

    // Crear nuevo proveedor
    const supplier = new Supplier({
      name,
      email,
      phone,
      address,
      country: country || 'Colombia'
    });

    await supplier.save();

    logger.info(`Proveedor creado: ${name} por sistema`);

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
// @access  Private
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    // Actualizar campos
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        supplier[key] = updateData[key];
      }
    });

    await supplier.save();

    logger.info(`Proveedor actualizado: ${supplier.name} por sistema`);

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

// @desc    Eliminar proveedor
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    logger.info(`Proveedor eliminado: ${supplier.name} por sistema`);

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



module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
