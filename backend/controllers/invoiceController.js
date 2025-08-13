const { Invoice, Client, Product } = require('../models');
const logger = require('../utils/logger');

// @desc    Obtener todas las facturas
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      paymentStatus,
      clientId,
      dateFrom,
      dateTo,
      sortBy = 'dates.issueDate',
      sortOrder = 'desc'
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (search) {
      filters.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { invoiceId: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } },
        { 'clientInfo.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filters.status = status;
    }

    if (paymentStatus) {
      filters['paymentInfo.status'] = paymentStatus;
    }

    if (clientId) {
      filters.clientId = clientId;
    }

    if (dateFrom || dateTo) {
      filters['dates.issueDate'] = {};
      if (dateFrom) filters['dates.issueDate'].$gte = new Date(dateFrom);
      if (dateTo) filters['dates.issueDate'].$lte = new Date(dateTo);
    }

    // Opciones de paginación
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortDirection }
    };

    const invoices = await Invoice.paginate(filters, options);

    res.json({
      success: true,
      data: invoices.docs,
      pagination: {
        currentPage: invoices.page,
        totalPages: invoices.totalPages,
        totalDocs: invoices.totalDocs,
        hasNextPage: invoices.hasNextPage,
        hasPrevPage: invoices.hasPrevPage
      }
    });

  } catch (error) {
    logger.error('Error obteniendo facturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener una factura por ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findOne({ invoiceId: id });

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
    logger.error('Error obteniendo factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Crear nueva factura
// @route   POST /api/invoices
// @access  Private (requiere permisos de invoice_create)
const createInvoice = async (req, res) => {
  try {
    const {
      clientId,
      items,
      discountPercentage = 0,
      discountAmount = 0,
      taxes = [],
      notes = '',
      paymentTerms = 'immediate'
    } = req.body;

    // Verificar que el cliente existe
    const client = await Client.findOne({ clientId });
    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Verificar que todos los productos existen y tienen stock
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findOne({ productId: item.productId });
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Producto ${item.productId} no encontrado`
        });
      }

      if (product.inventory.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name}. Disponible: ${product.inventory.currentStock}, Solicitado: ${item.quantity}`
        });
      }

      // Calcular totales del item
      const unitPrice = item.unitPrice || product.pricing.sellingPrice;
      const lineTotal = unitPrice * item.quantity;

      processedItems.push({
        productId: product.productId,
        productName: product.name,
        sku: product.sku,
        description: item.description || product.description,
        quantity: item.quantity,
        unitPrice: unitPrice,
        lineTotal: lineTotal
      });

      subtotal += lineTotal;
    }

    // Calcular descuentos
    let totalDiscount = discountAmount;
    if (discountPercentage > 0) {
      totalDiscount = (subtotal * discountPercentage) / 100;
    }

    // Calcular impuestos
    const subtotalAfterDiscount = subtotal - totalDiscount;
    let totalTaxes = 0;
    const processedTaxes = taxes.map(tax => {
      const taxAmount = (subtotalAfterDiscount * tax.rate) / 100;
      totalTaxes += taxAmount;
      return {
        name: tax.name,
        rate: tax.rate,
        amount: taxAmount
      };
    });

    // Total final
    const finalAmount = subtotalAfterDiscount + totalTaxes;

    // Preparar información del cliente
    const clientInfo = {
      clientId: client.clientId,
      name: client.personalInfo?.firstName ? 
        `${client.personalInfo.firstName} ${client.personalInfo.lastName}` : 
        client.businessInfo?.companyName,
      email: client.personalInfo?.email || client.businessInfo?.email,
      phone: client.personalInfo?.phone || client.businessInfo?.phone,
      address: client.address,
      taxId: client.taxId
    };

    // Crear factura
    const invoice = new Invoice({
      clientId,
      clientInfo,
      items: processedItems,
      totals: {
        subtotal,
        discountPercentage,
        discountAmount: totalDiscount,
        taxesAmount: totalTaxes,
        finalAmount
      },
      taxes: processedTaxes,
      notes,
      paymentInfo: {
        terms: paymentTerms,
        status: 'pending'
      }
    });

    await invoice.save();

    // Actualizar inventario de productos
    for (const item of processedItems) {
      await Product.updateOne(
        { productId: item.productId },
        { 
          $inc: { 'inventory.currentStock': -item.quantity },
          $set: { 'inventory.lastUpdated': new Date() },
          $push: {
            'inventory.movements': {
              date: new Date(),
              type: 'sale',
              quantity: item.quantity,
              reason: `Venta - Factura ${invoice.invoiceNumber}`,
              userId: req.user.userId,
              reference: invoice.invoiceId
            }
          }
        }
      );
    }

    logger.info(`Factura creada: ${invoice.invoiceNumber} (${invoice.invoiceId}) para cliente ${clientId} por usuario ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: invoice
    });

  } catch (error) {
    logger.error('Error creando factura:', error);
    
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

// @desc    Actualizar estado de factura
// @route   PUT /api/invoices/:id/status
// @access  Private (requiere permisos de invoice_update)
const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de factura inválido'
      });
    }

    const invoice = await Invoice.findOne({ invoiceId: id });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Validar transiciones de estado
    if (invoice.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cambiar el estado de una factura cancelada'
      });
    }

    if (invoice.status === 'paid' && status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una factura ya pagada'
      });
    }

    const oldStatus = invoice.status;
    invoice.status = status;

    // Si se cancela la factura, devolver productos al inventario
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of invoice.items) {
        await Product.updateOne(
          { productId: item.productId },
          { 
            $inc: { 'inventory.currentStock': item.quantity },
            $set: { 'inventory.lastUpdated': new Date() },
            $push: {
              'inventory.movements': {
                date: new Date(),
                type: 'return',
                quantity: item.quantity,
                reason: `Devolución - Factura cancelada ${invoice.invoiceNumber}`,
                userId: req.user.userId,
                reference: invoice.invoiceId
              }
            }
          }
        );
      }
    }

    // Agregar al historial
    invoice.statusHistory.push({
      status: status,
      date: new Date(),
      reason: reason || `Estado cambiado a ${status}`,
      userId: req.user.userId
    });

    await invoice.save();

    logger.info(`Estado de factura actualizado: ${invoice.invoiceNumber} de ${oldStatus} a ${status} por usuario ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Estado de factura actualizado exitosamente',
      data: {
        invoiceId: invoice.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        oldStatus,
        newStatus: status
      }
    });

  } catch (error) {
    logger.error('Error actualizando estado de factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Actualizar estado de pago
// @route   PUT /api/invoices/:id/payment
// @access  Private (requiere permisos de payment_update)
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, paymentDate, transactionId, amount } = req.body;

    const validPaymentStatuses = ['pending', 'partial', 'paid', 'overdue'];
    
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de pago inválido'
      });
    }

    const invoice = await Invoice.findOne({ invoiceId: id });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'No se puede procesar pago de una factura cancelada'
      });
    }

    const oldPaymentStatus = invoice.paymentInfo.status;

    // Actualizar información de pago
    invoice.paymentInfo.status = paymentStatus;
    
    if (paymentMethod) invoice.paymentInfo.method = paymentMethod;
    if (paymentDate) invoice.paymentInfo.paidDate = new Date(paymentDate);
    if (transactionId) invoice.paymentInfo.transactionId = transactionId;

    // Si se marca como pagado, actualizar estado de factura
    if (paymentStatus === 'paid') {
      invoice.status = 'paid';
      invoice.dates.paidDate = invoice.paymentInfo.paidDate || new Date();
    }

    // Agregar al historial de pagos
    if (amount) {
      invoice.paymentInfo.payments.push({
        amount: amount,
        date: new Date(paymentDate || Date.now()),
        method: paymentMethod,
        transactionId: transactionId,
        userId: req.user.userId
      });
    }

    await invoice.save();

    logger.info(`Pago actualizado: ${invoice.invoiceNumber} de ${oldPaymentStatus} a ${paymentStatus} por usuario ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Estado de pago actualizado exitosamente',
      data: {
        invoiceId: invoice.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        oldPaymentStatus,
        newPaymentStatus: paymentStatus,
        totalAmount: invoice.totals.finalAmount
      }
    });

  } catch (error) {
    logger.error('Error actualizando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Eliminar factura (solo en estado draft)
// @route   DELETE /api/invoices/:id
// @access  Private (requiere permisos de invoice_delete)
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findOne({ invoiceId: id });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    if (invoice.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden eliminar facturas en estado borrador'
      });
    }

    // Devolver productos al inventario
    for (const item of invoice.items) {
      await Product.updateOne(
        { productId: item.productId },
        { 
          $inc: { 'inventory.currentStock': item.quantity },
          $set: { 'inventory.lastUpdated': new Date() },
          $push: {
            'inventory.movements': {
              date: new Date(),
              type: 'return',
              quantity: item.quantity,
              reason: `Devolución - Factura eliminada ${invoice.invoiceNumber}`,
              userId: req.user.userId,
              reference: invoice.invoiceId
            }
          }
        }
      );
    }

    await Invoice.deleteOne({ invoiceId: id });

    logger.info(`Factura eliminada: ${invoice.invoiceNumber} (${invoice.invoiceId}) por usuario ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Factura eliminada exitosamente'
    });

  } catch (error) {
    logger.error('Error eliminando factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener estadísticas de facturas
// @route   GET /api/invoices/stats
// @access  Private
const getInvoiceStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Calcular fecha de inicio según el período
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const stats = await Invoice.aggregate([
      {
        $match: {
          'dates.issueDate': { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$totals.finalAmount' },
          averageAmount: { $avg: '$totals.finalAmount' },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentInfo.status', 'paid'] }, '$totals.finalAmount', 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentInfo.status', 'pending'] }, '$totals.finalAmount', 0]
            }
          },
          overdueAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentInfo.status', 'overdue'] }, '$totals.finalAmount', 0]
            }
          }
        }
      }
    ]);

    const invoiceStats = stats.length > 0 ? stats[0] : {
      totalInvoices: 0,
      totalAmount: 0,
      averageAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0
    };

    // Estadísticas por estado
    const statusStats = await Invoice.aggregate([
      {
        $match: {
          'dates.issueDate': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$totals.finalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        summary: invoiceStats,
        byStatus: statusStats
      }
    });

  } catch (error) {
    logger.error('Error obteniendo estadísticas de facturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  updatePaymentStatus,
  deleteInvoice,
  getInvoiceStats
};
