import { useEffect, useRef } from 'react';

const ETIQUETA_ESTADO = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completada: 'Completada',
};

export default function TasksPopover({ tareas, top, left, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function manejarClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, [onClose]);

  return (
    <div className="tasks-popover" style={{ top, left }} ref={ref}>
      <div className="tasks-popover-arrow" />

      {tareas.length === 0 ? (
        <p className="bell-empty">Este usuario no tiene tareas creadas.</p>
      ) : (
        <ul className="tasks-popover-list">
          {tareas.map((t) => (
            <li key={t.id}>
              <span className={`task-badge ${t.estado}`}>{ETIQUETA_ESTADO[t.estado]}</span>
              <div>
                <strong>{t.titulo}</strong>
                {t.fecha && <p>Vence: {t.fecha}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
