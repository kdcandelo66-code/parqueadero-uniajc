// Crea un usuario inicial (Administrador o Guarda) con la contraseña cifrada con bcrypt.
// Uso: npm run crear-admin   |   npm run crear-guarda
const readline = require('readline/promises');
const db = require('../src/config/db');
const usuarios = require('../src/services/usuarios');

(async () => {
  const rol = process.argv[2];
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const nombre_completo = await rl.question(`Nombre completo del ${rol}: `);
    const usuario = await rl.question('Usuario: ');
    const contrasena = await rl.question('Contraseña (mínimo 8 caracteres): ');
    const u = await usuarios.crear({ nombre_completo, usuario, contrasena, rol });
    console.log(`Usuario creado: ${u.usuario} (${u.rol})`);
  } catch (e) {
    console.error('No se pudo crear el usuario:', e.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await db.end();
  }
})();
