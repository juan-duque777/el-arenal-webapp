const express = require('express');
const router = express.Router();
const path = require('path');
const validarToken = require('../middlewares/validartoken');
const anticache = require('../middlewares/anticache');

// ==============================
// 🟢 RUTAS PÚBLICAS
// ==============================
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/menu.html'));
});

router.get('/reservas', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/reservas.html'));
});

router.get('/opiniones', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/opiniones.html'));
});

router.get('/login', (req, res) => {
    // Si ya tiene sesión activa, lo mandamos directo al admin
    const token = req.cookies.token;
    if (token) return res.redirect('/admin');
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

// ==============================
// 🔴 RUTAS PRIVADAS (Admin)
// validarToken → verifica JWT en cookie
// anticache    → evita que el navegador guarde estas páginas
// ==============================
router.get('/admin',          validarToken, anticache, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin.html'));
});

router.get('/admin-menu',     validarToken, anticache, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-menu.html'));
});

router.get('/admin-reservas', validarToken, anticache, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-reservas.html'));
});

router.get('/admin-opiniones',validarToken, anticache, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-opiniones.html'));
});

module.exports = router;