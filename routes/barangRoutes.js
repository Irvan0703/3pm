// routes/barangRoutes.js
const express = require('express');
const {
    createBarang,
    getBarang,
    updateBarang,
    deleteBarang,
} = require('../controllers/barangController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createBarang);
router.get('/', authMiddleware, getBarang);
router.put('/:id', authMiddleware, updateBarang);
router.delete('/:id', authMiddleware, deleteBarang);
router.get('/stok', authMiddleware, getStok);
router.get('/terlaris', authMiddleware, getBarangTerlaris);
router.get('/menguntungkan', authMiddleware, getBarangMenguntungkan);

module.exports = router;
