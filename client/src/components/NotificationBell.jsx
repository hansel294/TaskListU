import { useEffect, useRef, useState } from 'react';

export default function NotificationBell({ recordatorios }) {
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 300 });
  const wrapRef = useRef(null);
  const btnRef = useRef(null);

  const hoy = new Date();
  const hoyISO = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  const activos = recordatorios
    .filter((r) => r.fecha <= hoyISO)
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  useEffect(() => {
    function manejarClickFuera(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  // Recalcula la posición cada vez que se abre (y si la ventana cambia de tamaño
  // mientras está abierta), para que siempre quede dentro de la pantalla sin
  // importar dónde esté el ícono de la campana en ese momento.
  useEffect(() => {
    if (!abierto) return;

    function calcularPosicion() {
      const rect = btnRef.current.getBoundingClientRect();
      const margen = 12;
      const ancho = Math.min(300, window.innerWidth - margen * 2);

      let left = rect.right - ancho;
      left = Math.min(Math.max(left, margen), window.innerWidth - ancho - margen);

      setPos({ top: rect.bottom + 8, left, width: ancho });
    }

    calcularPosicion();
    window.addEventListener('resize', calcularPosicion);
    return () => window.removeEventListener('resize', calcularPosicion);
  }, [abierto]);

  return (
    <div className="bell-wrap" ref={wrapRef}>
      <button
        ref={btnRef}
        className="bell-btn"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Notificaciones"
      >
        🔔
        {activos.length > 0 && <span className="bell-badge">{activos.length}</span>}
      </button>

      {abierto && (
        <div className="bell-dropdown" style={{ top: pos.top, left: pos.left, width: pos.width }}>
          <div className="bell-dropdown-title">Recordatorios</div>
          {activos.length === 0 ? (
            <p className="bell-empty">No tienes recordatorios pendientes de hoy o vencidos.</p>
          ) : (
            <ul className="bell-list">
              {activos.map((r) => (
                <li key={r.id} className={r.fecha < hoyISO ? 'bell-item vencido' : 'bell-item'}>
                  <span className="bell-item-tag">{r.fecha < hoyISO ? 'Vencido' : 'Hoy'}</span>
                  <div>
                    <strong>{r.Tarea?.titulo || 'Tarea'}</strong>
                    <p>{r.mensaje || 'Sin mensaje'} · {r.hora?.slice(0, 5)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
