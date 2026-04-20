// =============================================
// MIDDLEWARE: Validar Token JWT
// Protege las rutas del panel admin
// =============================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.SECRETJWT;

function validarToken(req, res, next) {
    // Capturamos el token desde la cookie httpOnly
    const token = req.cookies.token;

    if (!token) {
        // Si no hay token, redirige al login
        return res.redirect('/login');
    }

    jwt.verify(token, secret, (error, datos) => {
        if (error) {
            console.log('⚠️  Token inválido o expirado');
            // Limpiamos la cookie corrupta y mandamos al login
            res.clearCookie('token');
            return res.redirect('/login');
        }
        // Todo bien, guardamos los datos del usuario en el request
        req.usuario = datos;
        next();
    });
}

module.exports = validarToken;