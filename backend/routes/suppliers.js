const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierCatalog,
  addToCatalog,
  updateCatalogProduct
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/suppliers
// @desc    Obtener todos los proveedores
// @access  Private
router.get('/', protect, authorize('suppliers:read'), getSuppliers);

// @route   GET /api/suppliers/:id
// @desc    Obtener un proveedor por ID
// @access  Private
router.get('/:id', protect, authorize('suppliers:read'), getSupplierById);

// @route   POST /api/suppliers
// @desc    Crear nuevo proveedor
// @access  Private (requiere permisos de suppliers:write)
router.post('/', protect, authorize('suppliers:write'), createSupplier);

// @route   PUT /api/suppliers/:id
// @desc    Actualizar proveedor
// @access  Private (requiere permisos de suppliers:write)
router.put('/:id', protect, authorize('suppliers:write'), updateSupplier);

// @route   DELETE /api/suppliers/:id
// @desc    Eliminar proveedor (soft delete)
// @access  Private (requiere permisos de suppliers:delete)
router.delete('/:id', protect, authorize('suppliers:delete'), deleteSupplier);

// @route   GET /api/suppliers/:id/catalog
// @desc    Obtener catálogo de un proveedor
// @access  Private
router.get('/:id/catalog', protect, authorize('suppliers:read'), getSupplierCatalog);

// @route   POST /api/suppliers/:id/catalog
// @desc    Agregar producto al catálogo del proveedor
// @access  Private (requiere permisos de suppliers:write)
router.post('/:id/catalog', protect, authorize('suppliers:write'), addToCatalog);

// @route   PUT /api/suppliers/:id/catalog/:productId
// @desc    Actualizar producto del catálogo
// @access  Private (requiere permisos de suppliers:write)
router.put('/:id/catalog/:productId', protect, authorize('suppliers:write'), updateCatalogProduct);

module.exports = router;
