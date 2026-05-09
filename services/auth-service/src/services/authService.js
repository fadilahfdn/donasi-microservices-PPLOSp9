const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (userData) => {
    const { nama, email, password, role } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = role === 'admin' ? 'admin' : 'donatur';
    
    return await userModel.createUser(nama, email, hashedPassword, userRole);
};

const loginUser = async (email, password) => {
    const user = await userModel.findByEmail(email);
    if (!user) throw new Error('Email atau password salah!');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Email atau password salah!');

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return { token, user: { id: user.id, nama: user.nama, role: user.role } };
};

module.exports = { registerUser, loginUser };