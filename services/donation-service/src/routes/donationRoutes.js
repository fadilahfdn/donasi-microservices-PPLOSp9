const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { verifyToken } = require('../middlewares/authMiddleware');

// POST
router.post('/', verifyToken, donationController.create);

module.exports = router;