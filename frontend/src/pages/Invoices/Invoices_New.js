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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PdfIcon,
  AddCircle as AddProductIcon,
  RemoveCircle as RemoveProductIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Calculate as CalculateIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import invoiceService from '../../services/invoiceService';
import productService from '../../services/productService';
import clientService from '../../services/clientService';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    items: []
  });

  const [currentItem, setCurrentItem] = useState({
    product: null,
    quantity: 1
  });

  const IVA_RATE = 0.15; // 15% IVA

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, productsRes, clientsRes] = await Promise.all([
        invoiceService.getAll(1, 50, searchTerm),
        productService.getAll(1, 100),
        clientService.getAll(1, 100)
      ]);
      
      // Manejo más robusto de las respuestas
      const invoicesData = invoicesRes?.data?.docs || invoicesRes?.data || invoicesRes?.docs || [];
      const productsData = productsRes?.data?.docs || productsRes?.data || productsRes?.docs || [];
      const clientsData = clientsRes?.data?.docs || clientsRes?.data || clientsRes?.docs || [];
      
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      
      console.log('Facturas cargadas:', invoicesData.length);
      console.log('Productos cargados:', productsData.length);
      console.log('Clientes cargados:', clientsData.length);
    } catch (error) {
      console.error('Error detallado:', error);
      showNotification('Error al cargar datos', 'error');
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

  const addProductToInvoice = () => {
    if (!currentItem.product || currentItem.quantity <= 0) {
      showNotification('Selecciona un producto y cantidad válida', 'warning');
      return;
    }

    const newItem = {
      product: currentItem.product.name,
      price: currentItem.product.price,
      quantity: currentItem.quantity,
      subtotal: currentItem.product.price * currentItem.quantity
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });

    setCurrentItem({ product: null, quantity: 1 });
  };

  const removeProductFromInvoice = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;
    
    return { subtotal, iva, total };
  };

  const handleSubmit = async () => {
    try {
      if (formData.items.length === 0) {
        showNotification('Agrega al menos un producto a la factura', 'warning');
        return;
      }

      const { total } = calculateTotals();
      
      // Simplificamos para el modelo básico
      const invoiceData = {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        product: formData.items.map(item => item.product).join(', '),
        quantity: formData.items.reduce((sum, item) => sum + item.quantity, 0),
        total: total
      };

      if (editingInvoice) {
        await invoiceService.update(editingInvoice._id, invoiceData);
        showNotification('Factura actualizada exitosamente');
      } else {
        await invoiceService.create(invoiceData);
        showNotification('Factura creada exitosamente');
      }
      
      setOpenDialog(false);
      setEditingInvoice(null);
      resetForm();
      loadData();
    } catch (error) {
      showNotification(error.message || 'Error al guardar factura', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      items: []
    });
    setCurrentItem({ product: null, quantity: 1 });
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      clientName: invoice.clientName || '',
      clientEmail: invoice.clientEmail || '',
      items: []
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
      try {
        await invoiceService.delete(id);
        showNotification('Factura eliminada exitosamente');
        loadData();
      } catch (error) {
        showNotification(error.message || 'Error al eliminar factura', 'error');
      }
    }
  };

  const generatePDF = (invoice) => {
    const doc = new jsPDF();
    
    // Encabezado con tema rosado
    doc.setFillColor(236, 72, 153); // Rosa
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('FACTURA', 20, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Factura #: ${invoice._id.slice(-8)}`, 20, 55);
    doc.text(`Fecha: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 65);
    
    // Datos del cliente
    doc.text('DATOS DEL CLIENTE:', 20, 85);
    doc.text(`Nombre: ${invoice.clientName}`, 20, 95);
    doc.text(`Email: ${invoice.clientEmail}`, 20, 105);
    
    // Productos
    doc.text('PRODUCTOS:', 20, 125);
    doc.text(`Productos: ${invoice.product}`, 20, 135);
    doc.text(`Cantidad: ${invoice.quantity}`, 20, 145);
    
    // Cálculos
    const subtotal = invoice.total / (1 + IVA_RATE);
    const iva = invoice.total - subtotal;
    
    doc.text('RESUMEN:', 20, 165);
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, 175);
    doc.text(`IVA (15%): $${iva.toFixed(2)}`, 20, 185);
    doc.text(`TOTAL: $${invoice.total.toFixed(2)}`, 20, 195);
    
    // Guardar PDF
    doc.save(`factura_${invoice._id.slice(-8)}.pdf`);
  };

  const selectClient = (client) => {
    if (client) {
      setFormData({
        ...formData,
        clientName: client.name,
        clientEmail: client.email
      });
    }
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
            <ReceiptIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Gestión de Facturas
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Sistema completo de facturación con cálculo automático de IVA
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
            Nueva Factura
          </Button>
        </Box>
      </Paper>

      {/* Barra de búsqueda con tema rosado */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #fce7f3' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="🔍 Buscar facturas por cliente, productos, etc..."
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
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }}
            />
            <Typography variant="h6" color="#be185d">
              Cargando facturas...
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {invoices.map((invoice) => (
            <Grid item xs={12} sm={6} md={4} key={invoice._id}>
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
                    elevation: 6,
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
                      <ReceiptIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" component="h2" fontWeight="bold">
                        Factura #{invoice._id.slice(-8)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(invoice.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: '#fdf2f8', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="#be185d" fontWeight="bold" gutterBottom>
                      Cliente:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" gutterBottom>
                      {invoice.clientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon fontSize="small" />
                      {invoice.clientEmail}
                    </Typography>
                  </Paper>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="#be185d" fontWeight="bold" gutterBottom>
                      Productos:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      📦 {invoice.product}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 1.5, 
                        bgcolor: '#059669', 
                        color: 'white',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        ${invoice.total?.toFixed(2)}
                      </Typography>
                      <Typography variant="caption">
                        Total
                      </Typography>
                    </Paper>
                    
                    <Chip 
                      label={`${invoice.quantity} productos`}
                      sx={{ 
                        bgcolor: '#fce7f3', 
                        color: '#be185d',
                        border: '1px solid #f9a8d4'
                      }}
                      size="medium"
                      icon={<ShoppingCartIcon sx={{ color: '#be185d' }} />}
                    />
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                  <Box>
                    <IconButton 
                      size="medium" 
                      sx={{
                        mr: 1,
                        color: '#ec4899',
                        '&:hover': {
                          bgcolor: '#fce7f3',
                          color: '#be185d'
                        }
                      }}
                      onClick={() => handleEdit(invoice)}
                      title="Editar Factura"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="medium" 
                      sx={{
                        mr: 1,
                        color: '#7c3aed',
                        '&:hover': {
                          bgcolor: '#f3e8ff',
                          color: '#6b21a8'
                        }
                      }}
                      onClick={() => generatePDF(invoice)}
                      title="Generar PDF"
                    >
                      <PdfIcon />
                    </IconButton>
                  </Box>
                  <IconButton 
                    size="medium" 
                    sx={{
                      color: '#dc2626',
                      '&:hover': {
                        bgcolor: '#fee2e2',
                        color: '#991b1b'
                      }
                    }}
                    onClick={() => handleDelete(invoice._id)}
                    title="Eliminar Factura"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {invoices.length === 0 && !loading && (
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
            <ReceiptIcon sx={{ fontSize: 60 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" color="#be185d" gutterBottom>
            No hay facturas registradas
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Comienza a generar facturas profesionales con cálculo automático de IVA y exportación a PDF.
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
            Crear Primera Factura
          </Button>
        </Paper>
      )}

      {/* Dialog para crear/editar factura con tema rosado */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="lg" 
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
          <ReceiptIcon />
          {editingInvoice ? 'Editar Factura' : 'Nueva Factura'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {/* Sección de Cliente */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#fdf2f8', borderRadius: 3, border: '1px solid #fce7f3' }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: '#be185d',
              mb: 2,
              fontWeight: 'bold'
            }}>
              <PersonIcon />
              Información del Cliente
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={clients}
                  getOptionLabel={(option) => `${option.name} - ${option.email}`}
                  onChange={(event, value) => selectClient(value)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="🔍 Buscar Cliente Existente" 
                      variant="outlined"
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '1.2rem',
                          minHeight: '70px',
                          '&:hover fieldset': {
                            borderColor: '#ec4899',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#be185d',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '1.2rem',
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ p: 3, borderBottom: '1px solid #fce7f3' }}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#be185d', mb: 1 }}>
                          {option.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                          📧 {option.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          📞 {option.phone} | 📍 {option.address}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  ListboxProps={{
                    style: {
                      maxHeight: '400px',
                      fontSize: '1.1rem'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Nombre Completo del Cliente"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ color: '#ec4899', mr: 1 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      minHeight: '60px',
                      '&:hover fieldset': {
                        borderColor: '#ec4899',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#be185d',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ color: '#ec4899', mr: 1 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      minHeight: '60px',
                      '&:hover fieldset': {
                        borderColor: '#ec4899',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#be185d',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Sección de Productos */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#fdf2f8', borderRadius: 3, border: '1px solid #fce7f3' }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: '#be185d',
              mb: 2,
              fontWeight: 'bold'
            }}>
              <InventoryIcon />
              Seleccionar Productos
            </Typography>

            <Grid container spacing={3} alignItems="flex-end">
              <Grid item xs={12} sm={7}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => `${option.name} - $${option.price}`}
                  value={currentItem.product}
                  onChange={(event, value) => setCurrentItem({...currentItem, product: value})}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="🛍️ Seleccionar Producto" 
                      variant="outlined"
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '1.2rem',
                          minHeight: '70px',
                          '&:hover fieldset': {
                            borderColor: '#ec4899',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#be185d',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '1.2rem',
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ p: 3, borderBottom: '1px solid #fce7f3' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ color: '#be185d', mb: 1 }}>
                            {option.name}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                            {option.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📦 Stock: {option.stock} unidades | 🏷️ {option.category}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', minWidth: '100px' }}>
                          <Typography variant="h5" color="#059669" fontWeight="bold">
                            ${option.price}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  ListboxProps={{
                    style: {
                      maxHeight: '400px',
                      fontSize: '1.1rem'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Cantidad"
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                  inputProps={{ min: 1 }}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Typography sx={{ color: '#ec4899', mr: 1 }}>#</Typography>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.2rem',
                      minHeight: '70px',
                      '&:hover fieldset': {
                        borderColor: '#ec4899',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#be185d',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.2rem',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<AddProductIcon />}
                  onClick={addProductToInvoice}
                  sx={{ 
                    height: '70px',
                    fontSize: '1.1rem',
                    bgcolor: '#ec4899',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: '#be185d',
                    }
                  }}
                >
                  Agregar Producto
                </Button>
              </Grid>
            </Grid>

            {/* Mostrar producto seleccionado */}
            {currentItem.product && (
              <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: '#f0fdf4', border: '1px solid #16a34a', borderRadius: 2 }}>
                <Typography variant="body2" color="#16a34a">
                  <strong>Producto seleccionado:</strong> {currentItem.product.name} - 
                  <strong> Precio:</strong> ${currentItem.product.price} - 
                  <strong> Cantidad:</strong> {currentItem.quantity} - 
                  <strong> Subtotal:</strong> ${(currentItem.product.price * currentItem.quantity).toFixed(2)}
                </Typography>
              </Paper>
            )}
          </Paper>

          {/* Lista de productos agregados */}
          {formData.items.length > 0 && (
            <Paper elevation={2} sx={{ p: 3, bgcolor: '#fefce8', borderRadius: 3, border: '1px solid #eab308' }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#a16207',
                mb: 2,
                fontWeight: 'bold'
              }}>
                <ShoppingCartIcon />
                Productos en la Factura ({formData.items.length})
              </Typography>
              
              <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#ec4899' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Producto</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Precio Unit.</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Cantidad</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Subtotal</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fdf2f8' } }}>
                        <TableCell sx={{ fontWeight: 'medium' }}>{item.product}</TableCell>
                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={item.quantity} 
                            sx={{ bgcolor: '#fce7f3', color: '#be185d' }}
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#059669' }}>
                          ${item.subtotal.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            sx={{
                              color: '#dc2626',
                              '&:hover': {
                                bgcolor: '#fee2e2',
                                color: '#991b1b'
                              }
                            }}
                            onClick={() => removeProductFromInvoice(index)}
                          >
                            <RemoveProductIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Resumen de totales con tema rosado */}
              <Paper elevation={3} sx={{ 
                mt: 3, 
                p: 3, 
                background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', 
                color: 'white',
                borderRadius: 2
              }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalculateIcon />
                  Resumen de la Factura
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Subtotal</Typography>
                      <Typography variant="h5" fontWeight="bold">
                        ${calculateTotals().subtotal.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>IVA (15%)</Typography>
                      <Typography variant="h5" fontWeight="bold">
                        ${calculateTotals().iva.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#059669', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>TOTAL</Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ${calculateTotals().total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Paper>
          )}
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
            startIcon={<SaveIcon />}
            sx={{ 
              minWidth: 160,
              bgcolor: '#ec4899',
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#be185d',
              }
            }}
            disabled={formData.items.length === 0}
          >
            {editingInvoice ? 'Actualizar' : 'Crear'} Factura
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

export default Invoices;
