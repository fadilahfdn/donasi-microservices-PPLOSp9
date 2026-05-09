const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// route Publik
router.get('/', campaignController.getAll);

// route Privat
router.post('/', verifyToken, isAdmin, campaignController.create);
router.put('/:id', verifyToken, isAdmin, campaignController.update);
router.delete('/:id', verifyToken, isAdmin, campaignController.remove);

module.exports = router;