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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PdfIcon,
  Payment as PaymentIcon,
  AddCircle as AddItemIcon,
  RemoveCircle as RemoveItemIcon
} from '@mui/icons-material';
import invoiceService from '../../services/invoiceService';
import clientService from '../../services/clientService';
import productService from '../../services/productService';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    client: null,
    items: [{ product: null, quantity: 1, price: 0 }],
    paymentStatus: 'pending',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const paymentStatuses = [
    { value: 'pending', label: 'Pendiente', color: 'warning' },
    { value: 'paid', label: 'Pagado', color: 'success' },
    { value: 'overdue', label: 'Vencido', color: 'error' },
    { value: 'cancelled', label: 'Cancelado', color: 'default' }
  ];

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceService.getAll(1, 50, searchTerm);
      setInvoices(response.data || []);
    } catch (error) {
      showNotification('Error al cargar facturas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientService.getAll(1, 100);
      setClients(response.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getAll(1, 100);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadClients();
    loadProducts();
  }, []);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: null, quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems.length > 0 ? newItems : [{ product: null, quantity: 1, price: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Si se selecciona un producto, actualizar el precio automáticamente
    if (field === 'product' && value) {
      newItems[index].price = value.price || 0;
    }
    
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const handleSubmit = async () => {
    try {
      const invoiceData = {
        client: formData.client?._id,
        items: formData.items.map(item => ({
          product: item.product?._id,
          quantity: item.quantity,
          price: item.price
        })),
        paymentStatus: formData.paymentStatus,
        dueDate: formData.dueDate,
        total: calculateTotal()
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
      loadInvoices();
    } catch (error) {
      showNotification(error.message || 'Error al guardar factura', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      client: null,
      items: [{ product: null, quantity: 1, price: 0 }],
      paymentStatus: 'pending',
      dueDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleUpdatePaymentStatus = async (invoiceId, newStatus) => {
    try {
      await invoiceService.updatePaymentStatus(invoiceId, newStatus);
      showNotification('Estado de pago actualizado');
      loadInvoices();
    } catch (error) {
      showNotification('Error al actualizar estado de pago', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
      try {
        await invoiceService.delete(id);
        showNotification('Factura eliminada exitosamente');
        loadInvoices();
      } catch (error) {
        showNotification(error.message || 'Error al eliminar factura', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    const statusObj = paymentStatuses.find(s => s.value === status);
    return statusObj?.color || 'default';
  };

  const getStatusLabel = (status) => {
    const statusObj = paymentStatuses.find(s => s.value === status);
    return statusObj?.label || status;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Facturas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Nueva Factura
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar facturas..."
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
          {invoices.map((invoice) => (
            <Grid item xs={12} sm={6} md={4} key={invoice._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2">
                      Factura #{invoice.invoiceNumber}
                    </Typography>
                  </Box>
                  
                  <Typography color="textSecondary" gutterBottom>
                    Cliente: {invoice.client?.name || 'N/A'}
                  </Typography>
                  
                  <Typography variant="h6" color="primary" gutterBottom>
                    Total: ${invoice.total?.toFixed(2)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={getStatusLabel(invoice.paymentStatus)}
                      size="small" 
                      color={getStatusColor(invoice.paymentStatus)}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary">
                    Fecha: {new Date(invoice.createdAt).toLocaleDateString()}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary">
                    Vencimiento: {new Date(invoice.dueDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <IconButton 
                    size="small" 
                    color="primary"
                    title="Editar"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="success"
                    title="Cambiar Estado"
                  >
                    <PaymentIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="info"
                    title="Generar PDF"
                  >
                    <PdfIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(invoice._id)}
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

      {invoices.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No hay facturas registradas
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Haz clic en "Nueva Factura" para agregar la primera
          </Typography>
        </Paper>
      )}

      {/* Dialog para crear/editar factura */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingInvoice ? 'Editar Factura' : 'Nueva Factura'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={clients}
                getOptionLabel={(option) => option.name || ''}
                value={formData.client}
                onChange={(_, newValue) => setFormData({...formData, client: newValue})}
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" required />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Estado de Pago</InputLabel>
                <Select
                  value={formData.paymentStatus}
                  label="Estado de Pago"
                  onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                >
                  {paymentStatuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Fecha de Vencimiento"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* Items de la factura */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Items de la Factura</Typography>
                <Button
                  startIcon={<AddItemIcon />}
                  onClick={addItem}
                  variant="outlined"
                  size="small"
                >
                  Agregar Item
                </Button>
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Precio</TableCell>
                      <TableCell>Subtotal</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Autocomplete
                            options={products}
                            getOptionLabel={(option) => option.name || ''}
                            value={item.product}
                            onChange={(_, newValue) => updateItem(index, 'product', newValue)}
                            renderInput={(params) => (
                              <TextField {...params} size="small" />
                            )}
                            sx={{ minWidth: 200 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          ${(item.quantity * item.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                          >
                            <RemoveItemIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Typography variant="h6">
                  Total: ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingInvoice ? 'Actualizar' : 'Crear'}
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
