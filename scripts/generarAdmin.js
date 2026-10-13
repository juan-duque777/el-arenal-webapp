// =============================================
// SCRIPT: Generar Admin
// Ejecutar UNA SOLA VEZ: node scripts/generarAdmin.js
// Crea el archivo data/usuarios.json con la
// contraseña hasheada usando bcrypt + salt secreto
// =============================================

const bcryptjs = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function generarAdmin() {
    const secretHash = process.env.SALTAPP_SECRET;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!secretHash || !adminEmail || !adminPassword) {
        console.error('❌ Configura SALTAPP_SECRET, ADMIN_EMAIL y ADMIN_PASSWORD en el entorno');
        process.exit(1);
    }

    // Mismo método que en el proyecto SENA: password + salt secreto
    const passwordMejorado = adminPassword + secretHash;
    const hash = await bcryptjs.hash(passwordMejorado, 12);

    const usuarios = [
        {
            email: adminEmail,
            password: hash,
            rol: 'administrador'
        }
    ];

    const outputPath = path.join(__dirname, '../data/usuarios.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(usuarios, null, 2));

    console.log('✅ usuarios.json generado exitosamente');
    console.log(`📧 Email:      ${adminEmail}`);
    console.log(`📁 Guardado en: ${outputPath}`);
}

generarAdmin();