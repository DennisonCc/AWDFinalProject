const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  getLowStockProducts,
  getCategories,
  searchProducts
} = require('../controllers/productController');

// @route   GET /api/products/search
// @desc    Buscar productos por diferentes criterios
// @access  Public
router.get('/search', searchProducts);

// @route   GET /api/products/categories
// @desc    Obtener categorías de productos
// @access  Public
router.get('/categories', getCategories);

// @route   GET /api/products/low-stock
// @desc    Obtener productos con bajo stock
// @access  Public
router.get('/low-stock', getLowStockProducts);

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
// @desc    Eliminar producto (soft delete)
// @access  Public
router.delete('/:id', deleteProduct);

// @route   PUT /api/products/:id/inventory
// @desc    Actualizar inventario de producto
// @access  Public
router.put('/:id/inventory', updateInventory);

module.exports = router;
