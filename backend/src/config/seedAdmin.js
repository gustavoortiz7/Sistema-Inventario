const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Buscar si ya existe algún usuario con el rol 'admin'
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('Verificación de BD: Ya existe al menos un usuario administrador.');
      return;
    }

    // Obtener las credenciales desde variables de entorno o usar valores por defecto
    const name = process.env.ADMIN_NAME || 'Administrador';
    const email = process.env.ADMIN_EMAIL || 'admin@sistema.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    // Encriptar la contraseña por defecto
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el administrador por defecto
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log(`[SEED] Administrador por defecto creado exitosamente:`);
    console.log(` - Nombre: ${name}`);
    console.log(` - Email: ${email}`);
    console.log(` - Contraseña: [CONFIGURADA EN .env o 'admin123' por defecto]`);

  } catch (error) {
    console.error('Error al inicializar el administrador por defecto:', error);
  }
};

module.exports = seedAdmin;
