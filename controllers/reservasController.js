const db = require('../database/db');

// 1. OBTENER TODAS LAS RESERVAS (Para el panel de Admin)
const obtenerReservas = async (req, res) => {
    try {
        // Ordenamos para que las más recientes salgan de primeras
        const [reservas] = await db.query('SELECT * FROM reservas ORDER BY fecha_creacion DESC');
        res.status(200).json(reservas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cargar las reservas' });
    }
};

// 2. CREAR NUEVA RESERVA (Para la vista pública)
const crearReserva = async (req, res) => {
    try {
        const { nombre, telefono, fecha, hora, personas, notas } = req.body;

        // Validación básica
        if (!nombre || !telefono || !fecha || !hora || !personas) {
            return res.status(400).json({ mensaje: 'Por favor completa todos los campos obligatorios.' });
        }

        const [resultado] = await db.query(
            'INSERT INTO reservas (nombre, telefono, fecha, hora, personas, notas) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, telefono, fecha, hora, personas, notas || '']
        );

        res.status(201).json({ mensaje: '¡Reserva solicitada con éxito!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al procesar la reserva' });
    }
};

// 3. ACTUALIZAR ESTADO DE LA RESERVA (Para el panel de Admin)
const actualizarEstadoReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // Puede ser 'confirmada' o 'rechazada'

        if (!['pendiente', 'confirmada', 'rechazada'].includes(estado)) {
            return res.status(400).json({ mensaje: 'Estado no válido' });
        }

        await db.query('UPDATE reservas SET estado = ? WHERE id = ?', [estado, id]);
        
        res.status(200).json({ mensaje: `Reserva ${estado} exitosamente` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar la reserva' });
    }
};

module.exports = {
    obtenerReservas,
    crearReserva,
    actualizarEstadoReserva
};