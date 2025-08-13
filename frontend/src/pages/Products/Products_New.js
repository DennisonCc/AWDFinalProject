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
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  AttachMoney as PriceIcon,
  Category as CategoryIcon,
  Storage as StockIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import productService from '../../services/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll(1, 50, searchTerm);
      const productsData = response?.data?.docs || response?.data || response?.docs || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      showNotification('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0
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
      loadData();
    } catch (error) {
      showNotification(error.message || 'Error al guardar producto', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: ''
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      category: product.category || '',
      stock: product.stock?.toString() || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      try {
        await productService.delete(id);
        showNotification('Producto eliminado exitosamente');
        loadData();
      } catch (error) {
        showNotification(error.message || 'Error al eliminar producto', 'error');
      }
    }
  };

  const getStockColor = (stock) => {
    if (stock === 0) return '#dc2626';
    if (stock < 10) return '#ea580c';
    return '#059669';
  };

  const getStockLabel = (stock) => {
    if (stock === 0) return 'Sin Stock';
    if (stock < 10) return 'Stock Bajo';
    return 'Disponible';
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#fdf2f8', minHeight: '100vh' }}>
      {/* Encabezado con gradiente rosado */}
      <Paper elevation={3} sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', 
        color: 'white',
        borderRadius: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InventoryIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestión de Productos
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Administra tu inventario y catálogo de productos
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.15)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2,
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)',
              }
            }}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Paper>

      {/* Barra de búsqueda con tema rosado */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #fce7f3' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="🔍 Buscar productos por nombre, categoría, descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: '#ec4899' }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                borderColor: '#f9a8d4',
              },
              '&:hover fieldset': {
                borderColor: '#ec4899',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#be185d',
              },
            },
          }}
        />
      </Paper>

      {loading ? (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                border: '4px solid',
                borderColor: '#fce7f3',
                borderTopColor: '#ec4899',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
            <Typography variant="h6" color="#be185d">
              Cargando productos...
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card 
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid #fce7f3',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(236, 72, 153, 0.15)',
                    borderColor: '#f9a8d4'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: '#ec4899',
                        color: 'white',
                        mr: 2
                      }}
                    >
                      <InventoryIcon />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="h2" fontWeight="bold">
                        {product.name}
                      </Typography>
                      <Chip 
                        label={product.category || 'Sin categoría'}
                        sx={{ 
                          bgcolor: '#fce7f3', 
                          color: '#be185d',
                          border: '1px solid #f9a8d4',
                          mt: 0.5
                        }}
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: '#fdf2f8', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                      {product.description || 'Sin descripción'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Box>
                        <Typography variant="h5" fontWeight="bold" color="#059669">
                          ${parseFloat(product.price || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          sx={{ color: getStockColor(product.stock || 0) }}
                        >
                          {product.stock || 0} unidades
                        </Typography>
                        <Chip 
                          label={getStockLabel(product.stock || 0)}
                          sx={{ 
                            bgcolor: product.stock === 0 ? '#fee2e2' : product.stock < 10 ? '#fed7aa' : '#f0fdf4',
                            color: getStockColor(product.stock || 0),
                            fontSize: '0.75rem',
                            height: '20px'
                          }}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Paper>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                  <IconButton 
                    size="medium" 
                    sx={{
                      color: '#ec4899',
                      '&:hover': {
                        bgcolor: '#fce7f3',
                        color: '#be185d'
                      }
                    }}
                    onClick={() => handleEdit(product)}
                    title="Editar Producto"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="medium" 
                    sx={{
                      color: '#dc2626',
                      '&:hover': {
                        bgcolor: '#fee2e2',
                        color: '#991b1b'
                      }
                    }}
                    onClick={() => handleDelete(product._id)}
                    title="Eliminar Producto"
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
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', bgcolor: 'white', borderRadius: 3, border: '1px solid #fce7f3' }}>
          <Box
            sx={{
              p: 4,
              borderRadius: '50%',
              bgcolor: '#fce7f3',
              color: '#be185d',
              display: 'inline-flex',
              mb: 3
            }}
          >
            <InventoryIcon sx={{ fontSize: 60 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" color="#be185d" gutterBottom>
            No hay productos registrados
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Comienza a agregar productos a tu inventario para gestionar tu catálogo y ventas.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ 
              px: 4, 
              py: 1.5,
              bgcolor: '#ec4899',
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#be185d',
              }
            }}
          >
            Agregar Primer Producto
          </Button>
        </Paper>
      )}

      {/* Dialog para crear/editar producto con tema rosado */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '2px solid #fce7f3'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#fdf2f8', 
          color: '#be185d', 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid #fce7f3',
          fontWeight: 'bold'
        }}>
          <InventoryIcon />
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del Producto"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <InventoryIcon sx={{ color: '#ec4899', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ec4899',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#be185d',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Categoría"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <CategoryIcon sx={{ color: '#ec4899', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ec4899',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#be185d',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PriceIcon sx={{ color: '#ec4899' }} />
                      <Typography sx={{ color: '#ec4899', ml: 0.5 }}>$</Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ec4899',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#be185d',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <StockIcon sx={{ color: '#ec4899', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ec4899',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#be185d',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                variant="outlined"
                multiline
                rows={3}
                InputProps={{
                  startAdornment: <DescriptionIcon sx={{ color: '#ec4899', mr: 1, mt: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ec4899',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#be185d',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#fdf2f8' }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            size="large"
            sx={{ minWidth: 120, color: '#6b7280' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            size="large"
            sx={{ 
              minWidth: 160,
              bgcolor: '#ec4899',
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#be185d',
              }
            }}
          >
            {editingProduct ? 'Actualizar' : 'Crear'} Producto
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
