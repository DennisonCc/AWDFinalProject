const { Client } = require('../models');
const logger = require('../utils/logger');

// @desc    Obtener todos los clientes
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, clientType, status, sortBy = 'personalInfo.lastName' } = req.query;

    // Construir filtros
    const filters = {};
    
    if (search) {
      filters.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } },
        { 'businessInfo.companyName': { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } },
        { taxId: { $regex: search, $options: 'i' } }
      ];
    }

    if (clientType) {
      filters.clientType = clientType;
    }

    if (status) {
      filters.status = status;
    }

    // Opciones de paginación
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: 1 }
    };

    const clients = await Client.paginate(filters, options);

    res.json({
      success: true,
      data: clients.docs,
      pagination: {
        currentPage: clients.page,
        totalPages: clients.totalPages,
        totalDocs: clients.totalDocs,
        hasNextPage: clients.hasNextPage,
        hasPrevPage: clients.hasPrevPage
      }
    });

  } catch (error) {
    logger.error('Error obteniendo clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener un cliente por ID
// @route   GET /api/clients/:id
// @access  Private
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({ clientId: id });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: client
    });

  } catch (error) {
    logger.error('Error obteniendo cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Crear nuevo cliente
// @route   POST /api/clients
// @access  Private (requiere permisos de client_create)
const createClient = async (req, res) => {
  try {
    const {
      taxId,
      clientType,
      personalInfo,
      businessInfo,
      address,
      preferences
    } = req.body;

    // Verificar si ya existe un cliente con el mismo taxId
    const existingClient = await Client.findOne({ taxId });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cliente con ese número de identificación fiscal'
      });
    }

    // Verificar email único si se proporciona
    if (personalInfo?.email) {
      const existingEmail = await Client.findOne({ 'personalInfo.email': personalInfo.email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese email'
        });
      }
    }

    // Crear nuevo cliente
    const client = new Client({
      taxId,
      clientType,
      personalInfo,
      businessInfo,
      address,
      preferences: preferences || {}
    });

    await client.save();

    logger.info(`Cliente creado: ${personalInfo?.firstName} ${personalInfo?.lastName || businessInfo?.companyName} (${client.clientId}) por usuario ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: client
    });

  } catch (error) {
    logger.error('Error creando cliente:', error);
    
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

// @desc    Actualizar cliente
// @route   PUT /api/clients/:id
// @access  Private (requiere permisos de client_update)
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const client = await Client.findOne({ clientId: id });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Verificar email único si se está actualizando
    if (updateData.personalInfo?.email && updateData.personalInfo.email !== client.personalInfo?.email) {
      const existingEmail = await Client.findOne({ 
        'personalInfo.email': updateData.personalInfo.email,
        clientId: { $ne: id }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese email'
        });
      }
    }

    // Actualizar campos
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'clientId') {
        if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
          // Para objetos anidados como personalInfo, businessInfo, etc.
          client[key] = { ...client[key]?.toObject(), ...updateData[key] };
        } else {
          client[key] = updateData[key];
        }
      }
    });

    await client.save();

    logger.info(`Cliente actualizado: ${client.personalInfo?.firstName} ${client.personalInfo?.lastName || client.businessInfo?.companyName} (${client.clientId}) por usuario ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: client
    });

  } catch (error) {
    logger.error('Error actualizando cliente:', error);
    
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

// @desc    Eliminar cliente (soft delete)
// @route   DELETE /api/clients/:id
// @access  Private (requiere permisos de client_delete)
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({ clientId: id });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Soft delete - cambiar status a inactive
    client.status = 'inactive';
    await client.save();

    logger.info(`Cliente eliminado: ${client.personalInfo?.firstName} ${client.personalInfo?.lastName || client.businessInfo?.companyName} (${client.clientId}) por usuario ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });

  } catch (error) {
    logger.error('Error eliminando cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener historial de facturas del cliente
// @route   GET /api/clients/:id/invoices
// @access  Private
const getClientInvoices = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;

    const client = await Client.findOne({ clientId: id });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Construir filtros para las facturas
    const filters = { clientId: id };

    if (status) {
      filters.status = status;
    }

    if (dateFrom || dateTo) {
      filters['dates.issueDate'] = {};
      if (dateFrom) filters['dates.issueDate'].$gte = new Date(dateFrom);
      if (dateTo) filters['dates.issueDate'].$lte = new Date(dateTo);
    }

    // Importar modelo Invoice dinámicamente para evitar dependencia circular
    const { Invoice } = require('../models');

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { 'dates.issueDate': -1 }
    };

    const invoices = await Invoice.paginate(filters, options);

    res.json({
      success: true,
      data: {
        client: {
          clientId: client.clientId,
          name: client.personalInfo?.firstName ? 
            `${client.personalInfo.firstName} ${client.personalInfo.lastName}` : 
            client.businessInfo?.companyName,
          email: client.personalInfo?.email || client.businessInfo?.email
        },
        invoices: invoices.docs,
        pagination: {
          currentPage: invoices.page,
          totalPages: invoices.totalPages,
          totalDocs: invoices.totalDocs,
          hasNextPage: invoices.hasNextPage,
          hasPrevPage: invoices.hasPrevPage
        }
      }
    });

  } catch (error) {
    logger.error('Error obteniendo facturas del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener estadísticas del cliente
// @route   GET /api/clients/:id/stats
// @access  Private
const getClientStats = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({ clientId: id });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Calcular estadísticas del cliente
    const { Invoice } = require('../models');

    const stats = await Invoice.aggregate([
      { $match: { clientId: id, status: { $ne: 'cancelled' } } },
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
          }
        }
      }
    ]);

    const clientStats = stats.length > 0 ? stats[0] : {
      totalInvoices: 0,
      totalAmount: 0,
      averageAmount: 0,
      paidAmount: 0,
      pendingAmount: 0
    };

    res.json({
      success: true,
      data: {
        client: {
          clientId: client.clientId,
          name: client.personalInfo?.firstName ? 
            `${client.personalInfo.firstName} ${client.personalInfo.lastName}` : 
            client.businessInfo?.companyName,
          clientType: client.clientType,
          status: client.status,
          createdAt: client.createdAt
        },
        stats: clientStats
      }
    });

  } catch (error) {
    logger.error('Error obteniendo estadísticas del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Buscar clientes por diferentes criterios
// @route   GET /api/clients/search
// @access  Private
const searchClients = async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Parámetro de búsqueda requerido'
      });
    }

    let searchFilters = {};

    switch (type) {
      case 'email':
        searchFilters = {
          $or: [
            { 'personalInfo.email': { $regex: q, $options: 'i' } },
            { 'businessInfo.email': { $regex: q, $options: 'i' } }
          ]
        };
        break;
      case 'phone':
        searchFilters = {
          $or: [
            { 'personalInfo.phone': { $regex: q, $options: 'i' } },
            { 'businessInfo.phone': { $regex: q, $options: 'i' } }
          ]
        };
        break;
      case 'company':
        searchFilters = {
          'businessInfo.companyName': { $regex: q, $options: 'i' }
        };
        break;
      default:
        searchFilters = {
          $or: [
            { 'personalInfo.firstName': { $regex: q, $options: 'i' } },
            { 'personalInfo.lastName': { $regex: q, $options: 'i' } },
            { 'personalInfo.email': { $regex: q, $options: 'i' } },
            { 'businessInfo.companyName': { $regex: q, $options: 'i' } },
            { clientId: { $regex: q, $options: 'i' } },
            { taxId: { $regex: q, $options: 'i' } }
          ]
        };
    }

    const clients = await Client.find(searchFilters)
      .limit(parseInt(limit))
      .select('clientId personalInfo businessInfo clientType status')
      .sort({ 'personalInfo.lastName': 1 });

    res.json({
      success: true,
      data: clients
    });

  } catch (error) {
    logger.error('Error buscando clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientInvoices,
  getClientStats,
  searchClients
};
