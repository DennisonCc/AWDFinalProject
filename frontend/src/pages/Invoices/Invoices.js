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
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import invoiceService from '../../services/invoiceService';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    product: '',
    quantity: 1,
    total: 0
  });

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceService.getAll(1, 50, searchTerm);
      console.log('Response from invoice service:', response);
      
      // Manejar diferentes estructuras de respuesta
      let invoicesData = [];
      if (response.data && Array.isArray(response.data.docs)) {
        invoicesData = response.data.docs;
      } else if (response.data && Array.isArray(response.data)) {
        invoicesData = response.data;
      } else if (Array.isArray(response)) {
        invoicesData = response;
      }
      
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading invoices:', error);
      showNotification('Error al cargar facturas', 'error');
      setInvoices([]); // Asegurar que invoices sea siempre un array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    try {
      const invoiceData = {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        product: formData.product,
        quantity: parseInt(formData.quantity),
        total: parseFloat(formData.total)
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
      clientName: '',
      clientEmail: '',
      product: '',
      quantity: 1,
      total: 0
    });
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
                    Cliente: {invoice.clientName || 'N/A'}
                  </Typography>
                  
                  <Typography color="textSecondary" gutterBottom>
                    Email: {invoice.clientEmail || 'N/A'}
                  </Typography>
                  
                  <Typography color="textSecondary" gutterBottom>
                    Producto: {invoice.product || 'N/A'}
                  </Typography>
                  
                  <Typography variant="h6" color="primary" gutterBottom>
                    Total: ${invoice.total?.toFixed(2)}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary">
                    Cantidad: {invoice.quantity}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary">
                    Fecha: {new Date(invoice.createdAt).toLocaleDateString()}
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
              <TextField
                fullWidth
                label="Nombre del Cliente"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email del Cliente"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Producto"
                value={formData.product}
                onChange={(e) => setFormData({...formData, product: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total"
                type="number"
                value={formData.total}
                onChange={(e) => setFormData({...formData, total: e.target.value})}
                required
              />
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
