const express = require('express');
require('dotenv').config();
const authRoutes = require('./src/routes/authRoutes');

const app = express();
app.use(express.json());

// semua rute autentikasi di authRoutes
app.use('/', authRoutes);

const PORT = process.env.PORT || 3331;
app.listen(PORT, () => {
    console.log(`Auth Service berjalan di http://localhost:${PORT}`);
});