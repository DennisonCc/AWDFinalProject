const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

// @route   GET /api/suppliers
// @desc    Obtener todos los proveedores
// @access  Public
router.get('/', getSuppliers);

// @route   GET /api/suppliers/:id
// @desc    Obtener un proveedor por ID
// @access  Public
router.get('/:id', getSupplierById);

// @route   POST /api/suppliers
// @desc    Crear nuevo proveedor
// @access  Public
router.post('/', createSupplier);

// @route   PUT /api/suppliers/:id
// @desc    Actualizar proveedor
// @access  Public
router.put('/:id', updateSupplier);

// @route   DELETE /api/suppliers/:id
// @desc    Eliminar proveedor (soft delete)
// @access  Public
router.delete('/:id', deleteSupplier);

module.exports = router;
