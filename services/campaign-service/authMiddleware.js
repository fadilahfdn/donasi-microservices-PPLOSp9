const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Mengambil string setelah 'Bearer'

    if (!token) return res.status(401).json({ error: 'Akses ditolak, token tidak ditemukan!' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token tidak valid atau kadaluwarsa!' });
    }
};

// mengecek role admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses terlarang! Hanya Admin yang boleh melakukan aksi ini.' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };