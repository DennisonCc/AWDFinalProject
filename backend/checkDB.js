const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const { User, Supplier, Client, Product, Invoice } = require('./models');

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

// Función para verificar qué datos hay en cada colección
const checkCollections = async () => {
  try {
    console.log('\n📋 VERIFICANDO COLECCIONES EN LA BASE DE DATOS...\n');
    
    // Verificar colección de usuarios
    const userCount = await User.countDocuments();
    console.log(`👥 COLECCIÓN: users (${userCount} documentos)`);
    if (userCount > 0) {
      const users = await User.find({}, 'userId username email role status').limit(5);
      users.forEach(user => {
        console.log(`   - ${user.userId} | ${user.username} | ${user.email} | ${user.role} | ${user.status}`);
      });
    }
    console.log('');

    // Verificar colección de proveedores
    const supplierCount = await Supplier.countDocuments();
    console.log(`🏢 COLECCIÓN: suppliers (${supplierCount} documentos)`);
    if (supplierCount > 0) {
      const suppliers = await Supplier.find({}, 'supplierId company contactName email status').limit(5);
      suppliers.forEach(supplier => {
        console.log(`   - ${supplier.supplierId} | ${supplier.company} | ${supplier.contactName} | ${supplier.email} | ${supplier.status}`);
      });
    }
    console.log('');

    // Verificar colección de clientes
    const clientCount = await Client.countDocuments();
    console.log(`👤 COLECCIÓN: clients (${clientCount} documentos)`);
    if (clientCount > 0) {
      const clients = await Client.find({}, 'clientId personalInfo.firstName personalInfo.lastName personalInfo.email clientType').limit(5);
      clients.forEach(client => {
        console.log(`   - ${client.clientId} | ${client.personalInfo.firstName} ${client.personalInfo.lastName} | ${client.personalInfo.email} | ${client.clientType}`);
      });
    }
    console.log('');

    // Verificar colección de productos
    const productCount = await Product.countDocuments();
    console.log(`📦 COLECCIÓN: products (${productCount} documentos)`);
    if (productCount > 0) {
      const products = await Product.find({}, 'productId name category pricing.sellingPrice inventory.currentStock status').limit(5);
      products.forEach(product => {
        console.log(`   - ${product.productId} | ${product.name} | ${product.category} | $${product.pricing.sellingPrice} | Stock: ${product.inventory.currentStock} | ${product.status}`);
      });
    }
    console.log('');

    // Verificar colección de facturas
    const invoiceCount = await Invoice.countDocuments();
    console.log(`🧾 COLECCIÓN: invoices (${invoiceCount} documentos)`);
    if (invoiceCount > 0) {
      const invoices = await Invoice.find({}, 'invoiceNumber clientId totals.finalAmount status paymentInfo.status').limit(5);
      invoices.forEach(invoice => {
        console.log(`   - ${invoice.invoiceNumber} | Cliente: ${invoice.clientId} | $${invoice.totals.finalAmount} | Estado: ${invoice.status} | Pago: ${invoice.paymentInfo.status}`);
      });
    } else {
      console.log('   (La colección de facturas se creará cuando generes la primera factura)');
    }
    console.log('');

    // Mostrar información de la base de datos
    const dbName = mongoose.connection.db.databaseName;
    console.log(`🗄️  BASE DE DATOS: ${dbName}`);
    console.log(`🔗 URI DE CONEXIÓN: ${process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    console.log('');

    // Mostrar índices creados
    console.log('📝 ÍNDICES CREADOS:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      if (['users', 'suppliers', 'clients', 'products', 'invoices'].includes(collection.name)) {
        const indexes = await mongoose.connection.db.collection(collection.name).indexes();
        console.log(`   ${collection.name}:`);
        indexes.forEach(index => {
          const fields = Object.keys(index.key).join(', ');
          console.log(`     - ${fields} ${index.unique ? '(único)' : ''}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error verificando colecciones:', error);
  }
};

// Función principal
const checkDatabase = async () => {
  console.log('🔍 VERIFICANDO BASE DE DATOS MONGODB ATLAS...');
  
  await connectDB();
  await checkCollections();
  
  console.log('✅ Verificación completada');
  process.exit(0);
};

// Ejecutar verificación
if (require.main === module) {
  checkDatabase().catch(error => {
    console.error('❌ Error en verificación:', error);
    process.exit(1);
  });
}

module.exports = { checkDatabase };
