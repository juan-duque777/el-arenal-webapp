const db = require('../database/db');
const fs = require('fs'); // Para poder borrar archivos físicos
const path = require('path');

const obtenerPlatos = async (req, res) => {
    try {
        const [platos] = await db.query('SELECT * FROM platos');
        res.status(200).json(platos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al cargar el menú' });
    }
};

const crearPlato = async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria_id } = req.body;
        // Si subieron una foto, sacamos la ruta, si no, queda en null
        const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (!nombre || !precio) return res.status(400).json({ mensaje: "Nombre y precio obligatorios" });

        await db.query(
            'INSERT INTO platos (nombre, descripcion, precio, categoria_id, imagen_url) VALUES (?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, categoria_id || null, imagen_url]
        );
        res.status(201).json({ mensaje: "¡Plato y foto guardados exitosamente! 🍽️" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al guardar el plato' });
    }
};

const actualizarPlato = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria_id } = req.body;
        let imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

        // Si hay una nueva foto, actualizamos todo incluyendo la foto
        if (imagen_url) {
            await db.query(
                'UPDATE platos SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, imagen_url = ? WHERE id = ?',
                [nombre, descripcion, precio, categoria_id || null, imagen_url, id]
            );
        } else {
            // Si NO subieron foto nueva, actualizamos solo los textos y dejamos la foto que ya tenía
            await db.query(
                'UPDATE platos SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ? WHERE id = ?',
                [nombre, descripcion, precio, categoria_id || null, id]
            );
        }
        res.status(200).json({ mensaje: "¡Plato actualizado con éxito! ✏️" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar el plato" });
    }
};

const eliminarPlato = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Buscamos el plato para saber si tenía foto
        const [platos] = await db.query('SELECT imagen_url FROM platos WHERE id = ?', [id]);
        
        // 2. Lo borramos de la base de datos
        await db.query('DELETE FROM platos WHERE id = ?', [id]);

        // 3. Si tenía foto física, la borramos de la carpeta uploads (Para ahorrar espacio, nivel Alta Gerencia)
        if (platos[0] && platos[0].imagen_url) {
            const rutaFisica = path.join(__dirname, '../public', platos[0].imagen_url);
            if (fs.existsSync(rutaFisica)) fs.unlinkSync(rutaFisica);
        }

        res.status(200).json({ mensaje: "¡Plato e imagen eliminados! 🗑️" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el plato" });
    }
};

module.exports = { obtenerPlatos, crearPlato, actualizarPlato, eliminarPlato };