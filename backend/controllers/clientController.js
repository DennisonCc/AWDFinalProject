const Client = require('../models/Client');
const logger = require('../utils/logger');

// @desc    Obtener todos los clientes
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Construir filtros
    const filters = {};
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { document: { $regex: search, $options: 'i' } }
      ];
    }

    // Opciones de paginación
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { name: 1 }
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

    const client = await Client.findById(id);

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
// @access  Private
const createClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      document
    } = req.body;

    // Verificar si ya existe un cliente con el mismo documento
    const existingClient = await Client.findOne({ document });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cliente con ese documento'
      });
    }

    // Verificar email único
    const existingEmail = await Client.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cliente con ese email'
      });
    }

    // Crear nuevo cliente
    const client = new Client({
      name,
      email,
      phone,
      address,
      document
    });

    await client.save();

    logger.info(`Cliente creado: ${name} por sistema`);

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
// @access  Private
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Verificar email único si se está actualizando
    if (updateData.email && updateData.email !== client.email) {
      const existingEmail = await Client.findOne({ 
        email: updateData.email,
        _id: { $ne: id }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese email'
        });
      }
    }

    // Verificar documento único si se está actualizando
    if (updateData.document && updateData.document !== client.document) {
      const existingDoc = await Client.findOne({ 
        document: updateData.document,
        _id: { $ne: id }
      });
      if (existingDoc) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese documento'
        });
      }
    }

    // Actualizar campos
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        client[key] = updateData[key];
      }
    });

    await client.save();

    logger.info(`Cliente actualizado: ${client.name} por sistema`);

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

// @desc    Eliminar cliente
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    logger.info(`Cliente eliminado: ${client.name} por sistema`);

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

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
