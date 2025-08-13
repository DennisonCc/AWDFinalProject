const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// Middleware para verificar autenticación
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado.'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Usuario no encontrado.'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Cuenta inactiva.'
      });
    }

    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Cuenta bloqueada temporalmente debido a múltiples intentos fallidos.'
      });
    }

    // Agregar usuario a la petición
    req.user = user;
    next();
  } catch (error) {
    logger.error('Error en autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado.'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Token inválido.'
    });
  }
};

// Middleware para verificar permisos
const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Usuario no autenticado.'
      });
    }

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    const hasPermission = permissions.some(permission => 
      req.user.hasPermission(permission)
    );

    if (!hasPermission) {
      logger.warn(`Acceso denegado para usuario ${req.user.username}. Permisos requeridos: ${permissions.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Permisos insuficientes.'
      });
    }

    next();
  };
};

// Middleware para verificar roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Usuario no autenticado.'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Acceso denegado para usuario ${req.user.username}. Rol requerido: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Rol insuficiente.'
      });
    }

    next();
  };
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.status === 'active' && !user.isLocked) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Si hay error con el token, simplemente continuar sin usuario
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  authorizeRoles,
  optionalAuth
};
