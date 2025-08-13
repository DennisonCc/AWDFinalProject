require('dotenv').config();
const mongoose = require('mongoose');
const Supplier = require('./models/Supplier');
const Client = require('./models/Client');
const Product = require('./models/Product');
const Invoice = require('./models/Invoice');

const connectDB = async () => {
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    console.log('URI:', process.env.MONGODB_URI?.substring(0, 20) + '...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Datos simples para proveedores
const suppliersData = [
  {
    name: "Proveedor Uno",
    email: "proveedor1@email.com",
    phone: "123456789",
    address: "Calle 123",
    country: "Colombia"
  },
  {
    name: "Proveedor Dos",
    email: "proveedor2@email.com",
    phone: "987654321",
    address: "Avenida 456",
    country: "Mexico"
  },
  {
    name: "Proveedor Tres",
    email: "proveedor3@email.com",
    phone: "555666777",
    address: "Carrera 789",
    country: "España"
  }
];

// Datos simples para clientes
const clientsData = [
  {
    name: "Cliente Uno",
    email: "cliente1@email.com",
    phone: "111222333",
    address: "Calle Cliente 1",
    document: "12345678"
  },
  {
    name: "Cliente Dos",
    email: "cliente2@email.com",
    phone: "444555666",
    address: "Avenida Cliente 2",
    document: "87654321"
  },
  {
    name: "Cliente Tres",
    email: "cliente3@email.com",
    phone: "777888999",
    address: "Carrera Cliente 3",
    document: "11223344"
  }
];

// Datos simples para productos
const productsData = [
  {
    name: "Producto A",
    description: "Descripción del producto A",
    price: 100.50,
    category: "Categoria 1",
    stock: 50
  },
  {
    name: "Producto B",
    description: "Descripción del producto B",
    price: 250.75,
    category: "Categoria 2",
    stock: 30
  },
  {
    name: "Producto C",
    description: "Descripción del producto C",
    price: 75.25,
    category: "Categoria 1",
    stock: 100
  }
];

// Datos simples para facturas
const invoicesData = [
  {
    clientName: "Cliente Uno",
    clientEmail: "cliente1@email.com",
    product: "Producto A",
    quantity: 2,
    total: 201.00
  },
  {
    clientName: "Cliente Dos",
    clientEmail: "cliente2@email.com",
    product: "Producto B",
    quantity: 1,
    total: 250.75
  },
  {
    clientName: "Cliente Tres",
    clientEmail: "cliente3@email.com",
    product: "Producto C",
    quantity: 3,
    total: 225.75
  }
];

const seedDatabase = async () => {
  try {
    console.log('🗑️ Limpiando base de datos...');
    
    // Limpiar todas las colecciones
    await Supplier.deleteMany({});
    await Client.deleteMany({});
    await Product.deleteMany({});
    await Invoice.deleteMany({});
    
    console.log('✅ Base de datos limpiada');

    // Insertar proveedores
    console.log('📦 Insertando proveedores...');
    const suppliers = await Supplier.insertMany(suppliersData);
    console.log(`✅ ${suppliers.length} proveedores insertados`);

    // Insertar clientes
    console.log('👥 Insertando clientes...');
    const clients = await Client.insertMany(clientsData);
    console.log(`✅ ${clients.length} clientes insertados`);

    // Insertar productos
    console.log('🛍️ Insertando productos...');
    const products = await Product.insertMany(productsData);
    console.log(`✅ ${products.length} productos insertados`);

    // Insertar facturas
    console.log('📄 Insertando facturas...');
    const invoices = await Invoice.insertMany(invoicesData);
    console.log(`✅ ${invoices.length} facturas insertadas`);

    console.log('🎉 ¡Base de datos sembrada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error sembrando la base de datos:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
};

const runSeed = async () => {
  console.log('🚀 Iniciando proceso de siembra...');
  try {
    await connectDB();
    await seedDatabase();
    console.log('🎯 Proceso completado exitosamente');
  } catch (error) {
    console.error('💥 Error en el proceso:', error.message);
    console.error('Stack completo:', error.stack);
    process.exit(1);
  }
};

console.log('📋 Ejecutando script de siembra...');
runSeed();
