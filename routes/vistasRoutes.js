const express = require('express');
const router = express.Router();
const path = require('path');

// ==============================
// 🟢 RUTAS PÚBLICAS (Para tus clientes)
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

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.get('/opiniones', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/opiniones.html'));
});


// ==============================
// 🔴 RUTAS PRIVADAS (Para el Administrador)
// ==============================
// Nota: Más adelante pondremos aquí el middleware para bloquearlas si no hay sesión iniciada

router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin.html'));
});

router.get('/admin-menu', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-menu.html'));
});

router.get('/admin-reservas', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-reservas.html'));
});

router.get('/admin-opiniones', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-opiniones.html'));
});

module.exports = router;