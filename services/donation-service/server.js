const express = require('express');
require('dotenv').config();
const { connectRabbitMQ } = require('./src/config/rabbit');
const donationRoutes = require('./src/routes/donationRoutes');

const app = express();
app.use(express.json());

connectRabbitMQ();

// rute donasi
app.use('/', donationRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Donation Service berjalan di port ${PORT}`);
});