import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import Logo from '../components/Logo';
import TaskPreviewCard from '../components/TaskPreviewCard';

const REGLAS = [
  { clave: 'longitud', texto: 'Mínimo 8 caracteres', test: (v) => v.length >= 8 },
  { clave: 'mayuscula', texto: 'Una letra mayúscula', test: (v) => /[A-Z]/.test(v) },
  { clave: 'minuscula', texto: 'Una letra minúscula', test: (v) => /[a-z]/.test(v) },
  { clave: 'numero', texto: 'Un número', test: (v) => /[0-9]/.test(v) },
  { clave: 'simbolo', texto: 'Un símbolo (ej. !@#$%)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

// Solo letras (con tildes/ñ) y espacios entre nombres/apellidos — sin números ni símbolos.
const NOMBRE_REGEX = /^[\p{L}\s]+$/u;

function validarNombre(valor) {
  const limpio = valor.trim();
  if (!limpio) return 'El nombre no puede estar vacío';
  if (limpio.length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (limpio.length > 60) return 'El nombre no puede superar los 60 caracteres';
  if (!NOMBRE_REGEX.test(limpio)) return 'El nombre solo puede contener letras y espacios';
  return '';
}

// Estructura general usuario@dominio.extension — no limita a .com, acepta .co, .org,
// .net, .edu.co, etc. Rechaza correos incompletos, con espacios o con doble @.
const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validarCorreo(valor) {
  const limpio = valor.trim();
  if (!limpio) return 'El correo no puede estar vacío';
  if (!CORREO_REGEX.test(limpio)) return 'Ingresa un correo con un formato válido (ej. usuario@dominio.com)';
  return '';
}

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [correo, setCorreo] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const navigate = useNavigate();

  const contrasenaValida = REGLAS.every((r) => r.test(contrasena));
  const coinciden = confirmar.length > 0 && contrasena === confirmar;

  function manejarCambioNombre(e) {
    const valor = e.target.value;
    // Deja pasar solo letras y espacios mientras escribe (bloquea números y símbolos al instante).
    const limpio = valor.replace(/[^\p{L}\s]/gu, '');
    setNombre(limpio);
    setNombreError(valor !== limpio ? 'El nombre solo puede contener letras y espacios' : '');
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    const errorNombre = validarNombre(nombre);
    if (errorNombre) {
      setError(errorNombre);
      return;
    }
    const errorCorreo = validarCorreo(correo);
    if (errorCorreo) {
      setError(errorCorreo);
      return;
    }
    if (!contrasenaValida) {
      setError('La contraseña no cumple los requisitos mínimos de seguridad');
      return;
    }
    if (!coinciden) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      await api.post('/usuarios/registro', { nombre, correo, contrasena });
      setMostrarModal(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo completar el registro');
    } finally {
      setCargando(false);
    }
  }

  function irALogin() {
    navigate('/login', { state: { correo } });
  }

  return (
    <div className="auth-page">
      <div className="auth-side">
        <div className="auth-side-content">
          <Logo onDark />
          <h2 className="auth-side-title">Empieza en menos de un minuto.</h2>
          <p className="auth-side-text">
            Crea tu cuenta, organiza tus tareas y no vuelvas a olvidar una entrega.
          </p>
          <TaskPreviewCard />
        </div>
      </div>

      <div className="auth-form-side">
        <Link to="/" className="icon-btn-home" title="Volver al inicio" aria-label="Volver al inicio">
          🏠 <span>Inicio</span>
        </Link>

        <div className="auth-card">
          <div className="auth-eyebrow">TaskListU</div>
          <h2>Crea tu cuenta</h2>
          <p className="auth-sub">Organiza tus tareas y recordatorios en un solo lugar.</p>

          <form onSubmit={manejarSubmit}>
            <div className="field">
              <label>Nombre</label>
              <input
                value={nombre}
                onChange={manejarCambioNombre}
                maxLength={60}
                placeholder="Ej. Ana Gómez"
                required
              />
              {nombreError && <div className="field-error">{nombreError}</div>}
            </div>

            <div className="field">
              <label>Correo</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  if (correoError) setCorreoError('');
                }}
                onBlur={() => setCorreoError(validarCorreo(correo))}
                placeholder="usuario@dominio.com"
                required
              />
              {correoError && <div className="field-error">{correoError}</div>}
            </div>

            <div className="field">
              <label>Contraseña</label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              <ul className="pw-rules">
                {REGLAS.map((r) => (
                  <li key={r.clave} className={r.test(contrasena) ? 'ok' : ''}>
                    <span className="dot" />
                    {r.texto}
                  </li>
                ))}
              </ul>
            </div>

            <div className="field">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
              />
              {confirmar.length > 0 && !coinciden && (
                <div className="field-error">Las contraseñas no coinciden</div>
              )}
            </div>

            {error && <div className="field-error" style={{ marginBottom: 12 }}>{error}</div>}

            <button type="submit" className="btn-primary" disabled={cargando}>
              {cargando ? 'Creando cuenta...' : 'Registrarme'}
            </button>
          </form>

          <div className="auth-switch">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </div>
        </div>
      </div>

      {mostrarModal && (
        <Modal
          titulo="¡Registro exitoso!"
          mensaje="Tu cuenta se creó correctamente. Ahora inicia sesión con tu correo y contraseña."
          textoBoton="Ir a iniciar sesión"
          onCerrar={irALogin}
        />
      )}
    </div>
  );
}
