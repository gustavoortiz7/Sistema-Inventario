# Documentación: Soporte de imagen en productos

## Resumen
Se añadió soporte completo para imágenes de producto en el sistema:

- Backend guarda imágenes en `backend/uploads` usando `multer`.
- Backend sirve archivos estáticos desde `/uploads`.
- El campo `image` se guarda en MongoDB como la ruta accesible `/uploads/<filename>`.
- Frontend acepta imagenes en la página de productos (`frontend/src/pages/Products.js`).
- El formulario de creación permite seleccionar una imagen.
- El formulario de edición permite reemplazar la imagen.
- El listado de productos muestra miniaturas cuando el producto tiene imagen.

## Archivos modificados

- `backend/package.json`
  - Se añadió la dependencia `multer`.
- `backend/server.js`
  - Se creó la carpeta `uploads/` si no existe.
  - Se sirve `uploads/` como contenido estático.
- `backend/src/routes/productRoutes.js`
  - Se usa `upload.single('image')` en `POST /api/products` y `PUT /api/products/:id`.
- `backend/src/controllers/productController.js`
  - Se guarda `req.file` en el campo `image` cuando hay archivo adjunto.
- `frontend/src/pages/Products.js`
  - Se agregó el input `type="file"` para el campo `image`.
  - Se usa `FormData` para enviar la imagen al backend.
  - Se implementó preview de la imagen seleccionada en creación y edición.
  - Se muestra la imagen del producto en las tarjetas del listado.

## Cómo probar manualmente

1. Iniciar backend:

```bash
cd backend
npm install
npm start
```

2. Iniciar frontend:

```bash
cd frontend
npm install
npm start
```

> Si usas variable `REACT_APP_API_URL`, asegúrate de que apunte al backend correcto.

3. Iniciar sesión como usuario admin en el frontend.

4. Crear un producto nuevo:
   - Completa nombre, precio, stock, categoría, proveedor y teléfono.
   - Selecciona un archivo de imagen.
   - Presiona `Crear`.

5. Verificar que el producto aparece en el listado con miniatura.

6. Editar un producto existente:
   - Haz clic en el lápiz.
   - Selecciona una nueva imagen o deja la existente.
   - Guarda los cambios.

7. Verificar en backend que se generó un archivo nuevo en `backend/uploads` y que la URL `/uploads/<filename>` carga la imagen.

## Puntos clave de prueba

- Crear producto con imagen.
- Crear producto sin imagen.
- Editar producto y actualizar la imagen.
- Verificar que la tarjeta del producto muestra la imagen.
- Confirmar que el campo `image` en la base de datos almacena una ruta iniciando con `/uploads/`.

## Nota

La validación final la harás tú. Aquí quedó lista la implementación para que pruebes la carga y el guardado de imágenes sin pasos adicionales de código.
