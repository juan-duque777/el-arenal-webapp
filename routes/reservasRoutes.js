const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');

// Rutas de la API para reservas
router.get('/', reservasController.obtenerReservas);
router.post('/', reservasController.crearReserva);
router.put('/:id', reservasController.actualizarEstadoReserva);

module.exports = router;