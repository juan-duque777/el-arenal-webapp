const db = require('../database/db');

const obtenerEstadisticas = async (req, res) => {
    try {
        // 1. Contar Total Reservas
        const [resReservas] = await db.query('SELECT COUNT(*) as total FROM reservas');
        const totalReservas = resReservas[0].total;

        // 2. Contar Total Platos en el Menú
        const [resPlatos] = await db.query('SELECT COUNT(*) as total FROM platos');
        const totalPlatos = resPlatos[0].total;

        // 3. Contar Opiniones y calcular el Promedio (Solo las visibles)
        const [resOpiniones] = await db.query('SELECT COUNT(*) as total, IFNULL(AVG(calificacion), 0) as promedio FROM opiniones WHERE visible = 1');
        const totalOpiniones = resOpiniones[0].total;
        const promedio = parseFloat(resOpiniones[0].promedio).toFixed(1);

        // 4. Traer las Reservas de HOY
        const [reservasHoy] = await db.query('SELECT * FROM reservas WHERE DATE(fecha) = CURDATE() ORDER BY hora ASC LIMIT 5');

        // 5. Traer la Actividad Reciente (Últimas 4 opiniones generales)
        const [actividad] = await db.query('SELECT nombre, calificacion, comentario, fecha_creacion FROM opiniones ORDER BY fecha_creacion DESC LIMIT 4');

        // Enviamos todo el paquete junto al Frontend
        res.status(200).json({
            stats: { totalReservas, totalPlatos, totalOpiniones, promedio },
            reservasHoy,
            actividad
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cargar el dashboard' });
    }
};

module.exports = { obtenerEstadisticas };