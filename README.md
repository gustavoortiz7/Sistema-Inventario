# Sistema de Inventario y Punto de Venta

Un sistema integral de gestión de inventario y punto de venta construido con React, Node.js y MongoDB. Diseñado para empresas pequeñas y medianas que necesitan controlar stock, ventas, clientes y generar reportes.

## 🎯 Características Principales

### Gestión de Productos
- ✅ Crear, editar y eliminar productos
- ✅ Carga de imágenes para cada producto
- ✅ Control de categorías y subcategorías
- ✅ Monitoreo de stock bajo
- ✅ Historial de movimientos (Kardex)

### Punto de Venta (POS)
- ✅ Buscar productos por nombre, categoría o proveedor
- ✅ Filtros por categoría y subcategoría
- ✅ Carrito de compras en tiempo real
- ✅ Múltiples métodos de pago
- ✅ Facturación y descarga de PDF
- ✅ Registro de clientes en cada venta

### Gestión de Inventario
- ✅ Movimientos de stock (entrada/salida)
- ✅ Visualización de Kardex
- ✅ Alertas de stock bajo
- ✅ Control de devoluciones

### Reportes y Ventas
- ✅ Reporte de ventas por período
- ✅ Filtros por cliente y método de pago
- ✅ Cancelación y restauración de ventas
- ✅ Exportación a PDF
- ✅ KPI de ventas (totales, promedio, cantidad)

### Administración
- ✅ Gestión de clientes
- ✅ Gestión de empleados con roles
- ✅ Control de categorías
- ✅ Dashboard con estadísticas
- ✅ Historial de movimientos

### Seguridad
- ✅ Autenticación con JWT
- ✅ Control de acceso basado en roles (Admin/Empleado)
- ✅ Persistencia de sesión
- ✅ Logout automático al expirar token

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js v16+
- npm o yarn
- MongoDB (local o en la nube)

### Instalación Rápida

```bash
# 1. Instalar dependencias del backend
cd backend
npm install

# 2. Crear archivo .env en backend/
# (Ver INSTALLATION_GUIDE.md para más detalles)

# 3. Crear usuario admin
npm run create-admin

# 4. Iniciar backend (mantener ejecutándose)
npm start

# 5. En otra terminal, instalar frontend
cd frontend
npm install

# 6. Iniciar frontend
npm start
```

Luego accede a `http://localhost:3000` e inicia sesión con las credenciales del admin.

## 📖 Documentación

### Para Instalación Completa
👉 **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** - Guía paso a paso para instalar y configurar el proyecto

### Este README
- Descripción de características
- Comandos útiles
- Solución de problemas rápida

## 📁 Estructura del Proyecto

```
Sistema-Inventario/
├── backend/                     # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Configuración (DB, etc)
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── middlewares/        # Auth, roles
│   │   ├── models/             # Esquemas MongoDB
│   │   └── routes/             # Endpoints
│   ├── uploads/                # Imágenes de productos
│   ├── .env                    # Variables de entorno
│   └── server.js               # Punto de entrada
│
├── frontend/                    # Interfaz (React + Tailwind)
│   ├── src/
│   │   ├── pages/              # Vistas principales
│   │   ├── components/         # Componentes reutilizables
│   │   └── services/           # Cliente HTTP (Axios)
│   └── public/                 # Archivos estáticos
│
├── README.md                   # Este archivo
└── INSTALLATION_GUIDE.md       # Guía de instalación
```

## 🔐 Roles de Usuario

### Admin
- ✅ Acceso a todas las funciones
- ✅ Gestión de productos
- ✅ Gestión de empleados
- ✅ Reportes completos
- ✅ Cancelación de ventas
- ✅ Dashboard

### Empleado
- ✅ Punto de venta
- ✅ Búsqueda de productos
- ✅ Historial de movimientos
- ✅ Registro limitado de datos

## 📊 Flujos Principales

### Registrar una Venta
1. Ir a "Punto de Venta"
2. Buscar/filtrar productos
3. Agregar a carrito
4. Seleccionar cliente
5. Elegir método de pago
6. Completar venta
7. Descargar factura PDF

### Gestionar Stock
1. Ir a "Productos"
2. Seleccionar producto
3. Usar "Agregar" o "Retirar"
4. Ver historial (Kardex)

### Ver Reportes
1. Ir a "Reportes"
2. Filtrar por cliente/fecha
3. Exportar a PDF
4. Cancelar ventas si es necesario

## 🛠️ Comandos Útiles

### Backend
```bash
npm start              # Iniciar servidor
npm run create-admin   # Crear usuario admin
npm test              # Ejecutar pruebas
```

### Frontend
```bash
npm start              # Desarrollo en caliente
npm run build          # Build de producción
npm test              # Ejecutar pruebas
```

## ⚙️ Configuración de Entorno

Crear `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventario
JWT_SECRET=tu_secreto_muy_seguro_aqui
NODE_ENV=development
```

Para **MongoDB Atlas**, usar:
```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/inventario
```

## 🧪 Test Rápido

```bash
# Test de login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Test de productos
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer TOKEN"
```

## 🐛 Solución de Problemas

| Problema | Solución |
|----------|----------|
| MongoDB no conecta | Verificar `MONGODB_URI` en `.env` y que MongoDB esté corriendo |
| Frontend no se conecta | Revisar que backend esté en `http://localhost:3000` |
| Las imágenes no cargan | Verificar que `backend/uploads/` existe |
| Token expirado | Cierra sesión y vuelve a iniciar |

Más detalles en [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md#solución-de-problemas)

## 📈 Próximas Mejoras

- [ ] Pruebas automatizadas completas
- [ ] Sistema de auditoría
- [ ] Más opciones de exportación
- [ ] Dashboard en tiempo real (WebSockets)
- [ ] Integración de métodos de pago
- [ ] Aplicación móvil

## 📝 Stack Tecnológico

### Backend
- **Node.js + Express** - Servidor
- **MongoDB + Mongoose** - Base de datos
- **JWT** - Autenticación
- **Multer** - Carga de archivos
- **bcryptjs** - Encriptación de contraseñas

### Frontend
- **React 19** - Interfaz
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **jsPDF** - Generación de PDFs
- **Chart.js** - Gráficos

## 📄 Licencia

Proyecto de código abierto. Úsalo libremente.

## 👨‍💻 Soporte

1. Lee [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)
2. Revisa los logs del backend y frontend
3. Abre DevTools en el navegador (F12)

---

**Versión:** 1.0.0  
**Última actualización:** Julio 2026
