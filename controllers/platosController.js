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

// 1. CREAR PLATO
const crearPlato = async (req, res) => {
    try {
        // Recibimos los datos del frontend
        const { nombre, descripcion, precio, categoria_id } = req.body;
        // Obtenemos la ruta de la imagen (si se subió una)
        const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (!nombre || !precio) return res.status(400).json({ mensaje: "Nombre y precio obligatorios" });

        // 🔥 CORRECCIÓN: Usamos las columnas 'categoria' e 'imagen' que sí existen en tu BD
        await db.query(
            'INSERT INTO platos (nombre, descripcion, precio, categoria, imagen) VALUES (?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, categoria_id || null, imagen_url]
        );
        res.status(201).json({ mensaje: "¡Plato y foto guardados exitosamente! 🍽️" });
    } catch (error) {
        console.error("Error exacto en BD:", error);
        res.status(500).json({ mensaje: 'Error al guardar el plato' });
    }
};

// 2. ACTUALIZAR PLATO
const actualizarPlato = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria_id } = req.body;
        let imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (imagen_url) {
            // 🔥 CORRECCIÓN: Actualizamos 'categoria' e 'imagen'
            await db.query(
                'UPDATE platos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, imagen = ? WHERE id = ?',
                [nombre, descripcion, precio, categoria_id || null, imagen_url, id]
            );
        } else {
            // 🔥 CORRECCIÓN: Actualizamos 'categoria' (cuando no se cambia la foto)
            await db.query(
                'UPDATE platos SET nombre = ?, descripcion = ?, precio = ?, categoria = ? WHERE id = ?',
                [nombre, descripcion, precio, categoria_id || null, id]
            );
        }
        res.status(200).json({ mensaje: "Plato actualizado correctamente" });
    } catch (error) {
        console.error("Error exacto en BD:", error);
        res.status(500).json({ mensaje: 'Error al actualizar el plato' });
    }
};

// 4. ELIMINAR PLATO
const eliminarPlato = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Buscamos la foto en la columna correcta ('imagen')
        const [platos] = await db.query('SELECT imagen FROM platos WHERE id = ?', [id]);
        
        // 2. Borramos el plato de la base de datos
        await db.query('DELETE FROM platos WHERE id = ?', [id]);
        
        // 3. Borramos la foto física del servidor (si existe)
        // db.query devuelve un arreglo de filas, por eso usamos platos[0]
        if (platos.length > 0 && platos[0].imagen) {
            const rutaFisica = path.join(__dirname, '../public', platos[0].imagen);
            if (fs.existsSync(rutaFisica)) fs.unlinkSync(rutaFisica);
        }
        
        res.status(200).json({ mensaje: "¡Plato e imagen eliminados! 🗑️" });
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ mensaje: "Error al eliminar el plato" });
    }
};

module.exports = { obtenerPlatos, crearPlato, actualizarPlato, eliminarPlato };