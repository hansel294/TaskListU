import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import TaskPreviewCard from '../components/TaskPreviewCard';

const CARACTERISTICAS = [
  {
    titulo: 'Organiza',
    texto: 'Crea tareas con descripción y fecha límite. Nada se queda solo en tu cabeza.',
  },
  {
    titulo: 'Recuerda',
    texto: 'Programa recordatorios para cada tarea y entérate antes de que sea tarde.',
  },
  {
    titulo: 'Cumple',
    texto: 'Mueve cada tarea de pendiente a completada y mira tu progreso en tiempo real.',
  },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <div className="landing-nav-actions">
          <Link to="/login" className="btn-ghost">Iniciar sesión</Link>
          <Link to="/registro" className="btn-primary landing-nav-cta">Crear cuenta</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="auth-eyebrow">Gestión de tareas y recordatorios</div>
          <h1>Deja de confiar tus pendientes a la memoria.</h1>
          <p className="landing-sub">
            TaskListU organiza tus tareas, te avisa antes de la fecha límite y te muestra
            de un vistazo qué te falta por terminar.
          </p>
          <div className="landing-cta-row">
            <Link to="/registro" className="btn-primary landing-cta-btn">Empezar gratis</Link>
            <Link to="/login" className="btn-ghost landing-cta-btn">Ya tengo cuenta</Link>
          </div>
        </div>

        <div className="landing-hero-visual" aria-hidden="true">
          <TaskPreviewCard />
        </div>
      </section>

      <section className="landing-features">
        {CARACTERISTICAS.map((c) => (
          <div className="landing-feature-card" key={c.titulo}>
            <h3>{c.titulo}</h3>
            <p>{c.texto}</p>
          </div>
        ))}
      </section>

      <footer className="landing-footer">
        <p>© Copyright 2026 — TaskListU</p>
      </footer>
    </div>
  );
}
