// controllers/barangController.js
const pool = require('../models/db');

// CRUD untuk Master Barang
exports.createBarang = async (req, res) => {
    const { kode_barang, nama_barang, deskripsi, harga_jual, harga_modal } = req.body;

    try {
        const [result] = await pool.execute(
            'INSERT INTO barang (kode_barang, nama_barang, deskripsi, harga_jual, harga_modal) VALUES (?, ?, ?, ?, ?)',
            [kode_barang, nama_barang, deskripsi, harga_jual, harga_modal]
        );

        res.status(201).json({
            id: result.insertId,
            kode_barang,
            nama_barang,
            harga_jual,
            harga_modal,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating barang', error });
    }
};

// Get all barang
exports.getBarang = async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM barang');
    res.json(rows);
};

// Update Barang
exports.updateBarang = async (req, res) => {
    const { id } = req.params;
    const { nama_barang, harga_jual, harga_modal } = req.body;

    try {
        await pool.execute(
            'UPDATE barang SET nama_barang = ?, harga_jual = ?, harga_modal = ? WHERE id = ?',
            [nama_barang, harga_jual, harga_modal, id]
        );
        res.json({ message: 'Barang updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating barang', error });
    }
};

// Delete Barang
exports.deleteBarang = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.execute('DELETE FROM barang WHERE id = ?', [id]);
        res.json({ message: 'Barang deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting barang', error });
    }
};

exports.getStok = async (req, res) => {
    try {
        // Query untuk melihat stok barang
        const [rows] = await pool.execute(`
            SELECT barang.id, barang.nama_barang, stok.jumlah
            FROM barang
            JOIN stok ON barang.id = stok.barang_id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stock', error });
    }
};

exports.getBarangTerlaris = async (req, res) => {
    try {
        // Query untuk mendapatkan 5 barang terlaris
        const [rows] = await pool.execute(`
            SELECT barang.id, barang.nama_barang, SUM(pd.jumlah) AS total_terjual
            FROM penjualan_detail pd
            JOIN barang ON pd.barang_id = barang.id
            GROUP BY barang.id
            ORDER BY total_terjual DESC
            LIMIT 5;
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching best-selling items', error });
    }
};

exports.getBarangMenguntungkan = async (req, res) => {
    try {
        // Query untuk mendapatkan 5 barang paling menguntungkan
        const [rows] = await pool.execute(`
            SELECT barang.id, barang.nama_barang,
                   SUM(pd.jumlah) AS qty,
                   SUM(pd.jumlah * barang.harga_jual) AS total,
                   SUM(pd.jumlah * barang.harga_modal) AS modal,
                   SUM(pd.jumlah * (barang.harga_jual - barang.harga_modal)) AS keuntungan
            FROM penjualan_detail pd
            JOIN barang ON pd.barang_id = barang.id
            GROUP BY barang.id
            ORDER BY keuntungan DESC
            LIMIT 5;
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching most profitable items', error });
    }
};