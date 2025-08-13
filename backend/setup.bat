@echo off
echo ========================================
echo     CONFIGURACIÓN DE BASE DE DATOS
echo ========================================
echo.

echo 1. Instalar dependencias de Node.js...
npm install

echo.
echo 2. Configurar variables de entorno...
echo Editando archivo .env...
if not exist .env (
    echo Copiando .env.example a .env...
    copy .env.example .env
) else (
    echo El archivo .env ya existe
)

echo.
echo 3. IMPORTANTE: Edita el archivo .env con tu información de MongoDB Atlas
echo    - MONGODB_URI: Tu cadena de conexión de MongoDB Atlas
echo    - JWT_SECRET: Una clave secreta segura para JWT
echo.
pause
echo.

echo 4. Inicializando base de datos...
node initDB.js

echo.
echo ========================================
echo      CONFIGURACIÓN COMPLETADA
echo ========================================
echo Usuario administrador creado:
echo   Username: admin
echo   Password: admin123
echo.
echo CAMBIA LA CONTRASEÑA EN PRODUCCIÓN
echo.
pause
