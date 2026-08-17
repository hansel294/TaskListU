const ESTADOS_DEMO = [
  { titulo: 'Pagar la factura de internet', estado: 'completada' },
  { titulo: 'Comprar mercado de la semana', estado: 'en_proceso' },
  { titulo: 'Sacar cita con el dentista', estado: 'pendiente' },
];

export default function TaskPreviewCard() {
  return (
    <div className="mock-window" aria-hidden="true">
      <div className="mock-window-bar">
        <span /><span /><span />
      </div>
      <div className="mock-progress-track">
        <div className="progress-seg completada" style={{ width: '33%' }} />
        <div className="progress-seg en_proceso" style={{ width: '33%' }} />
        <div className="progress-seg pendiente" style={{ width: '34%' }} />
      </div>
      <ul className="mock-task-list">
        {ESTADOS_DEMO.map((t, i) => (
          <li key={i} className={`mock-task ${t.estado}`} style={{ animationDelay: `${i * 0.15}s` }}>
            <span className="mock-task-dot" />
            <span className={t.estado === 'completada' ? 'mock-task-done' : ''}>{t.titulo}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
