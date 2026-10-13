const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '../public/uploads');
const allowedTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        fs.mkdir(uploadDirectory, { recursive: true }, error => cb(error, uploadDirectory));
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'plato-' + uniqueSuffix + extension);
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

async function matchesImageSignature(file) {
    const extension = path.extname(file.originalname).toLowerCase();
    const handle = await fs.promises.open(file.path, 'r');

    try {
        const header = Buffer.alloc(12);
        const { bytesRead } = await handle.read(header, 0, header.length, 0);

        if (extension === '.jpg' || extension === '.jpeg') {
            return bytesRead >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
        }
        if (extension === '.png') {
            return bytesRead >= 8 && header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
        }
        if (extension === '.webp') {
            return bytesRead >= 12
                && header.toString('ascii', 0, 4) === 'RIFF'
                && header.toString('ascii', 8, 12) === 'WEBP';
        }
        return false;
    } finally {
        await handle.close();
    }
}

async function removeUploadedFile(filePath) {
    try {
        await fs.promises.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
}

function uploadPhoto(req, res, next) {
    uploadSingle(req, res, async error => {
        if (error) {
            if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ mensaje: 'La imagen no puede superar los 5 MB.' });
            }
            if (error.code === 'INVALID_IMAGE_TYPE') {
                return res.status(400).json({ mensaje: error.message });
            }
            return next(error);
        }

        if (!req.file) return next();

        try {
            if (!(await matchesImageSignature(req.file))) {
                await removeUploadedFile(req.file.path);
                return res.status(400).json({ mensaje: 'El contenido del archivo no coincide con una imagen JPG, PNG o WEBP válida.' });
            }
            return next();
        } catch (validationError) {
            try {
                await removeUploadedFile(req.file.path);
            } catch (cleanupError) {
                return next(cleanupError);
            }
            return next(validationError);
        }
    });
}

module.exports = uploadPhoto;
