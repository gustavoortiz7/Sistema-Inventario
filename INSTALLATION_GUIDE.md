# Guía Completa de Instalación - Sistema de Inventario

Esta guía te mostrará paso a paso cómo instalar y configurar el sistema en tu máquina.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### 1. Node.js y npm
- **Descargar:** [nodejs.org](https://nodejs.org)
- **Versión recomendada:** v16 o superior
- **Verificar instalación:**
  ```bash
  node --version
  npm --version
  ```

### 2. MongoDB
Elige una opción:

#### Opción A: MongoDB Local
- **Descargar:** [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- **Instalar:** Seguir el instalador para tu SO
- **Verificar:** Ejecutar `mongod` en terminal

#### Opción B: MongoDB Atlas (en la nube - recomendado)
- Ir a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Crear una cuenta gratis
- Crear un cluster
- Obtener el connection string

### 3. Git (opcional pero recomendado)
- **Descargar:** [git-scm.com](https://git-scm.com)

---

## 🔧 Instalación Paso a Paso

### Paso 1: Descargar el Proyecto

Si tienes git:
```bash
git clone <URL_DEL_REPOSITORIO>
cd Sistema-Inventario
```

O descargar como ZIP y extraer.

### Paso 2: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

Esto descargará e instalará todas las librerías necesarias. Espera a que termine (puede tomar 2-3 minutos).

Verifica que se creó la carpeta `node_modules/`.

### Paso 3: Crear Archivo de Configuración (.env)

En la carpeta `backend/`, crear un archivo llamado `.env` con el siguiente contenido:

**Para MongoDB Local:**
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventario
JWT_SECRET=tu_secreto_jwt_super_seguro_cambia_esto_en_produccion
NODE_ENV=development
```

**Para MongoDB Atlas:**
```
PORT=3000
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/inventario?retryWrites=true&w=majority
JWT_SECRET=tu_secreto_jwt_super_seguro_cambia_esto_en_produccion
NODE_ENV=development
```

⚠️ **Importante:** Reemplaza:
- `usuario` y `contraseña` con tus credenciales de MongoDB Atlas
- `cluster0.xxxxx` con tu cluster real
- `tu_secreto_jwt_super_seguro_cambia_esto_en_produccion` con algo único y seguro

### Paso 4: Crear Usuario Admin

En terminal, dentro de la carpeta `backend/`:

```bash
npm run create-admin
```

Esto te pedirá información para crear el primer usuario administrador. Proporciona:
- Nombre
- Email
- Contraseña

Ejemplo:
```
Nombre: Juan Admin
Email: admin@example.com
Contraseña: admin123
```

**Nota:** Guarda estas credenciales, las usarás para iniciar sesión.

### Paso 5: Instalar Dependencias del Frontend

Abre otra terminal y ejecuta:

```bash
cd frontend
npm install
```

Espera a que termine.

### Paso 6: Configurar URL de API del Frontend

En `frontend/src/services/api.js`, verifica que la URL del backend sea correcta:

```javascript
const API = axios.create({
  baseURL: 'http://localhost:3000/api'
  // Cambiar solo si el backend está en otro puerto
});
```

Si el backend está en otro puerto o máquina, actualizar aquí.

---

## ▶️ Ejecutar el Sistema

### Opción A: En Desarrollo (Recomendado para Pruebas)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

Deberías ver:
```
Servidor corriendo en el puerto 3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

El navegador se abrirá automáticamente en `http://localhost:3000`

### Opción B: En Producción

#### Build del Frontend
```bash
cd frontend
npm run build
```

Esto crea una carpeta `build/` con archivos optimizados.

#### Configurar Backend para Servir Frontend
En `backend/server.js`, agregar antes de la ruta `/api/auth`:

```javascript
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

#### Ejecutar
```bash
cd backend
npm start
```

La aplicación estará en `http://localhost:3000`

---

## 🔑 Primer Acceso

1. Abre el navegador en `http://localhost:3000`
2. Verás la pantalla de login
3. Usa las credenciales del admin que creaste:
   - Email: `admin@example.com`
   - Contraseña: `admin123`
4. ¡Listo! Ya estás dentro del sistema

---

## 🧪 Verificar Que Todo Funciona

### 1. Test Backend

En terminal, en la carpeta `backend/`:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Deberías recibir una respuesta JSON con un `token`.

### 2. Test Frontend

- Inicia sesión correctamente
- Navega a cada página (Productos, Punto de Venta, Reportes, etc.)
- Verifica que los datos se cargan sin errores

### 3. Test Completo

Flujo de prueba recomendado:
1. ✅ Iniciar sesión
2. ✅ Ir a Productos y crear un producto nuevo
3. ✅ Ir a Punto de Venta y buscar el producto
4. ✅ Agregar a carrito y completar una venta
5. ✅ Ver la venta en Reportes
6. ✅ Descargar factura en PDF

Si todo funciona, ¡felicidades! ✨

---

## 📂 Estructura de Carpetas Creadas

Después de la instalación, tendrás:

```
Sistema-Inventario/
├── backend/
│   ├── node_modules/          # (Creado automáticamente)
│   ├── uploads/               # (Creado automáticamente)
│   ├── .env                   # (Creaste aquí)
│   ├── src/
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── node_modules/          # (Creado automáticamente)
    ├── build/                 # (Se crea con npm run build)
    ├── src/
    ├── public/
    └── package.json
```

---

## 🐛 Solución de Problemas

### El backend no inicia

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solución:** MongoDB no está corriendo
```bash
# En otra terminal, iniciar MongoDB
mongod

# O si usas MongoDB Atlas, verifica el connection string en .env
```

---

### El frontend no carga datos

**Error:** `ERR_CONNECTION_REFUSED`

**Solución:** 
- Verifica que el backend esté corriendo
- Comprueba que la URL en `frontend/src/services/api.js` sea correcta
- Abre DevTools (F12) y revisa la pestaña Network

---

### Error: `Cannot find module 'express'`

**Solución:**
```bash
# Vuelve a instalar dependencias
rm -rf node_modules
npm install
```

---

### Las imágenes no se cargan

**Solución:**
- Verifica que la carpeta `backend/uploads/` exista
- Asegúrate que el backend está sirviendo esta carpeta
- Comprueba permisos de lectura en la carpeta

---

### Token expirado al iniciar sesión

**Solución:**
- Abre DevTools (F12)
- Limpia localStorage: 
  ```javascript
  localStorage.clear()
  ```
- Recarga la página
- Inicia sesión nuevamente

---

## 📊 Variables de Entorno (.env)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `MONGODB_URI` | Conexión a base de datos | `mongodb://localhost:27017/inventario` |
| `JWT_SECRET` | Clave para firmar tokens | `mi_clave_secreta_123` |
| `NODE_ENV` | Ambiente de ejecución | `development` o `production` |

---

## 🔒 Seguridad en Producción

Antes de subir a un servidor real:

1. **Cambiar JWT_SECRET**
   - Usar una cadena aleatoria y segura
   - No compartir

2. **CORS**
   - En `backend/server.js`, especificar origen permitido:
   ```javascript
   cors({ origin: 'https://tudominio.com' })
   ```

3. **HTTPS**
   - Usar certificados SSL/TLS

4. **Variables de Entorno**
   - Nunca commitear `.env` a git
   - Usar `.env.example` como plantilla

5. **MongoDB**
   - Usar contraseña fuerte
   - En Atlas, configurar IP whitelist
   - Usar roles específicos para usuarios de BD

---

## 🚀 Deployar a Producción

### Opción 1: En Heroku

1. Instalar Heroku CLI
2. ```bash
   heroku login
   heroku create nombre-app
   git push heroku main
   ```

### Opción 2: En DigitalOcean / AWS

1. Crear una máquina virtual con Node.js
2. Clonar el repositorio
3. Instalar dependencias
4. Usar PM2 para mantener el proceso activo:
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name "inventario"
   ```

### Opción 3: Con Docker

Crear `Dockerfile` en backend:
```dockerfile
FROM node:16
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

Ejecutar:
```bash
docker build -t inventario .
docker run -p 3000:3000 inventario
```

---

## ✅ Checklist Final

- [ ] Node.js v16+ instalado
- [ ] MongoDB configurado (local o Atlas)
- [ ] Backend descargado e instalado
- [ ] Archivo `.env` creado en backend
- [ ] Admin creado con `npm run create-admin`
- [ ] Frontend descargado e instalado
- [ ] Backend iniciado (`npm start`)
- [ ] Frontend iniciado (`npm start`)
- [ ] Puedes iniciar sesión
- [ ] Datos de prueba funcionales

---

## 📞 Contacto y Soporte

Si tienes problemas:
1. Revisa esta guía nuevamente
2. Consulta el README.md
3. Verifica los logs del backend y frontend
4. Abre DevTools en el navegador (F12)

---

**¡Felicidades! Tu sistema de inventario ya está listo para usarse.** 🎉

Última actualización: Julio 2026
