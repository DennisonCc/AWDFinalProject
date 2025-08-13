# ESTRUCTURA DE BASE DE DATOS MONGODB ATLAS

## DISEÑO DE COLECCIONES Y DOCUMENTOS

### 1. COLECCIÓN: `suppliers` (Proveedores)
**Nombre exacto en MongoDB:** `suppliers`

```javascript
{
  _id: ObjectId("..."),
  supplierId: "SUP-001", // String único generado
  identificationNumber: "1234567890", // Número de identificación (requerido)
  company: "Distribuidora XYZ S.A.S", // Nombre de la empresa
  contactName: "Juan Pérez", // Nombre del contacto
  phone: "+57 300 123 4567", // Teléfono
  email: "contacto@distribuidoraxyz.com", // Email (opcional)
  bankAccount: "123456789", // Número de cuenta bancaria
  bankName: "Banco de Bogotá", // Nombre del banco
  address: { // Dirección completa (embebida)
    street: "Calle 123 #45-67",
    city: "Bogotá",
    state: "Cundinamarca",
    country: "Colombia",
    zipCode: "110111"
  },
  catalog: [ // Array de productos del proveedor (embebidos)
    {
      productId: "PROD-001",
      productName: "Producto A",
      description: "Descripción del producto A",
      category: "Categoría 1",
      unitPrice: 15000, // Precio unitario
      currency: "COP",
      availableQuantity: 100,
      minimumOrder: 10,
      images: ["url1.jpg", "url2.jpg"], // URLs de imágenes
      specifications: {
        weight: "500g",
        dimensions: "10x10x5 cm",
        color: "Azul",
        material: "Plástico"
      }
    }
  ],
  status: "active", // active, inactive
  createdAt: ISODate("2025-08-12T..."),
  updatedAt: ISODate("2025-08-12T...")
}
```

### 2. COLECCIÓN: `clients` (Clientes)
**Nombre exacto en MongoDB:** `clients`

```javascript
{
  _id: ObjectId("..."),
  clientId: "CLI-001", // String único generado
  taxId: "1234567890", // Número de identificación fiscal (requerido)
  clientType: "registered", // "registered" o "final_consumer"
  personalInfo: { // Información personal (embebida)
    firstName: "María",
    lastName: "González",
    fullName: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+57 301 234 5678"
  },
  businessInfo: { // Información comercial (opcional, para clientes registrados)
    companyName: "Empresa ABC Ltda",
    businessType: "retail",
    registrationNumber: "987654321"
  },
  address: { // Dirección (embebida)
    street: "Carrera 45 #67-89",
    city: "Medellín",
    state: "Antioquia",
    country: "Colombia",
    zipCode: "050001"
  },
  invoiceHistory: [ // Historial de facturas (referencias)
    {
      invoiceId: "INV-001",
      date: ISODate("2025-08-12T..."),
      amount: 250000,
      status: "paid"
    }
  ],
  preferences: { // Preferencias del cliente
    preferredPaymentMethod: "cash",
    discountLevel: 0,
    notes: "Cliente frecuente"
  },
  status: "active", // active, inactive
  createdAt: ISODate("2025-08-12T..."),
  updatedAt: ISODate("2025-08-12T...")
}
```

### 3. COLECCIÓN: `products` (Productos - Catálogo General)
**Nombre exacto en MongoDB:** `products`

```javascript
{
  _id: ObjectId("..."),
  productId: "PROD-001", // String único generado
  name: "Producto A",
  description: "Descripción detallada del producto",
  category: "Categoría 1",
  subcategory: "Subcategoría A",
  brand: "Marca XYZ",
  sku: "SKU-001",
  barcode: "7894561230123",
  pricing: { // Información de precios
    costPrice: 10000, // Precio de costo
    sellingPrice: 15000, // Precio de venta
    wholesalePrice: 12000, // Precio mayorista
    currency: "COP",
    taxRate: 19 // IVA en porcentaje
  },
  inventory: { // Información de inventario
    currentStock: 150,
    minimumStock: 10,
    maximumStock: 500,
    reorderPoint: 20,
    location: "Bodega A - Estante 3"
  },
  suppliers: [ // Array de proveedores que suministran este producto
    {
      supplierId: "SUP-001",
      supplierName: "Distribuidora XYZ S.A.S",
      supplierPrice: 8000,
      leadTime: 5, // días
      isPreferred: true
    }
  ],
  specifications: { // Especificaciones técnicas
    weight: "500g",
    dimensions: "10x10x5 cm",
    color: "Azul",
    material: "Plástico",
    warranty: "12 meses"
  },
  images: [ // Array de imágenes
    {
      url: "https://example.com/image1.jpg",
      alt: "Vista frontal del producto",
      isPrimary: true
    }
  ],
  status: "active", // active, inactive, discontinued
  createdAt: ISODate("2025-08-12T..."),
  updatedAt: ISODate("2025-08-12T...")
}
```

### 4. COLECCIÓN: `invoices` (Facturas)
**Nombre exacto en MongoDB:** `invoices`

```javascript
{
  _id: ObjectId("..."),
  invoiceId: "INV-001", // String único generado
  invoiceNumber: "FAC-2025-001", // Número de factura legal
  clientId: "CLI-001", // Referencia al cliente
  clientInfo: { // Información del cliente al momento de la factura
    name: "María González",
    taxId: "1234567890",
    address: "Carrera 45 #67-89, Medellín",
    phone: "+57 301 234 5678"
  },
  items: [ // Array de productos facturados
    {
      productId: "PROD-001",
      productName: "Producto A",
      quantity: 2,
      unitPrice: 15000,
      subtotal: 30000,
      taxRate: 19,
      taxAmount: 5700,
      total: 35700
    }
  ],
  totals: { // Totales de la factura
    subtotal: 30000,
    taxAmount: 5700,
    discount: 0,
    total: 35700,
    currency: "COP"
  },
  paymentInfo: { // Información de pago
    method: "cash", // cash, card, transfer
    status: "paid", // pending, paid, partial, overdue
    paidAmount: 35700,
    paymentDate: ISODate("2025-08-12T...")
  },
  dates: {
    issueDate: ISODate("2025-08-12T..."),
    dueDate: ISODate("2025-08-19T..."),
    paidDate: ISODate("2025-08-12T...")
  },
  pdfInfo: { // Información del PDF generado
    fileName: "INV-001.pdf",
    url: "https://storage.com/invoices/INV-001.pdf",
    generatedAt: ISODate("2025-08-12T...")
  },
  notes: "Factura pagada en efectivo",
  status: "completed", // draft, sent, paid, cancelled
  createdAt: ISODate("2025-08-12T..."),
  updatedAt: ISODate("2025-08-12T...")
}
```

### 5. COLECCIÓN: `users` (Usuarios del Sistema)
**Nombre exacto en MongoDB:** `users`

```javascript
{
  _id: ObjectId("..."),
  userId: "USER-001",
  username: "admin",
  email: "admin@bazar.com",
  password: "$2b$10$...", // Hash bcrypt
  profile: {
    firstName: "Administrador",
    lastName: "Sistema",
    avatar: "avatar-url.jpg"
  },
  role: "admin", // admin, manager, employee
  permissions: [
    "suppliers:read",
    "suppliers:write",
    "clients:read",
    "clients:write",
    "invoices:read",
    "invoices:write",
    "products:read",
    "products:write"
  ],
  preferences: {
    theme: "light", // light, dark
    language: "es",
    timezone: "America/Bogota"
  },
  lastLogin: ISODate("2025-08-12T..."),
  status: "active",
  createdAt: ISODate("2025-08-12T..."),
  updatedAt: ISODate("2025-08-12T...")
}
```

## RELACIONES Y ESTRATEGIAS DE CONSULTA

### 1. **Relación Proveedores - Productos**
**Estrategia:** Desnormalización controlada
- Los productos del catálogo del proveedor se embeben en el documento `suppliers`
- El catálogo general de productos en `products` referencia a los proveedores
- **Ventaja:** Consultas rápidas del catálogo del proveedor
- **Desventaja:** Necesidad de sincronización cuando cambian precios

### 2. **Relación Productos - Inventario**
**Estrategia:** Información embebida
- El inventario se mantiene dentro del documento `products`
- **Ventaja:** Consultas de inventario muy rápidas
- **Desventaja:** Posibles conflictos en actualizaciones concurrentes

### 3. **Relación Clientes - Facturas**
**Estrategia:** Referencia con historial embebido
- Las facturas completas en colección `invoices`
- Resumen de facturas embebido en `clients.invoiceHistory`
- **Ventaja:** Acceso rápido al historial sin joins complejos

## ÍNDICES RECOMENDADOS

```javascript
// Colección: suppliers
db.suppliers.createIndex({ "identificationNumber": 1 }, { unique: true })
db.suppliers.createIndex({ "supplierId": 1 }, { unique: true })
db.suppliers.createIndex({ "company": "text" })
db.suppliers.createIndex({ "status": 1 })

// Colección: clients  
db.clients.createIndex({ "taxId": 1 }, { unique: true })
db.clients.createIndex({ "clientId": 1 }, { unique: true })
db.clients.createIndex({ "personalInfo.email": 1 })
db.clients.createIndex({ "status": 1 })

// Colección: products
db.products.createIndex({ "productId": 1 }, { unique: true })
db.products.createIndex({ "sku": 1 }, { unique: true })
db.products.createIndex({ "barcode": 1 }, { unique: true })
db.products.createIndex({ "name": "text", "description": "text" })
db.products.createIndex({ "category": 1, "subcategory": 1 })
db.products.createIndex({ "status": 1 })

// Colección: invoices
db.invoices.createIndex({ "invoiceId": 1 }, { unique: true })
db.invoices.createIndex({ "invoiceNumber": 1 }, { unique: true })
db.invoices.createIndex({ "clientId": 1 })
db.invoices.createIndex({ "dates.issueDate": -1 })
db.invoices.createIndex({ "status": 1 })

// Colección: users
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "status": 1 })
```

## NOMBRES EXACTOS PARA MONGODB ATLAS

### Configuración de Base de Datos:
- **Nombre de Base de Datos:** `bazar_system`
- **Colecciones:**
  1. `suppliers`
  2. `clients` 
  3. `products`
  4. `invoices`
  5. `users`

### Variables de Entorno (.env):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bazar_system?retryWrites=true&w=majority
DB_NAME=bazar_system
```

¿Te parece bien esta estructura? ¿Quieres que procedamos a crear el backend con esta configuración de MongoDB?
