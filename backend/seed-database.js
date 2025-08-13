const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Importar modelos
const Supplier = require('./models/Supplier');
const Client = require('./models/Client');
const Product = require('./models/Product');
const Invoice = require('./models/Invoice');

// Datos de ejemplo para Suppliers
const suppliersData = [
  {
    company: 'Tecnología Global S.A.S',
    identificationNumber: '900123456',
    contactName: 'María García',
    email: 'contacto@tecnologiaglobal.com',
    phone: '+57 300 123 4567',
    bankAccount: '123456789012',
    bankName: 'Banco de Bogotá',
    address: {
      street: 'Calle 100 #15-23',
      city: 'Bogotá',
      state: 'Cundinamarca',
      country: 'Colombia'
    }
  },
  {
    company: 'Distribuidora del Norte Ltda',
    identificationNumber: '800987654',
    contactName: 'Juan Rodríguez',
    email: 'ventas@distribuidoranorte.com',
    phone: '+57 301 987 6543',
    bankAccount: '987654321098',
    bankName: 'Bancolombia',
    address: {
      street: 'Carrera 50 #45-67',
      city: 'Medellín',
      state: 'Antioquia',
      country: 'Colombia'
    }
  },
  {
    company: 'Suministros Industriales S.A',
    identificationNumber: '900456789',
    contactName: 'Ana López',
    email: 'info@suministrosindustriales.com',
    phone: '+57 302 456 7890',
    bankAccount: '456789123456',
    bankName: 'Banco Popular',
    address: {
      street: 'Avenida 68 #30-45',
      city: 'Cali',
      state: 'Valle del Cauca',
      country: 'Colombia'
    }
  }
];

// Datos de ejemplo para Clients
const clientsData = [
  {
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    phone: '+57 310 111 2222',
    address: 'Calle 85 #12-34',
    city: 'Bogotá',
    country: 'Colombia',
    documentType: 'Cedula',
    documentNumber: '12345678'
  },
  {
    name: 'Laura Fernández',
    email: 'laura.fernandez@email.com',
    phone: '+57 311 333 4444',
    address: 'Carrera 45 #67-89',
    city: 'Medellín',
    country: 'Colombia',
    documentType: 'Cedula',
    documentNumber: '87654321'
  },
  {
    name: 'Roberto Silva',
    email: 'roberto.silva@email.com',
    phone: '+57 312 555 6666',
    address: 'Avenida 5 #23-45',
    city: 'Cali',
    country: 'Colombia',
    documentType: 'DNI',
    documentNumber: '11223344'
  }
];

// Función para crear datos de ejemplo
const seedDatabase = async () => {
  try {
    console.log('🌱 Creando datos de ejemplo...');
    
    // Crear suppliers
    console.log('📦 Creando proveedores...');
    const suppliers = await Supplier.insertMany(suppliersData);
    console.log(`✅ ${suppliers.length} proveedores creados`);
    
    // Crear clients
    console.log('👥 Creando clientes...');
    const clients = await Client.insertMany(clientsData);
    console.log(`✅ ${clients.length} clientes creados`);
    
    // Crear products
    console.log('🛍️ Creando productos...');
    const productsData = [
      {
        name: 'Laptop Dell Inspiron 15',
        description: 'Laptop para uso profesional con procesador Intel Core i5',
        price: 2500000,
        category: 'Electrónicos',
        stock: 15,
        minStock: 5,
        supplier: suppliers[0]._id,
        sku: 'LAP-001'
      },
      {
        name: 'Mouse Inalámbrico Logitech',
        description: 'Mouse inalámbrico ergonómico con batería de larga duración',
        price: 85000,
        category: 'Accesorios',
        stock: 50,
        minStock: 10,
        supplier: suppliers[0]._id,
        sku: 'MOU-001'
      },
      {
        name: 'Silla de Oficina Ergonómica',
        description: 'Silla ajustable con soporte lumbar para oficina',
        price: 450000,
        category: 'Muebles',
        stock: 8,
        minStock: 3,
        supplier: suppliers[1]._id,
        sku: 'SIL-001'
      },
      {
        name: 'Monitor LED 24 pulgadas',
        description: 'Monitor Full HD con conexión HDMI y VGA',
        price: 650000,
        category: 'Electrónicos',
        stock: 20,
        minStock: 5,
        supplier: suppliers[2]._id,
        sku: 'MON-001'
      },
      {
        name: 'Teclado Mecánico RGB',
        description: 'Teclado mecánico con iluminación RGB personalizable',
        price: 320000,
        category: 'Accesorios',
        stock: 12,
        minStock: 4,
        supplier: suppliers[0]._id,
        sku: 'TEC-001'
      }
    ];
    
    const products = await Product.insertMany(productsData);
    console.log(`✅ ${products.length} productos creados`);
    
    // Crear invoices
    console.log('🧾 Creando facturas...');
    const invoicesData = [
      {
        client: clients[0]._id,
        items: [
          { product: products[0]._id, quantity: 1, price: 2500000 },
          { product: products[1]._id, quantity: 2, price: 85000 }
        ],
        paymentStatus: 'paid',
        dueDate: new Date('2025-09-15')
      },
      {
        client: clients[1]._id,
        items: [
          { product: products[2]._id, quantity: 1, price: 450000 },
          { product: products[3]._id, quantity: 1, price: 650000 }
        ],
        paymentStatus: 'pending',
        dueDate: new Date('2025-09-20')
      },
      {
        client: clients[2]._id,
        items: [
          { product: products[4]._id, quantity: 1, price: 320000 }
        ],
        paymentStatus: 'overdue',
        dueDate: new Date('2025-08-10')
      }
    ];
    
    const invoices = await Invoice.insertMany(invoicesData);
    console.log(`✅ ${invoices.length} facturas creadas`);
    
    console.log('🎉 Base de datos poblada exitosamente');
    console.log(`📊 Resumen:`);
    console.log(`   - ${suppliers.length} proveedores`);
    console.log(`   - ${clients.length} clientes`);
    console.log(`   - ${products.length} productos`);
    console.log(`   - ${invoices.length} facturas`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error poblando base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar
const run = async () => {
  await connectDB();
  await seedDatabase();
};

run();
