const db = require('../database/db');

// 1. OBTENER OPINIONES (Públicas y Privadas)
const obtenerOpiniones = async (req, res) => {
    try {
        // Si la petición pide solo las visibles (para la página pública)
        const { soloVisibles } = req.query;
        let query = 'SELECT * FROM opiniones ORDER BY fecha_creacion DESC';
        
        if (soloVisibles === 'true') {
            query = 'SELECT * FROM opiniones WHERE visible = TRUE ORDER BY fecha_creacion DESC';
        }

        const [opiniones] = await db.query(query);
        res.status(200).json(opiniones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cargar las opiniones' });
    }
};

// 2. CREAR NUEVA OPINIÓN (Desde la vista pública)
const crearOpinion = async (req, res) => {
    try {
        const { nombre, calificacion, comentario } = req.body;

        // Validaciones del Backend (La Muralla)
        if (!nombre || !calificacion || !comentario) {
            return res.status(400).json({ mensaje: 'Faltan datos para la opinión.' });
        }

        // LA ADUANA: Insertamos la opinión obligando a que 'visible' sea 'false' (0)
        await db.query(
            'INSERT INTO opiniones (nombre, calificacion, comentario, visible) VALUES (?, ?, ?, false)',
            [nombre, calificacion, comentario]
        );

        res.status(201).json({ mensaje: '¡Gracias! Tu opinión está en revisión.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al guardar la opinión' });
    }
};

// 3. CAMBIAR VISIBILIDAD (Para el botón de "Ocultar/Mostrar" en el panel Admin)
const cambiarVisibilidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { visible } = req.body; // true o false

        await db.query('UPDATE opiniones SET visible = ? WHERE id = ?', [visible, id]);
        
        res.status(200).json({ mensaje: 'Visibilidad de la opinión actualizada.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar la opinión' });
    }
};

// 4. ELIMINAR OPINIÓN
const eliminarOpinion = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM opiniones WHERE id = ?', [id]);
        res.status(200).json({ mensaje: 'Opinión eliminada definitivamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar la opinión' });
    }
};

// 5. RESPONDER A UNA OPINIÓN
const responderOpinion = async (req, res) => {
    try {
        const { id } = req.params;
        const { respuesta } = req.body;
        
        await db.query('UPDATE opiniones SET respuesta = ? WHERE id = ?', [respuesta, id]);
        res.status(200).json({ mensaje: 'Respuesta guardada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al responder' });
    }
};

module.exports = {
    obtenerOpiniones,
    crearOpinion,
    cambiarVisibilidad,
    eliminarOpinion,
    responderOpinion
};