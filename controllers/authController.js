// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

// Fungsi Registrasi User
exports.register = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Hash password sebelum disimpan
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user baru ke dalam database
        const [result] = await pool.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role || 'user'] // Default role: 'user'
        );

        res.status(201).json({
            id: result.insertId,
            username,
            role: role || 'user',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user', error });
    }
};

// Fungsi Login User
exports.login = async (req, res) => {
    const { username, password } = req.body;

    // Cari user berdasarkan username
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
        return res.status(400).json({ message: 'Username tidak ditemukan' });
    }

    const user = rows[0];

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Password salah' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    res.json({ token });
};
