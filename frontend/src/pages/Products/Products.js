import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  AddCircle as AddStockIcon,
  RemoveCircle as RemoveStockIcon
} from '@mui/icons-material';
import productService from '../../services/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    minStock: '',
    supplier: '',
    sku: ''
  });

  const [stockData, setStockData] = useState({
    quantity: '',
    operation: 'add'
  });

  const categories = [
    'Electrónicos',
    'Ropa',
    'Hogar',
    'Deportes',
    'Libros',
    'Juguetes',
    'Salud',
    'Belleza',
    'Automóvil',
    'Otros'
  ];

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll(1, 50, searchTerm);
      setProducts(response.data || []);
    } catch (error) {
      showNotification('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock)
      };

      if (editingProduct) {
        await productService.update(editingProduct._id, productData);
        showNotification('Producto actualizado exitosamente');
      } else {
        await productService.create(productData);
        showNotification('Producto creado exitosamente');
      }
      setOpenDialog(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      showNotification(error.message || 'Error al guardar producto', 'error');
    }
  };

  const handleStockUpdate = async () => {
    try {
      await productService.updateStock(
        stockProduct._id, 
        parseInt(stockData.quantity), 
        stockData.operation
      );
      showNotification(`Stock ${stockData.operation === 'add' ? 'aumentado' : 'reducido'} exitosamente`);
      setOpenStockDialog(false);
      setStockProduct(null);
      setStockData({ quantity: '', operation: 'add' });
      loadProducts();
    } catch (error) {
      showNotification(error.message || 'Error al actualizar stock', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      minStock: '',
      supplier: '',
      sku: ''
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      stock: product.stock || '',
      minStock: product.minStock || '',
      supplier: product.supplier || '',
      sku: product.sku || ''
    });
    setOpenDialog(true);
  };

  const handleStockDialog = (product) => {
    setStockProduct(product);
    setOpenStockDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      try {
        await productService.delete(id);
        showNotification('Producto eliminado exitosamente');
        loadProducts();
      } catch (error) {
        showNotification(error.message || 'Error al eliminar producto', 'error');
      }
    }
  };

  const getStockColor = (stock, minStock) => {
    if (stock === 0) return 'error';
    if (stock <= minStock) return 'warning';
    return 'success';
  };

  const getStockLabel = (stock, minStock) => {
    if (stock === 0) return 'Sin Stock';
    if (stock <= minStock) return 'Stock Bajo';
    return 'En Stock';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Productos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Nuevo Producto
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Paper>

      {loading ? (
        <Typography>Cargando...</Typography>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2">
                      {product.name}
                    </Typography>
                  </Box>
                  
                  <Typography color="textSecondary" gutterBottom>
                    {product.description}
                  </Typography>
                  
                  <Typography variant="h6" color="primary" gutterBottom>
                    ${product.price?.toFixed(2)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={product.category} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={getStockLabel(product.stock, product.minStock)}
                      size="small" 
                      color={getStockColor(product.stock, product.minStock)}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary">
                    Stock: {product.stock} unidades
                  </Typography>
                  
                  {product.sku && (
                    <Typography variant="body2" color="textSecondary">
                      SKU: {product.sku}
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleEdit(product)}
                    title="Editar"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="info"
                    onClick={() => handleStockDialog(product)}
                    title="Gestionar Stock"
                  >
                    <InventoryIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(product._id)}
                    title="Eliminar"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {products.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <InventoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No hay productos registrados
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Haz clic en "Nuevo Producto" para agregar el primero
          </Typography>
        </Paper>
      )}

      {/* Dialog para crear/editar producto */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del producto"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.category}
                  label="Categoría"
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock inicial"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock mínimo"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Proveedor"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para gestionar stock */}
      <Dialog open={openStockDialog} onClose={() => setOpenStockDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Gestionar Stock - {stockProduct?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Stock actual: <strong>{stockProduct?.stock} unidades</strong>
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Operación</InputLabel>
                  <Select
                    value={stockData.operation}
                    label="Operación"
                    onChange={(e) => setStockData({...stockData, operation: e.target.value})}
                  >
                    <MenuItem value="add">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AddStockIcon sx={{ mr: 1, color: 'success.main' }} />
                        Aumentar Stock
                      </Box>
                    </MenuItem>
                    <MenuItem value="subtract">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RemoveStockIcon sx={{ mr: 1, color: 'error.main' }} />
                        Reducir Stock
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cantidad"
                  type="number"
                  value={stockData.quantity}
                  onChange={(e) => setStockData({...stockData, quantity: e.target.value})}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStockDialog(false)}>Cancelar</Button>
          <Button onClick={handleStockUpdate} variant="contained">
            Actualizar Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({...notification, open: false})}
      >
        <Alert 
          onClose={() => setNotification({...notification, open: false})} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;
