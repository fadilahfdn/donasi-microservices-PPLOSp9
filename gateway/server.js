const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3330;

// Middleware keamanan dasar
app.use(helmet());
app.use(cors());

// Middleware logging
app.use(morgan('dev'));

// Middleware rate limiter
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 15,
    message: { error: 'Terlalu banyak request, silakan coba lagi setelah 1 menit.' }
});
app.use(limiter);

app.use('/auth', createProxyMiddleware({ 
    target: 'http://auth:3331', 
    changeOrigin: true 
}));

app.use('/campaigns', createProxyMiddleware({ 
    target: 'http://campaign:3332', 
    changeOrigin: true 
}));

app.use('/donations', createProxyMiddleware({ 
    target: 'http://donation:3333', 
    changeOrigin: true 
}));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Gateway DariKita Berjalan Normal' });
});

app.listen(PORT, () => {
    console.log(`API Gateway berjalan di http://localhost:${PORT}`);
});