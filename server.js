const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./database/db.js');

const app = express();

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// 1. Entregamos los recursos estáticos (CSS, JS, Imágenes)
app.use(express.static('public')); 

// 2. NUESTRO ENRUTADOR DE VISTAS (URLs Limpias)
const vistasRoutes = require('./routes/vistasRoutes');
app.use('/', vistasRoutes);

// 3. RUTAS DE LA API (La cocina)
const platosRoutes = require('./routes/platosRoutes');
app.use('/api/platos', platosRoutes);

// 4. RUTAS PARA RESERVAS
const reservasRoutes = require('./routes/reservasRoutes');
app.use('/api/reservas', reservasRoutes);

const opinionesRoutes = require('./routes/opinionesRoutes');
app.use('/api/opiniones', opinionesRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Servidor corriendo en el puerto http://localhost:${PORT}`);
});