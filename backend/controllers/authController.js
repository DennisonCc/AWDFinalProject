const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// Generar JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public (solo si no hay usuarios, sino requiere admin)
const registerUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role = 'employee' } = req.body;

    // Verificar si ya existe un usuario con ese username o email
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con ese username o email'
      });
    }

    // Verificar si es el primer usuario (auto-admin) o requiere permisos
    const userCount = await User.countDocuments();
    let finalRole = role;

    if (userCount === 0) {
      finalRole = 'admin'; // Primer usuario es admin automáticamente
    } else {
      // Si no es el primer usuario, verificar permisos de admin
      if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden crear usuarios'
        });
      }
    }

    // Crear nuevo usuario
    const user = new User({
      username,
      email,
      password,
      profile: {
        firstName,
        lastName
      },
      role: finalRole
    });

    await user.save();

    // Generar token
    const token = generateToken(user.userId);

    logger.info(`Usuario registrado: ${username} (${user.userId})`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      token
    });

  } catch (error) {
    logger.error('Error en registro de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar que se proporcionen username y password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username y password son requeridos'
      });
    }

    // Buscar usuario (incluyendo password para comparación)
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar estado de la cuenta
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada o bloqueada'
      });
    }

    // Verificar password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      await user.incrementLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Reset intentos fallidos en login exitoso
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar token
    const token = generateToken(user.userId);

    logger.info(`Usuario logueado: ${username} (${user.userId})`);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        permissions: user.permissions
      },
      token
    });

  } catch (error) {
    logger.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener perfil del usuario actual
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userId: 'sistema' });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        permissions: user.permissions,
        settings: user.settings,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    logger.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, settings } = req.body;

    const user = await User.findOne({ userId: 'sistema' });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar campos del perfil
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (phone) user.profile.phone = phone;
    if (settings) user.settings = { ...user.settings, ...settings };

    await user.save();

    logger.info(`Perfil actualizado: ${user.username} (${user.userId})`);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        profile: user.profile,
        settings: user.settings
      }
    });

  } catch (error) {
    logger.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son requeridas'
      });
    }

    const user = await User.findOne({ userId: 'sistema' }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    logger.info(`Contraseña cambiada: ${user.username} (${user.userId})`);

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    logger.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword
};
