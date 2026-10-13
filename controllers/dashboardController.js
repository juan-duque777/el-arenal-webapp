const db = require('../database/db');

const obtenerEstadisticas = async (req, res) => {
    try {
        // 1. Contar Total Reservas
        const [resReservas] = await db.query('SELECT COUNT(*) as total FROM reservas');
        const totalReservas = resReservas[0].total;

        const [resReservasPendientes] = await db.query("SELECT COUNT(*) as total FROM reservas WHERE estado = 'pendiente'");
        const reservasPendientes = resReservasPendientes[0].total;

        // 2. Contar Total Platos en el Menú
        const [resPlatos] = await db.query('SELECT COUNT(*) as total FROM platos');
        const totalPlatos = resPlatos[0].total;

        // 3. Contar Opiniones y calcular el Promedio (Solo las visibles)
        const [resOpiniones] = await db.query('SELECT COUNT(*) as total, IFNULL(AVG(calificacion), 0) as promedio FROM opiniones WHERE visible = 1');
        const totalOpiniones = resOpiniones[0].total;
        const promedio = parseFloat(resOpiniones[0].promedio).toFixed(1);

        // Traer reservas recientes y futuras; el navegador elimina las que ya pasaron.
        const [reservasProximas] = await db.query(
            "SELECT *, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha_local FROM reservas WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) ORDER BY (fecha < CURDATE()) ASC, fecha ASC, hora ASC LIMIT 100"
        );

        // 5. Traer la Actividad Reciente (Últimas 4 opiniones generales)
        const [actividad] = await db.query('SELECT nombre, calificacion, comentario, fecha_creacion FROM opiniones ORDER BY fecha_creacion DESC LIMIT 4');

        // Enviamos todo el paquete junto al Frontend
        res.status(200).json({
            stats: { totalReservas, reservasPendientes, totalPlatos, totalOpiniones, promedio },
            reservasProximas,
            actividad
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cargar el dashboard' });
    }
};

module.exports = { obtenerEstadisticas };