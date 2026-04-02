const express = require('express');
const router = express.Router();
const platosController = require('../controllers/platosController');
const upload = require('../middlewares/subirFoto'); // <-- Importamos Multer

router.get('/', platosController.obtenerPlatos);
// Le decimos que intercepte un archivo llamado 'imagen' antes de ir al controlador
router.post('/', upload.single('imagen'), platosController.crearPlato); 
router.put('/:id', upload.single('imagen'), platosController.actualizarPlato);
router.delete('/:id', platosController.eliminarPlato);

module.exports = router;