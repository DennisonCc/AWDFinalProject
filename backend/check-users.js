const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAndCreateAdmin() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://DChalacan:usabilidad@cluster00.ttbowrj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster00');
    
    console.log('Conectado a MongoDB');
    
    // Verificar usuarios existentes
    const users = await User.find({});
    console.log(`Total de usuarios en base de datos: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\nUsuarios existentes:');
      users.forEach(user => {
        console.log(`- ${user.username} (${user.role}) - Permisos: ${user.permissions.length}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Estado: ${user.status}`);
        console.log(`  Bloqueado: ${user.isLocked}`);
        console.log(`  Permisos: ${user.permissions.join(', ')}`);
        console.log('---');
      });
    } else {
      console.log('No hay usuarios en la base de datos. Creando usuario admin...');
      
      // Crear usuario admin
      const admin = new User({
        username: 'admin',
        email: 'admin@bazar.com',
        password: 'admin123',
        profile: {
          firstName: 'Administrador',
          lastName: 'Sistema'
        },
        role: 'admin'
      });
      
      await admin.save();
      console.log('Usuario admin creado exitosamente');
      console.log(`Permisos asignados: ${admin.permissions.join(', ')}`);
    }
    
    await mongoose.disconnect();
    console.log('\nConexión cerrada');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndCreateAdmin();
