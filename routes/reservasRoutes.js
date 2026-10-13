const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');
const validarToken = require('../middlewares/validartoken');

// Rutas de la API para reservas
router.get('/', validarToken, reservasController.obtenerReservas);
router.post('/', reservasController.crearReserva);
router.put('/:id', validarToken, reservasController.actualizarEstadoReserva);

module.exports = router;