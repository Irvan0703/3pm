// routes/penjualanRoutes.js
const express = require('express');
const { createPenjualan } = require('../controllers/penjualanController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createPenjualan);
router.get('/penjualan-menguntungkan', authMiddleware, getPenjualanBarangMenguntungkan);

module.exports = router;
