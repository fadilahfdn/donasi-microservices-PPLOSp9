const express = require('express');
const db = require('./db');
const { verifyToken, isAdmin } = require('./authMiddleware');
require('dotenv').config();

const app = express();
app.use(express.json());

// Melihat semua program donasi
app.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM campaigns ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// membuat program baru
app.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { judul, deskripsi, target_dana } = req.body;
        
        if (!judul || !target_dana) return res.status(400).json({ error: 'Judul dan target dana wajib diisi!' });

        const [result] = await db.execute(
            'INSERT INTO campaigns (judul, deskripsi, target_dana) VALUES (?, ?, ?)',
            [judul, deskripsi, target_dana]
        );
        res.status(201).json({ message: 'Program berhasil dibuat!', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// menghapus program
app.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await db.execute('DELETE FROM campaigns WHERE id = ?', [req.params.id]);
        res.json({ message: 'Program berhasil dihapus!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// memperbarui data program
app.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, deskripsi, target_dana, status } = req.body;

        const [campaign] = await db.execute('SELECT * FROM campaigns WHERE id = ?', [id]);
        if (campaign.length === 0) {
            return res.status(404).json({ error: 'program tidak ditemukan!' });
        }

        // jalankan UPDATE
        await db.execute(
            `UPDATE campaigns SET 
            judul = COALESCE(?, judul), 
            deskripsi = COALESCE(?, deskripsi), 
            target_dana = COALESCE(?, target_dana), 
            status = COALESCE(?, status) 
            WHERE id = ?`,
            [judul, deskripsi, target_dana, status, id]
        );

        res.json({ message: 'Data program berhasil diperbarui!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui program.' });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Campaign Service berjalan di port ${PORT}`));