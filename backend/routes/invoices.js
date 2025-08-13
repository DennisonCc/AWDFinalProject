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
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/invoices/stats
// @desc    Obtener estadísticas de facturas
// @access  Private
router.get('/stats', protect, getInvoiceStats);

// @route   GET /api/invoices
// @desc    Obtener todas las facturas
// @access  Private
router.get('/', protect, getInvoices);

// @route   GET /api/invoices/:id
// @desc    Obtener una factura por ID
// @access  Private
router.get('/:id', protect, getInvoiceById);

// @route   POST /api/invoices
// @desc    Crear nueva factura
// @access  Private (requiere permisos de invoice_create)
router.post('/', protect, authorize(['admin', 'manager', 'employee'], ['invoice_create']), createInvoice);

// @route   PUT /api/invoices/:id/status
// @desc    Actualizar estado de factura
// @access  Private (requiere permisos de invoice_update)
router.put('/:id/status', protect, authorize(['admin', 'manager'], ['invoice_update']), updateInvoiceStatus);

// @route   PUT /api/invoices/:id/payment
// @desc    Actualizar estado de pago
// @access  Private (requiere permisos de payment_update)
router.put('/:id/payment', protect, authorize(['admin', 'manager', 'employee'], ['payment_update']), updatePaymentStatus);

// @route   DELETE /api/invoices/:id
// @desc    Eliminar factura (solo en estado draft)
// @access  Private (requiere permisos de invoice_delete)
router.delete('/:id', protect, authorize(['admin', 'manager'], ['invoice_delete']), deleteInvoice);

module.exports = router;
