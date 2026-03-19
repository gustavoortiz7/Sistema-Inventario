const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Api Inventario Funcionando');
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});