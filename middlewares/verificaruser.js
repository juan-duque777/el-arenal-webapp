// =============================================
// MIDDLEWARE: Verificar Usuario
// Valida email + password con bcrypt contra usuarios.json
// =============================================

const fs = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const secretHash = process.env.SALTAPP_SECRET;

// Lectura actualizada de usuarios (igual que en el SENA)
function traerUsuarios() {
    const data = fs.readFileSync(
        path.join(__dirname, '../public/data/usuarios.json'),
        'utf8'
    );
    return JSON.parse(data);
}

const verificarUser = async (req, res, next) => {
    const { email, password } = req.body;

    // Validar que vengan los dos campos
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    let usuarios = traerUsuarios();

    // Buscar el usuario por email
    const user = usuarios.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar password con bcrypt + salt secreto (mismo método del SENA)
    const hashMejorado = password + secretHash;
    const passwordValido = await bcryptjs.compare(hashMejorado, user.password);

    if (!passwordValido) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Guardamos el usuario en el request para usarlo en authRoutes
    req.user = user;
    next();
};

module.exports = verificarUser;