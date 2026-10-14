const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const allowedTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
};

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'arenal/platos',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    }
});

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedTypes[extension] && file.mimetype === allowedTypes[extension]) {
        return cb(null, true);
    }

    const error = new Error('Solo se permiten imágenes JPG, JPEG, PNG o WEBP.');
    error.code = 'INVALID_IMAGE_TYPE';
    return cb(error);
};

const uploadSingle = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
}).single('imagen');

function uploadPhoto(req, res, next) {
    uploadSingle(req, res, error => {
        if (!error) return next();

        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ mensaje: 'La imagen no puede superar los 5 MB.' });
        }
        if (error.code === 'INVALID_IMAGE_TYPE') {
            return res.status(400).json({ mensaje: error.message });
        }

        console.error('Error al subir imagen a Cloudinary:', error);
        return res.status(502).json({ mensaje: 'No fue posible subir la imagen. Intenta de nuevo.' });
    });
}

module.exports = uploadPhoto;
