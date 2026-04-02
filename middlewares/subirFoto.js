const multer = require('multer');
const path = require('path');

// Configuración de dónde y cómo se guardan las fotos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Carpeta donde caerán las fotos
    },
    filename: function (req, file, cb) {
        // Le ponemos un nombre único: plato-123456789.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'plato-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro opcional para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('El archivo no es una imagen válida'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;