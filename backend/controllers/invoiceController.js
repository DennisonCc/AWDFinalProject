const Invoice = require('../models/Invoice');
const logger = require('../utils/logger');

// @desc    Obtener todas las facturas
// @route   GET /api/invoices
// @access  Public
const getInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const options = {
      page,
      limit,
      sort: { createdAt: -1 }
    };

    const invoices = await Invoice.paginate({}, options);
    
    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    logger.error('Error getting invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas',
      error: error.message
    });
  }
};

// @desc    Obtener factura por ID
// @route   GET /api/invoices/:id
// @access  Public
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error('Error getting invoice by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener factura',
      error: error.message
    });
  }
};

// @desc    Crear nueva factura
// @route   POST /api/invoices
// @access  Public
const createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    const savedInvoice = await invoice.save();
    
    res.status(201).json({
      success: true,
      data: savedInvoice
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear factura',
      error: error.message
    });
  }
};

// @desc    Actualizar factura
// @route   PUT /api/invoices/:id
// @access  Public
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error('Error updating invoice:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar factura',
      error: error.message
    });
  }
};

// @desc    Eliminar factura
// @route   DELETE /api/invoices/:id
// @access  Public
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Factura eliminada exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar factura',
      error: error.message
    });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
