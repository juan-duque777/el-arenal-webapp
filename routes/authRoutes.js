// =============================================
// RUTAS: Autenticación
// POST /api/auth/login  → genera JWT y setea cookie
// POST /api/auth/logout → destruye la cookie
// =============================================

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verificarUser = require('../middlewares/verificaruser');
require('dotenv').config();

const secret = process.env.SECRETJWT;

// ── LOGIN ─────────────────────────────────────
// verificarUser actúa como middleware: si pasa, el usuario es válido
router.post('/login', verificarUser, (req, res) => {
    const payload = {
        email: req.user.email,
        rol: req.user.rol
    };

    // Generamos el JWT con expiración de 8 horas
    const token = jwt.sign(payload, secret, { expiresIn: '8h' });

    // Seteamos el token en cookie httpOnly (el JS del cliente NO puede leerla)
    res.cookie('token', token, {
        httpOnly: true,   // No accesible desde JS → protege contra XSS
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        sameSite: 'strict', // Protege contra CSRF
        maxAge: 8 * 60 * 60 * 1000 // 8 horas en milisegundos
    });

    // Respondemos con éxito para que el frontend redirija
    return res.status(200).json({ success: true, redirect: '/admin' });
});

// ── LOGOUT ────────────────────────────────────
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    return res.redirect('/login');
});

module.exports = router;