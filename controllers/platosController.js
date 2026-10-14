const db = require('../database/db');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

async function eliminarImagenSubida(file) {
    if (file && file.filename) {
        await cloudinary.uploader.destroy(file.filename, { resource_type: 'image' });
    }
}

async function eliminarImagenGuardada(imagenUrl) {
    if (typeof imagenUrl !== 'string') return;

    let url;
    try {
        url = new URL(imagenUrl);
    } catch {
        url = null;
    }

    if (
        url &&
        url.protocol === 'https:' &&
        url.hostname === 'res.cloudinary.com' &&
        url.pathname.startsWith(`/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`)
    ) {
        const partes = url.pathname.split('/').filter(Boolean);
        const uploadIndex = partes.indexOf('upload');
        const publicIdParts = partes.slice(uploadIndex + 1);
        if (/^v\d+$/.test(publicIdParts[0] || '')) publicIdParts.shift();
        const lastPart = publicIdParts.pop();
        if (!lastPart) return;
        publicIdParts.push(lastPart.replace(/\.[^.]+$/, ''));
        await cloudinary.uploader.destroy(decodeURIComponent(publicIdParts.join('/')), { resource_type: 'image' });
        return;
    }

    const legacyMatch = /^\/uploads\/([A-Za-z0-9._-]+)$/.exec(imagenUrl);
    if (legacyMatch) {
        const rutaFisica = path.join(__dirname, '../public/uploads', legacyMatch[1]);
        try {
            await fs.promises.unlink(rutaFisica);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
    }
}

const obtenerPlatos = async (req, res) => {
    try {
        const [platos] = await db.query('SELECT * FROM platos');
        res.status(200).json(platos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al cargar el menú' });
    }
};

// 1. CREAR PLATO
const crearPlato = async (req, res) => {
    try {
        // Recibimos los datos del frontend
        const { nombre, descripcion, precio, categoria_id } = req.body;
        const imagen_url = req.file ? req.file.path : null;

        if (!nombre || !precio) {
            if (req.file) await eliminarImagenSubida(req.file);
            return res.status(400).json({ mensaje: 'Nombre y precio obligatorios' });
        }

        await db.query(
            'INSERT INTO platos (nombre, descripcion, precio, categoria, imagen) VALUES (?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, categoria_id || null, imagen_url]
        );
        res.status(201).json({ mensaje: '¡Plato y foto guardados exitosamente! 🍽️' });
    } catch (error) {
        if (req.file) {
            try {
                await eliminarImagenSubida(req.file);
            } catch (cleanupError) {
                console.error('No se pudo limpiar la imagen de Cloudinary tras fallar el guardado:', cleanupError);
            }
        }
        console.error("Error exacto en BD:", error);
        res.status(500).json({ mensaje: 'Error al guardar el plato' });
    }
};

// 2. ACTUALIZAR PLATO
const actualizarPlato = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria_id } = req.body;
        const imagen_url = req.file ? req.file.path : null;

        if (imagen_url) {
            const [platos] = await db.query('SELECT imagen FROM platos WHERE id = ?', [id]);
            await db.query(
                'UPDATE platos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, imagen = ? WHERE id = ?',
                [nombre, descripcion, precio, categoria_id || null, imagen_url, id]
            );
            if (platos.length > 0 && platos[0].imagen) {
                try {
                    await eliminarImagenGuardada(platos[0].imagen);
                } catch (cleanupError) {
                    console.error('No se pudo eliminar la imagen anterior del plato:', cleanupError);
                }
            }
        } else {
            await db.query(
                'UPDATE platos SET nombre = ?, descripcion = ?, precio = ?, categoria = ? WHERE id = ?',
                [nombre, descripcion, precio, categoria_id || null, id]
            );
        }
        res.status(200).json({ mensaje: 'Plato actualizado correctamente' });
    } catch (error) {
        if (req.file) {
            try {
                await eliminarImagenSubida(req.file);
            } catch (cleanupError) {
                console.error('No se pudo limpiar la imagen de Cloudinary tras fallar la actualización:', cleanupError);
            }
        }
        console.error("Error exacto en BD:", error);
        res.status(500).json({ mensaje: 'Error al actualizar el plato' });
    }
};

// 4. ELIMINAR PLATO
const eliminarPlato = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [platos] = await db.query('SELECT imagen FROM platos WHERE id = ?', [id]);
        await db.query('DELETE FROM platos WHERE id = ?', [id]);

        if (platos.length > 0 && platos[0].imagen) {
            try {
                await eliminarImagenGuardada(platos[0].imagen);
            } catch (cleanupError) {
                console.error('No se pudo eliminar la imagen del plato:', cleanupError);
                return res.status(200).json({
                    mensaje: 'Plato eliminado, pero no se pudo eliminar su imagen almacenada.'
                });
            }
        }

        res.status(200).json({ mensaje: '¡Plato e imagen eliminados! 🗑️' });
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ mensaje: "Error al eliminar el plato" });
    }
};

module.exports = { obtenerPlatos, crearPlato, actualizarPlato, eliminarPlato };