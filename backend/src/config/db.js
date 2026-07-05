const mongoose = require('mongoose');
const seedAdmin = require('./seedAdmin');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado');
    
    // Ejecutar semilla del administrador por defecto
    await seedAdmin();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;