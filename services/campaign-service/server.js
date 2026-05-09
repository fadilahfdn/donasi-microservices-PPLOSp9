const express = require('express');
require('dotenv').config();
const campaignRoutes = require('./src/routes/campaignRoutes');

const app = express();
app.use(express.json());

// sambungkan rute utama
app.use('/', campaignRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Campaign Service berjalan di port ${PORT}`);
});