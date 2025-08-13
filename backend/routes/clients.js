const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientInvoices,
  getClientStats,
  searchClients
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/clients/search
// @desc    Buscar clientes por diferentes criterios
// @access  Private
router.get('/search', protect, searchClients);

// @route   GET /api/clients
// @desc    Obtener todos los clientes
// @access  Private
router.get('/', protect, getClients);

// @route   GET /api/clients/:id
// @desc    Obtener un cliente por ID
// @access  Private
router.get('/:id', protect, getClientById);

// @route   POST /api/clients
// @desc    Crear nuevo cliente
// @access  Private (requiere permisos de clients:write)
router.post('/', protect, authorize('clients:write'), createClient);

// @route   PUT /api/clients/:id
// @desc    Actualizar cliente
// @access  Private (requiere permisos de clients:write)
router.put('/:id', protect, authorize('clients:write'), updateClient);

// @route   DELETE /api/clients/:id
// @desc    Eliminar cliente (soft delete)
// @access  Private (requiere permisos de clients:delete)
router.delete('/:id', protect, authorize('clients:delete'), deleteClient);

// @route   GET /api/clients/:id/invoices
// @desc    Obtener historial de facturas del cliente
// @access  Private
router.get('/:id/invoices', protect, getClientInvoices);

// @route   GET /api/clients/:id/stats
// @desc    Obtener estadísticas del cliente
// @access  Private
router.get('/:id/stats', protect, getClientStats);

module.exports = router;
