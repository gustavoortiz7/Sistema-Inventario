const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const testRoutes = require('./src/routes/testRoutes');
const productRoutes = require('./src/routes/productRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

const cors = require('cors');

// 🔥 CONFIGURACIÓN SEGURA
const corsOptions = {
    origin: 'https://sistema-inventario-frontend-black.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// usar CORS
app.use(cors(corsOptions));

// 🔥 RESPONDER MANUALMENTE AL PREFLIGHT
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://sistema-inventario-frontend-black.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});


app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => {
    res.send('Api Inventario Funcionando');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
