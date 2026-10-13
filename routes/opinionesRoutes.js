const express = require('express');
const router = express.Router();
const opinionesController = require('../controllers/opinionesController');
const validarToken = require('../middlewares/validartoken');

router.get('/', (req, res, next) => {
    if (req.query.soloVisibles === 'true') return next();
    return validarToken(req, res, next);
}, opinionesController.obtenerOpiniones);
router.post('/', opinionesController.crearOpinion);
router.put('/:id/visibilidad', validarToken, opinionesController.cambiarVisibilidad);
router.delete('/:id', validarToken, opinionesController.eliminarOpinion);
router.put('/:id/respuesta', validarToken, opinionesController.responderOpinion);

module.exports = router;

module.exports = router;