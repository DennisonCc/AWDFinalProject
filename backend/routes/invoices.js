const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');

// @route   GET /api/invoices
// @desc    Obtener todas las facturas
// @access  Public
router.get('/', getInvoices);

// @route   GET /api/invoices/:id
// @desc    Obtener una factura por ID
// @access  Public
router.get('/:id', getInvoiceById);

// @route   POST /api/invoices
// @desc    Crear nueva factura
// @access  Public
router.post('/', createInvoice);

// @route   PUT /api/invoices/:id
// @desc    Actualizar factura
// @access  Public
router.put('/:id', updateInvoice);

// @route   DELETE /api/invoices/:id
// @desc    Eliminar factura
// @access  Public
router.delete('/:id', deleteInvoice);

module.exports = router;
