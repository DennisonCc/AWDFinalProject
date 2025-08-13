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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import clientService from '../../services/clientService';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    documentType: 'DNI',
    documentNumber: ''
  });

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await clientService.getAll(1, 50, searchTerm);
      setClients(response.docs || response.clients || []);
    } catch (error) {
      showNotification('Error al cargar clientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    try {
      if (editingClient) {
        await clientService.update(editingClient._id, formData);
        showNotification('Cliente actualizado exitosamente');
      } else {
        await clientService.create(formData);
        showNotification('Cliente creado exitosamente');
      }
      setOpenDialog(false);
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        documentType: 'DNI',
        documentNumber: ''
      });
      loadClients();
    } catch (error) {
      showNotification(error.message || 'Error al guardar cliente', 'error');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      country: client.country || '',
      documentType: client.documentType || 'DNI',
      documentNumber: client.documentNumber || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
      try {
        await clientService.delete(id);
        showNotification('Cliente eliminado exitosamente');
        loadClients();
      } catch (error) {
        showNotification(error.message || 'Error al eliminar cliente', 'error');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Nuevo Cliente
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar clientes..."
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
          {clients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2">
                      {client.name}
                    </Typography>
                  </Box>
                  
                  <Typography color="textSecondary" gutterBottom>
                    {client.email}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary">
                    📞 {client.phone}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary">
                    📍 {client.city}, {client.country}
                  </Typography>
                  
                  {client.documentNumber && (
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={`${client.documentType}: ${client.documentNumber}`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleEdit(client)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(client._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {clients.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No hay clientes registrados
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Haz clic en "Nuevo Cliente" para agregar el primero
          </Typography>
        </Paper>
      )}

      {/* Dialog para crear/editar cliente */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre completo"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tipo de documento"
                value={formData.documentType}
                onChange={(e) => setFormData({...formData, documentType: e.target.value})}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Carnet">Carnet de Extranjería</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de documento"
                value={formData.documentNumber}
                onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="País"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClient ? 'Actualizar' : 'Crear'}
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

export default Clients;
