const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const db = require('./database/db.js');

global._baseDir = __dirname;

const fs = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs');

const usuariosPath = path.join(__dirname, 'data', 'usuarios.json');

async function asegurarUsuarios() {
    if (fs.existsSync(usuariosPath)) return;

    const saltSecret = process.env.SALTAPP_SECRET;
    const adminPass  = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!saltSecret || !adminPass || !adminEmail) {
        throw new Error('Faltan SALTAPP_SECRET, ADMIN_PASSWORD o ADMIN_EMAIL para crear data/usuarios.json');
    }

    const hash = await bcryptjs.hash(adminPass + saltSecret, 12);
    const usuarios = [{ email: adminEmail, password: hash, rol: 'administrador' }];
    fs.mkdirSync(path.dirname(usuariosPath), { recursive: true });
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
    console.log('✅ data/usuarios.json generado automáticamente');
}

const app = express();

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

// recursos estáticos (CSS, JS, Imágenes)
app.use(express.static('public')); 

// ── RUTAS ─────────────────────────────────────────────────────
 
// 1. Autenticación (login / logout)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
 
// 2. Vistas (rutas HTML — las admin ya llevan validartoken adentro)
const vistasRoutes = require('./routes/vistasRoutes');
app.use('/', vistasRoutes);
 
// 3. API Platos
const platosRoutes = require('./routes/platosRoutes');
app.use('/api/platos', platosRoutes);
 
// 4. API Reservas
const reservasRoutes = require('./routes/reservasRoutes');
app.use('/api/reservas', reservasRoutes);
 
// 5. API Opiniones
const opinionesRoutes = require('./routes/opinionesRoutes');
app.use('/api/opiniones', opinionesRoutes);
 
// 6. API Dashboard
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);
 
// ── SERVIDOR ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

asegurarUsuarios()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('❌ No se pudo preparar el usuario administrador:', error.message);
        process.exitCode = 1;
    });