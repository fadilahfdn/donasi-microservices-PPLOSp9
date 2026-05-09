const db = require('../config/db');

const getAll = async () => {
    const [rows] = await db.execute('SELECT * FROM campaigns ORDER BY created_at DESC');
    return rows;
};

const create = async (judul, deskripsi, target_dana) => {
    const [result] = await db.execute(
        'INSERT INTO campaigns (judul, deskripsi, target_dana) VALUES (?, ?, ?)',
        [judul, deskripsi, target_dana]
    );
    return result.insertId;
};

const update = async (id, data) => {
    const { judul, deskripsi, target_dana, status } = data;
    await db.execute(
        `UPDATE campaigns SET 
        judul = COALESCE(?, judul), 
        deskripsi = COALESCE(?, deskripsi), 
        target_dana = COALESCE(?, target_dana), 
        status = COALESCE(?, status) 
        WHERE id = ?`,
        [judul, deskripsi, target_dana, status, id]
    );
};

const remove = async (id) => {
    await db.execute('DELETE FROM campaigns WHERE id = ?', [id]);
};

module.exports = { getAll, create, update, remove };