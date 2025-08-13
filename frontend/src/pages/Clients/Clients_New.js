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
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Assignment as DocumentIcon
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
    document: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await clientService.getAll(1, 50, searchTerm);
      const clientsData = response?.data?.docs || response?.data || response?.docs || [];
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      showNotification('Error al cargar clientes', 'error');
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
      if (editingClient) {
        await clientService.update(editingClient._id, formData);
        showNotification('Cliente actualizado exitosamente');
      } else {
        await clientService.create(formData);
        showNotification('Cliente creado exitosamente');
      }
      
      setOpenDialog(false);
      setEditingClient(null);
      resetForm();
      loadData();
    } catch (error) {
      showNotification(error.message || 'Error al guardar cliente', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      document: ''
    });
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      document: client.document || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
      try {
        await clientService.delete(id);
        showNotification('Cliente eliminado exitosamente');
        loadData();
      } catch (error) {
        showNotification(error.message || 'Error al eliminar cliente', 'error');
      }
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
            <PersonIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestión de Clientes
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Administra la información de tus clientes
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
            Nuevo Cliente
          </Button>
        </Box>
      </Paper>

      {/* Barra de búsqueda con tema rosado */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #fce7f3' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="🔍 Buscar clientes por nombre, email, teléfono..."
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
              Cargando clientes...
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {clients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client._id}>
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
                      <PersonIcon />
                    </Box>
                    <Typography variant="h6" component="h2" fontWeight="bold">
                      {client.name}
                    </Typography>
                  </Box>
                  
                  <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: '#fdf2f8', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EmailIcon sx={{ color: '#ec4899', fontSize: 18 }} />
                      {client.email}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PhoneIcon sx={{ color: '#ec4899', fontSize: 18 }} />
                      {client.phone}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon sx={{ color: '#ec4899', fontSize: 18 }} />
                      {client.address}
                    </Typography>
                  </Paper>
                  
                  {client.document && (
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        icon={<DocumentIcon sx={{ color: '#be185d' }} />}
                        label={`Doc: ${client.document}`} 
                        sx={{ 
                          bgcolor: '#fce7f3', 
                          color: '#be185d',
                          border: '1px solid #f9a8d4'
                        }}
                        size="small"
                      />
                    </Box>
                  )}
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
                    onClick={() => handleEdit(client)}
                    title="Editar Cliente"
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
                    onClick={() => handleDelete(client._id)}
                    title="Eliminar Cliente"
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
            <PersonIcon sx={{ fontSize: 60 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" color="#be185d" gutterBottom>
            No hay clientes registrados
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Comienza a registrar la información de tus clientes para gestionar mejor tu negocio.
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
            Agregar Primer Cliente
          </Button>
        </Paper>
      )}

      {/* Dialog para crear/editar cliente con tema rosado */}
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
          <PersonIcon />
          {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre Completo"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: '#ec4899', mr: 1 }} />,
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
                label="Correo Electrónico"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: '#ec4899', mr: 1 }} />,
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
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ color: '#ec4899', mr: 1 }} />,
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
                label="Documento"
                value={formData.document}
                onChange={(e) => setFormData({...formData, document: e.target.value})}
                variant="outlined"
                InputProps={{
                  startAdornment: <DocumentIcon sx={{ color: '#ec4899', mr: 1 }} />,
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
                label="Dirección"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
                variant="outlined"
                multiline
                rows={2}
                InputProps={{
                  startAdornment: <LocationIcon sx={{ color: '#ec4899', mr: 1, mt: 1 }} />,
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
            {editingClient ? 'Actualizar' : 'Crear'} Cliente
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
