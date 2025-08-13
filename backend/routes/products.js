const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// @route   GET /api/products
// @desc    Obtener todos los productos
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/:id
// @desc    Obtener un producto por ID
// @access  Public
router.get('/:id', getProductById);

// @route   POST /api/products
// @desc    Crear nuevo producto
// @access  Public
router.post('/', createProduct);

// @route   PUT /api/products/:id
// @desc    Actualizar producto
// @access  Public
router.put('/:id', updateProduct);

// @route   DELETE /api/products/:id
// @desc    Eliminar producto
// @access  Public
router.delete('/:id', deleteProduct);

module.exports = router;
