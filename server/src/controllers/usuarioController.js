const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
require('dotenv').config();

// Estándar mínimo de seguridad para contraseñas (alineado con recomendaciones actuales tipo OWASP/NIST):
// longitud mínima + variedad de caracteres, en vez de solo exigir longitud.
function validarContrasena(contrasena) {
  const reglas = [
    { ok: contrasena.length >= 8, mensaje: 'mínimo 8 caracteres' },
    { ok: /[A-Z]/.test(contrasena), mensaje: 'una letra mayúscula' },
    { ok: /[a-z]/.test(contrasena), mensaje: 'una letra minúscula' },
    { ok: /[0-9]/.test(contrasena), mensaje: 'un número' },
    { ok: /[^A-Za-z0-9]/.test(contrasena), mensaje: 'un símbolo' },
  ];
  const faltantes = reglas.filter((r) => !r.ok).map((r) => r.mensaje);
  return { esValida: faltantes.length === 0, faltantes };
}

// Solo letras (incluye tildes/ñ) y espacios entre palabras — bloquea números y símbolos.
function validarNombre(nombre) {
  if (typeof nombre !== 'string') {
    return { esValido: false, mensaje: 'El nombre no es válido' };
  }
  const limpio = nombre.trim().replace(/\s+/g, ' ');

  if (!limpio) {
    return { esValido: false, mensaje: 'El nombre no puede estar vacío' };
  }
  if (limpio.length < 2) {
    return { esValido: false, mensaje: 'El nombre debe tener al menos 2 caracteres' };
  }
  if (limpio.length > 60) {
    return { esValido: false, mensaje: 'El nombre no puede superar los 60 caracteres' };
  }
  if (!/^[\p{L}\s]+$/u.test(limpio)) {
    return { esValido: false, mensaje: 'El nombre solo puede contener letras y espacios (sin números ni símbolos)' };
  }
  return { esValido: true, limpio };
}

// POST /api/usuarios/registro
async function registrar(req, res) {
  try {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const nombreValidado = validarNombre(nombre);
    if (!nombreValidado.esValido) {
      return res.status(400).json({ mensaje: nombreValidado.mensaje });
    }

    const { esValida, faltantes } = validarContrasena(contrasena);
    if (!esValida) {
      return res.status(400).json({
        mensaje: `La contraseña debe tener: ${faltantes.join(', ')}`,
      });
    }

    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(409).json({ mensaje: 'Ese correo ya está registrado' });
    }

    const contrasenaHasheada = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await Usuario.create({
      nombre: nombreValidado.limpio,
      correo,
      contrasena: contrasenaHasheada,
    });

    res.status(201).json({
      mensaje: 'Usuario registrado con éxito',
      usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, correo: nuevoUsuario.correo },
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
}

// POST /api/usuarios/login
async function login(req, res) {
  try {
    const { correo, contrasena } = req.body;

    // MySQL usa una colación case-insensitive por defecto, así que esta consulta
    // encontraría al usuario aunque el correo venga con mayúsculas distintas.
    // Por eso comparamos el resultado de forma exacta (===) antes de continuar.
    // Aquí sí necesitamos el hash para poder compararlo con bcrypt.
    const usuario = await Usuario.scope('conContrasena').findOne({ where: { correo } });
    if (!usuario || usuario.correo !== correo) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!coincide) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Tu cuenta ha sido desactivada. Contacta al administrador.' });
    }

    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    res.json({
      mensaje: 'Sesión iniciada',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
}

module.exports = { registrar, login };
