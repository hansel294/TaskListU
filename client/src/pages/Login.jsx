import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import TaskPreviewCard from '../components/TaskPreviewCard';

export default function Login() {
  const location = useLocation();
  const [correo, setCorreo] = useState(location.state?.correo || '');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const respuesta = await api.post('/usuarios/login', { correo, contrasena });
      iniciarSesion(respuesta.data.usuario, respuesta.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Correo o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-side">
        <div className="auth-side-content">
          <Logo onDark />
          <h2 className="auth-side-title">Tus pendientes, bajo control.</h2>
          <p className="auth-side-text">
            Vuelve a entrar y retoma justo donde lo dejaste.
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
          <h2>Inicia sesión</h2>
          <p className="auth-sub">Bienvenido de vuelta, tus tareas te están esperando.</p>

          <form onSubmit={manejarSubmit}>
            <div className="field">
              <label>Correo</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                autoFocus={!correo}
              />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                autoFocus={!!correo}
              />
            </div>

            {error && <div className="field-error" style={{ marginBottom: 12 }}>{error}</div>}

            <button type="submit" className="btn-primary" disabled={cargando}>
              {cargando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-switch">
            ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
