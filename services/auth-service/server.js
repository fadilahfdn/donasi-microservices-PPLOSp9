const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Registrasi
app.post('/register', async (req, res) => {
    try {
        const { nama, email, password, role } = req.body;

        if (!nama || !email || !password) {
            return res.status(400).json({ error: 'Nama, email, dan password wajib diisi!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // defaultnya donatur
        const userRole = role === 'admin' ? 'admin' : 'donatur';

        const [result] = await db.execute(
            'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
            [nama, email, hashedPassword, userRole]
        );

        res.status(201).json({ 
            message: 'Registrasi berhasil!', 
            userId: result.insertId 
        });

    } catch (error) {
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email sudah terdaftar!' });
        }
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

// Login & JWT
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Email atau password salah!' });
        }

        const user = users[0];

        // pencocokan pw
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email atau password salah!' });
        }

        const payload = {
            id: user.id,
            role: user.role
        };

        // cetak token JWT (berlaku 1 hari)
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: 'Login berhasil!',
            token: token,
            user: {
                id: user.id,
                nama: user.nama,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

app.listen(PORT, () => {
    console.log(`Auth Service berjalan di http://localhost:${PORT}`);
});