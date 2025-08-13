const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public (solo si no hay usuarios, sino requiere admin)
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login de usuario
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/profile
// @desc    Obtener perfil del usuario actual
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/auth/profile
// @desc    Actualizar perfil del usuario
// @access  Private
router.put('/profile', protect, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Cambiar contraseña
// @access  Private
router.put('/change-password', protect, changePassword);

module.exports = router;
