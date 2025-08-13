const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar modelos
const { User, Supplier, Client, Product } = require('./models');

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Función para crear usuario administrador inicial
const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('✅ Usuario administrador ya existe');
      return;
    }

    const adminUser = new User({
      userId: 'USR-000001',
      username: 'admin',
      email: 'admin@bazar.com',
      password: 'admin123', // Cambiar en producción
      profile: {
        firstName: 'Administrador',
        lastName: 'Sistema'
      },
      role: 'admin',
      status: 'active',
      isEmailVerified: true
    });

    await adminUser.save();
    console.log('✅ Usuario administrador creado');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ⚠️  CAMBIA LA CONTRASEÑA EN PRODUCCIÓN');
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
  }
};

// Función para crear datos de ejemplo
const createSampleData = async () => {
  try {
    // Verificar si ya existen datos
    const supplierCount = await Supplier.countDocuments();
    if (supplierCount > 0) {
      console.log('✅ Ya existen datos de ejemplo');
      return;
    }

    // Crear proveedor de ejemplo
    const sampleSupplier = new Supplier({
      supplierId: 'SUP-000001',
      identificationNumber: '123456789',
      company: 'Distribuidora Ejemplo S.A.S',
      contactName: 'Juan Pérez',
      phone: '+57 300 123 4567',
      email: 'contacto@ejemplo.com',
      bankAccount: '123456789',
      bankName: 'Banco de Bogotá',
      address: {
        street: 'Calle 123 #45-67',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        zipCode: '110111'
      },
      catalog: [
        {
          productId: 'PROD-001',
          productName: 'Producto Ejemplo A',
          description: 'Descripción del producto ejemplo',
          category: 'Electrónicos',
          unitPrice: 25000,
          availableQuantity: 100,
          minimumOrder: 5,
          specifications: {
            weight: '500g',
            dimensions: '10x10x5 cm',
            color: 'Negro'
          }
        }
      ]
    });

    await sampleSupplier.save();

    // Crear cliente de ejemplo
    const sampleClient = new Client({
      clientId: 'CLI-000001',
      taxId: '987654321',
      clientType: 'registered',
      personalInfo: {
        firstName: 'María',
        lastName: 'González',
        email: 'maria@email.com',
        phone: '+57 301 234 5678'
      },
      address: {
        street: 'Carrera 45 #67-89',
        city: 'Medellín',
        state: 'Antioquia',
        country: 'Colombia',
        zipCode: '050001'
      }
    });

    await sampleClient.save();

    // Crear producto de ejemplo
    const sampleProduct = new Product({
      productId: 'PROD-000001',
      name: 'Producto Ejemplo A',
      description: 'Descripción detallada del producto ejemplo',
      category: 'Electrónicos',
      subcategory: 'Accesorios',
      pricing: {
        costPrice: 20000,
        sellingPrice: 25000,
        wholesalePrice: 22000
      },
      inventory: {
        currentStock: 100,
        minimumStock: 10,
        reorderPoint: 20
      },
      suppliers: [
        {
          supplierId: sampleSupplier.supplierId,
          supplierName: sampleSupplier.company,
          supplierPrice: 20000,
          isPreferred: true
        }
      ]
    });

    await sampleProduct.save();

    console.log('✅ Datos de ejemplo creados');
  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error);
  }
};

// Función para crear índices
const createIndexes = async () => {
  try {
    // Los índices se crean automáticamente con los esquemas de Mongoose
    console.log('✅ Índices creados automáticamente');
  } catch (error) {
    console.error('❌ Error creando índices:', error);
  }
};

// Función principal de inicialización
const initializeDatabase = async () => {
  console.log('🚀 Inicializando base de datos...');
  
  await connectDB();
  await createAdminUser();
  await createSampleData();
  await createIndexes();
  
  console.log('✅ Base de datos inicializada correctamente');
  console.log('🎯 Colecciones creadas:');
  console.log('   - users');
  console.log('   - suppliers');
  console.log('   - clients');
  console.log('   - products');
  console.log('   - invoices (se creará cuando generes la primera factura)');
  
  process.exit(0);
};

// Ejecutar inicialización
if (require.main === module) {
  initializeDatabase().catch(error => {
    console.error('❌ Error en inicialización:', error);
    process.exit(1);
  });
}

module.exports = { initializeDatabase };
