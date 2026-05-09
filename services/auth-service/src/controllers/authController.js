const authService = require('../services/authService');

// Registrasi
const register = async (req, res) => {
    try {
        const userId = await authService.registerUser(req.body);
        res.status(201).json({ 
            message: 'Registrasi berhasil!', 
            userId 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

module.exports = { register, login };