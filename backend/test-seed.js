require('dotenv').config();
const mongoose = require('mongoose');
const Supplier = require('./models/Supplier');

const testSeed = async () => {
  try {
    console.log('🚀 Iniciando siembra de prueba...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar proveedores
    console.log('🗑️ Limpiando proveedores...');
    await Supplier.deleteMany({});
    console.log('✅ Proveedores limpiados');

    // Insertar un proveedor de prueba
    console.log('📦 Insertando proveedor de prueba...');
    const testSupplier = await Supplier.create({
      name: "Proveedor Test",
      email: "test@email.com",
      phone: "123456789",
      address: "Dirección Test",
      country: "Colombia"
    });
    console.log('✅ Proveedor insertado:', testSupplier.name);

    // Verificar
    const count = await Supplier.countDocuments();
    console.log('📊 Total proveedores:', count);

    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    console.log('🎉 ¡Prueba exitosa!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📍 Stack:', error.stack);
    process.exit(1);
  }
};

testSeed();
