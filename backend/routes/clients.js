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

// @route   GET /api/clients/search
// @desc    Buscar clientes por diferentes criterios
// @access  Public
router.get('/search', searchClients);

// @route   GET /api/clients
// @desc    Obtener todos los clientes
// @access  Public
router.get('/', getClients);

// @route   GET /api/clients/:id
// @desc    Obtener un cliente por ID
// @access  Public
router.get('/:id', getClientById);

// @route   POST /api/clients
// @desc    Crear nuevo cliente
// @access  Public
router.post('/', createClient);

// @route   PUT /api/clients/:id
// @desc    Actualizar cliente
// @access  Public
router.put('/:id', updateClient);

// @route   DELETE /api/clients/:id
// @desc    Eliminar cliente (soft delete)
// @access  Public
router.delete('/:id', deleteClient);

// @route   GET /api/clients/:id/invoices
// @desc    Obtener historial de facturas del cliente
// @access  Public
router.get('/:id/invoices', getClientInvoices);

// @route   GET /api/clients/:id/stats
// @desc    Obtener estadísticas del cliente
// @access  Public
router.get('/:id/stats', getClientStats);

module.exports = router;
