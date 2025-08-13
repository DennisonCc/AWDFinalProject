const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  updatePaymentStatus,
  deleteInvoice,
  getInvoiceStats
} = require('../controllers/invoiceController');

// @route   GET /api/invoices/stats
// @desc    Obtener estadísticas de facturas
// @access  Public
router.get('/stats', getInvoiceStats);

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

// @route   PUT /api/invoices/:id/status
// @desc    Actualizar estado de factura
// @access  Public
router.put('/:id/status', updateInvoiceStatus);

// @route   PUT /api/invoices/:id/payment
// @desc    Actualizar estado de pago
// @access  Public
router.put('/:id/payment', updatePaymentStatus);

// @route   DELETE /api/invoices/:id
// @desc    Eliminar factura (solo en estado draft)
// @access  Public
router.delete('/:id', deleteInvoice);

module.exports = router;
