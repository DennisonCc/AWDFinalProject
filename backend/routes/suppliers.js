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
router.get('/', protect, getSuppliers);

// @route   GET /api/suppliers/:id
// @desc    Obtener un proveedor por ID
// @access  Private
router.get('/:id', protect, getSupplierById);

// @route   POST /api/suppliers
// @desc    Crear nuevo proveedor
// @access  Private (requiere permisos de supplier_create)
router.post('/', protect, authorize(['admin', 'manager'], ['supplier_create']), createSupplier);

// @route   PUT /api/suppliers/:id
// @desc    Actualizar proveedor
// @access  Private (requiere permisos de supplier_update)
router.put('/:id', protect, authorize(['admin', 'manager'], ['supplier_update']), updateSupplier);

// @route   DELETE /api/suppliers/:id
// @desc    Eliminar proveedor (soft delete)
// @access  Private (requiere permisos de supplier_delete)
router.delete('/:id', protect, authorize(['admin', 'manager'], ['supplier_delete']), deleteSupplier);

// @route   GET /api/suppliers/:id/catalog
// @desc    Obtener catálogo de un proveedor
// @access  Private
router.get('/:id/catalog', protect, getSupplierCatalog);

// @route   POST /api/suppliers/:id/catalog
// @desc    Agregar producto al catálogo del proveedor
// @access  Private (requiere permisos de supplier_update)
router.post('/:id/catalog', protect, authorize(['admin', 'manager'], ['supplier_update']), addToCatalog);

// @route   PUT /api/suppliers/:id/catalog/:productId
// @desc    Actualizar producto del catálogo
// @access  Private (requiere permisos de supplier_update)
router.put('/:id/catalog/:productId', protect, authorize(['admin', 'manager'], ['supplier_update']), updateCatalogProduct);

module.exports = router;
