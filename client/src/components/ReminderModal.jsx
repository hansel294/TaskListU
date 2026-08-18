import { useState } from 'react';

export default function ReminderModal({ tareas, recordatorio, onGuardar, onCerrar }) {
  const esEdicion = !!recordatorio;

  const [tareaId, setTareaId] = useState(recordatorio?.tarea_id || tareas?.[0]?.id || '');
  const [fecha, setFecha] = useState(recordatorio?.fecha || '');
  const [hora, setHora] = useState(recordatorio?.hora?.slice(0, 5) || '');
  const [mensaje, setMensaje] = useState(recordatorio?.mensaje || '');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const hoy = new Date();
  const hoyISO = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  // Hora actual en formato HH:MM, para bloquear horas pasadas solo si la fecha elegida es HOY.
  const horaActual = `${String(hoy.getHours()).padStart(2, '0')}:${String(hoy.getMinutes()).padStart(2, '0')}`;
  const esHoy = fecha === hoyISO;
  const horaMinima = esHoy ? horaActual : undefined;

  const tituloTareaEdicion = recordatorio?.Tarea?.titulo;

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (!esEdicion && !tareaId) {
      setError('Selecciona a qué tarea pertenece este recordatorio');
      return;
    }
    if (!fecha || !hora) {
      setError('La fecha y la hora son obligatorias');
      return;
    }
    if (fecha < hoyISO) {
      setError('La fecha del recordatorio no puede ser anterior a hoy');
      return;
    }
    if (fecha === hoyISO && hora < horaActual) {
      setError('La hora ya pasó. Elige una hora más adelante o cambia la fecha.');
      return;
    }

    setGuardando(true);
    try {
      await onGuardar(esEdicion ? { fecha, hora, mensaje } : { fecha, hora, mensaje, tarea_id: tareaId });
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar el recordatorio. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-box modal-box-form">
        <h3>{esEdicion ? 'Editar recordatorio' : 'Nuevo recordatorio'}</h3>

        <form onSubmit={manejarSubmit}>
          {esEdicion ? (
            <p className="modal-form-sub">Para la tarea: <strong>{tituloTareaEdicion}</strong></p>
          ) : (
            <div className="field">
              <label>Tarea</label>
              <select value={tareaId} onChange={(e) => setTareaId(e.target.value)} required>
                {tareas.length === 0 && <option value="">No tienes tareas todavía</option>}
                {tareas.map((t) => (
                  <option key={t.id} value={t.id}>{t.titulo}</option>
                ))}
              </select>
            </div>
          )}

          <div className="field-row">
            <div className="field">
              <label>Fecha</label>
              <input type="date" value={fecha} min={hoyISO} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div className="field">
              <label>Hora</label>
              <input
                type="time"
                value={hora}
                min={horaMinima}
                onChange={(e) => setHora(e.target.value)}
                required
              />
              {esHoy && <span className="field-hint">Hoy solo puedes elegir horas desde las {horaActual}</span>}
            </div>
          </div>

          <div className="field">
            <label>Mensaje (opcional)</label>
            <input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Ej. No olvides subir el archivo final"
            />
          </div>

          {error && <div className="field-error" style={{ marginBottom: 12 }}>{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={guardando || (!esEdicion && tareas.length === 0)}>
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear recordatorio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
