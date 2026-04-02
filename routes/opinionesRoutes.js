const express = require('express');
const router = express.Router();
const opinionesController = require('../controllers/opinionesController');

router.get('/', opinionesController.obtenerOpiniones);
router.post('/', opinionesController.crearOpinion);
router.put('/:id/visibilidad', opinionesController.cambiarVisibilidad);
router.delete('/:id', opinionesController.eliminarOpinion);
router.put('/:id/respuesta', opinionesController.responderOpinion);

module.exports = router;

module.exports = router;