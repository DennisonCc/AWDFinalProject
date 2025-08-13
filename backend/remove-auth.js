// Script para quitar todas las referencias de req.user de los controladores
const fs = require('fs');
const path = require('path');

const controllersDir = './controllers';

// Función para reemplazar req.user en un archivo
function removeUserReferences(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Reemplazos comunes
  content = content.replace(/req\.user\.userId/g, "'sistema'");
  content = content.replace(/por usuario \${req\.user\.userId}/g, "por sistema");
  content = content.replace(/userId: req\.user\.userId/g, "userId: 'sistema'");
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Procesado: ${filePath}`);
}

// Procesar todos los archivos de controladores
const files = fs.readdirSync(controllersDir).filter(file => file.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  removeUserReferences(filePath);
});

console.log('🎉 Todas las referencias de req.user han sido removidas');
