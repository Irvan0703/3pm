// controllers/penjualanController.js
const pool = require('../models/db');

// Input Penjualan
exports.createPenjualan = async (req, res) => {
    const { tanggal, detail } = req.body;
    const nomor_transaksi = `AA${new Date().getFullYear().toString().slice(2)}${new Date().getMonth() + 1}${new Date().getDate()}0001`; // Format: AAYYMMDD0000

    try {
        // Insert Penjualan
        const [result] = await pool.execute(
            'INSERT INTO penjualan (nomor_transaksi, tanggal, total) VALUES (?, ?, ?)',
            [nomor_transaksi, tanggal, 0]
        );

        let total = 0;

        // Insert Penjualan Detail dan update stok
        for (let i = 0; i < detail.length; i++) {
            const { barang_id, jumlah, harga } = detail[i];
            const total_barang = jumlah * harga;
            total += total_barang;

            // Insert ke detail penjualan
            await pool.execute(
                'INSERT INTO penjualan_detail (penjualan_id, barang_id, jumlah, harga, total) VALUES (?, ?, ?, ?, ?)',
                [result.insertId, barang_id, jumlah, harga, total_barang]
            );

            // Update Stok
            const [stok] = await pool.execute('SELECT jumlah FROM stok WHERE barang_id = ?', [barang_id]);
            if (stok[0].jumlah < jumlah) {
                return res.status(400).json({ message: 'Stok tidak cukup' });
            }

            // Kurangi stok
            await pool.execute(
                'UPDATE stok SET jumlah = jumlah - ? WHERE barang_id = ?',
                [jumlah, barang_id]
            );
        }

        // Update total penjualan
        await pool.execute('UPDATE penjualan SET total = ? WHERE id = ?', [total, result.insertId]);

        res.status(201).json({
            nomor_transaksi,
            total,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating penjualan', error });
    }
};

exports.getPenjualanBarangMenguntungkan = async (req, res) => {
    try {
        // Query untuk mendapatkan penjualan yang mengandung 5 barang paling menguntungkan
        const [rows] = await pool.execute(`
            SELECT p.id AS idpenjualan, p.tanggal,
                   b.id AS barang_id, b.nama_barang, pd.jumlah, pd.harga, pd.total
            FROM penjualan p
            JOIN penjualan_detail pd ON p.id = pd.penjualan_id
            JOIN barang b ON pd.barang_id = b.id
            WHERE b.id IN (
                SELECT barang.id
                FROM penjualan_detail pd
                JOIN barang ON pd.barang_id = barang.id
                GROUP BY barang.id
                ORDER BY SUM(pd.jumlah * (barang.harga_jual - barang.harga_modal)) DESC
                LIMIT 5
            );
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales containing top 5 profitable items', error });
    }
};