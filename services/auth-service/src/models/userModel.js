const db = require('../config/db');

const createUser = async (nama, email, password, role) => {
    const [result] = await db.execute(
        'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
        [nama, email, password, role]
    );
    return result.insertId;
};

const findByEmail = async (email) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

module.exports = { createUser, findByEmail };