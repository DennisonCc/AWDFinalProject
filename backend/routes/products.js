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
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/products/search
// @desc    Buscar productos por diferentes criterios
// @access  Private
router.get('/search', protect, searchProducts);

// @route   GET /api/products/categories
// @desc    Obtener categorías de productos
// @access  Private
router.get('/categories', protect, getCategories);

// @route   GET /api/products/low-stock
// @desc    Obtener productos con bajo stock
// @access  Private
router.get('/low-stock', protect, getLowStockProducts);

// @route   GET /api/products
// @desc    Obtener todos los productos
// @access  Private
router.get('/', protect, getProducts);

// @route   GET /api/products/:id
// @desc    Obtener un producto por ID
// @access  Private
router.get('/:id', protect, getProductById);

// @route   POST /api/products
// @desc    Crear nuevo producto
// @access  Private (requiere permisos de products:write)
router.post('/', protect, authorize('products:write'), createProduct);

// @route   PUT /api/products/:id
// @desc    Actualizar producto
// @access  Private (requiere permisos de products:write)
router.put('/:id', protect, authorize('products:write'), updateProduct);

// @route   DELETE /api/products/:id
// @desc    Eliminar producto (soft delete)
// @access  Private (requiere permisos de products:delete)
router.delete('/:id', protect, authorize('products:delete'), deleteProduct);

// @route   PUT /api/products/:id/inventory
// @desc    Actualizar inventario de producto
// @access  Private (requiere permisos de products:write)
router.put('/:id/inventory', protect, authorize('products:write'), updateInventory);

module.exports = router;
