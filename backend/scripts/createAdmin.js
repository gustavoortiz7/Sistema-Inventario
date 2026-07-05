const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

dotenv.config();

const [, , nameArg, emailArg, passwordArg] = process.argv;

const name = nameArg || process.env.ADMIN_NAME;
const email = emailArg || process.env.ADMIN_EMAIL;
const password = passwordArg || process.env.ADMIN_PASSWORD;

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI no esta configurado');
  }

  if (!name || !email || !password) {
    throw new Error('Uso: npm run create-admin -- "Nombre" email@dominio.com "password"');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    existingUser.name = name;
    existingUser.role = 'admin';
    existingUser.password = await bcrypt.hash(password, 10);
    await existingUser.save();

    console.log(`Usuario existente promovido a admin: ${email}`);
    return;
  }

  await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: 'admin'
  });

  console.log(`Admin creado: ${email}`);
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
