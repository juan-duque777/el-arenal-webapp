const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const validarToken = require('../middlewares/validartoken');

router.get('/', validarToken, dashboardController.obtenerEstadisticas);

module.exports = router;