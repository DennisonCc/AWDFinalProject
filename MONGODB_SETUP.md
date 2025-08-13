# GUÍA DE CONFIGURACIÓN MONGODB ATLAS

## PASO 1: CONFIGURACIÓN DE SEGURIDAD EN ATLAS

### 1.1 Database Access (Usuarios de base de datos)
1. Ve a "Database Access" en el menú lateral
2. Clic en "Add New Database User"
3. Configuración recomendada:
   - Authentication Method: Password
   - Username: bazar_admin
   - Password: (genera una contraseña segura)
   - Database User Privileges: "Read and write to any database"
   - Restrict Access: Specific Clusters -> Selecciona tu cluster

### 1.2 Network Access (Acceso de red)
1. Ve a "Network Access" en el menú lateral
2. Clic en "Add IP Address"
3. Para desarrollo: Clic en "Allow Access from Anywhere" (0.0.0.0/0)
4. Para producción: Añade solo las IPs específicas que necesites

## PASO 2: OBTENER STRING DE CONEXIÓN

1. Ve a "Clusters" en el menú lateral
2. Clic en "Connect" en tu cluster
3. Selecciona "Connect your application"
4. Driver: Node.js, Version: 4.1 or later
5. Copia el connection string

Ejemplo del connection string:
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

## PASO 3: CREAR BASE DE DATOS Y COLECCIONES

### Opción A: Crear desde Atlas UI
1. Ve a "Collections" en tu cluster
2. Clic en "Create Database"
3. Database name: bazar_system
4. Collection name: suppliers (empezaremos con esta)

### Opción B: Crear desde código (Recomendado)
Las colecciones se crearán automáticamente cuando insertes el primer documento.

## NOMBRES EXACTOS PARA MONGODB:

Database: bazar_system

Colecciones:
- suppliers
- clients  
- products
- invoices
- users
