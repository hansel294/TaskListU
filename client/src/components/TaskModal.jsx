import { useState } from 'react';

export default function TaskModal({ tarea, onGuardar, onCerrar }) {
  const esEdicion = !!tarea;
  const [titulo, setTitulo] = useState(tarea?.titulo || '');
  const [descripcion, setDescripcion] = useState(tarea?.descripcion || '');
  const [fecha, setFecha] = useState(tarea?.fecha || '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Fecha de hoy en formato YYYY-MM-DD, usando la zona horaria local (no UTC)
  // para que "hoy" en el input coincida con el día real del usuario.
  const hoy = new Date();
  const hoyISO = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    if (!titulo.trim()) return;

    if (fecha && fecha < hoyISO) {
      setError('La fecha límite no puede ser anterior a hoy');
      return;
    }

    setGuardando(true);
    await onGuardar({ titulo, descripcion, fecha: fecha || null });
    setGuardando(false);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-box modal-box-form">
        <h3>{esEdicion ? 'Editar tarea' : 'Nueva tarea'}</h3>
        <p className="modal-form-sub">
          {esEdicion ? 'Actualiza los detalles de tu tarea.' : 'Dale contexto a tu tarea para no olvidar nada.'}
        </p>

        <form onSubmit={manejarSubmit}>
          <div className="field">
            <label>Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required autoFocus />
          </div>

          <div className="field">
            <label>Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Detalles, contexto o pasos a seguir..."
            />
          </div>

          <div className="field">
            <label>Fecha límite (opcional)</label>
            <input
              type="date"
              value={fecha || ''}
              min={hoyISO}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          {error && <div className="field-error" style={{ marginBottom: 12 }}>{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
