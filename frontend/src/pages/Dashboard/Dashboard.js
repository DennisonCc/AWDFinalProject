import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import {
  People,
  PersonAdd,
  Inventory,
  Receipt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Proveedores',
      description: 'Gestionar proveedores del sistema',
      icon: <PersonAdd sx={{ fontSize: 40 }} />,
      color: '#2196F3',
      path: '/suppliers'
    },
    {
      title: 'Clientes',
      description: 'Gestionar clientes del sistema',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
      path: '/clients'
    },
    {
      title: 'Productos',
      description: 'Gestionar catálogo de productos',
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: '#FF9800',
      path: '/products'
    },
    {
      title: 'Facturas',
      description: 'Sistema de facturación',
      icon: <Receipt sx={{ fontSize: 40 }} />,
      color: '#9C27B0',
      path: '/invoices'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Bienvenido al Sistema de Gestión Comercial Bazar
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ color: card.color, mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {card.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  size="small" 
                  variant="contained"
                  sx={{ backgroundColor: card.color }}
                >
                  Acceder
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumen del Sistema
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Este sistema permite gestionar de manera integral todas las operaciones comerciales:
            </Typography>
            <Box component="ul" sx={{ mt: 2 }}>
              <li>Gestión completa de proveedores y clientes</li>
              <li>Control de inventario y catálogo de productos</li>
              <li>Sistema de facturación con generación de PDF</li>
              <li>Reportes y estadísticas comerciales</li>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Accesos Rápidos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/suppliers')}
                fullWidth
              >
                Nuevo Proveedor
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/clients')}
                fullWidth
              >
                Nuevo Cliente
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/products')}
                fullWidth
              >
                Nuevo Producto
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/invoices')}
                fullWidth
              >
                Nueva Factura
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
