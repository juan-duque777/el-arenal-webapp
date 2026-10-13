const express = require('express');
const router = express.Router();
const platosController = require('../controllers/platosController');
const upload = require('../middlewares/subirFoto'); // <-- Importamos Multer
const validarToken = require('../middlewares/validartoken');

router.get('/', platosController.obtenerPlatos);
// Le decimos que intercepte un archivo llamado 'imagen' antes de ir al controlador
router.post('/', validarToken, upload.single('imagen'), platosController.crearPlato); 
router.put('/:id', validarToken, upload.single('imagen'), platosController.actualizarPlato);
router.delete('/:id', validarToken, platosController.eliminarPlato);

module.exports = router;