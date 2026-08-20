import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import ReminderModal from '../components/ReminderModal';
import NotificationBell from '../components/NotificationBell';
import Logo from '../components/Logo';

export default function Dashboard() {
  const [tareas, setTareas] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [tareaAEliminar, setTareaAEliminar] = useState(null);
  const [modalRecordatorio, setModalRecordatorio] = useState(false);
  const [recordatorioEditando, setRecordatorioEditando] = useState(null);
  const [expandidas, setExpandidas] = useState(new Set());
  const { usuario, cerrarSesion } = useAuth();

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    const [resTareas, resRecordatorios] = await Promise.all([
      api.get('/tareas'),
      api.get('/recordatorios'),
    ]);
    setTareas(resTareas.data);
    setRecordatorios(resRecordatorios.data);
  }

  async function crearTarea(datos) {
    await api.post('/tareas', datos);
    setModalCrear(false);
    cargarTodo();
  }

  async function guardarEdicion(datos) {
    await api.put(`/tareas/${tareaEditando.id}`, datos);
    setTareaEditando(null);
    cargarTodo();
  }

  async function cambiarEstado(id, estado) {
    await api.patch(`/tareas/${id}/estado`, { estado });
    cargarTodo();
  }

  function pedirEliminar(tarea) {
    if (tarea.estado === 'completada') {
      eliminarTarea(tarea.id);
    } else {
      setTareaAEliminar(tarea);
    }
  }

  async function eliminarTarea(id) {
    await api.delete(`/tareas/${id}`);
    setTareaAEliminar(null);
    cargarTodo();
  }

  async function crearRecordatorio(datos) {
    await api.post('/recordatorios', datos);
    setModalRecordatorio(false);
    cargarTodo();
  }

  async function guardarEdicionRecordatorio(datos) {
    await api.put(`/recordatorios/${recordatorioEditando.id}`, datos);
    setRecordatorioEditando(null);
    cargarTodo();
  }

  async function eliminarRecordatorio(id) {
    await api.delete(`/recordatorios/${id}`);
    cargarTodo();
  }

  function alternarDetalle(id) {
    setExpandidas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const total = tareas.length;
  const conteo = {
    pendiente: tareas.filter((t) => t.estado === 'pendiente').length,
    en_proceso: tareas.filter((t) => t.estado === 'en_proceso').length,
    completada: tareas.filter((t) => t.estado === 'completada').length,
  };

  const etiquetaEstado = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    completada: 'Completada',
  };

  const hoy = new Date();
  const hoyISO = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const en1dia = new Date(hoy.getTime() + 1 * 86400000 - hoy.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  function estadoUrgencia(tarea) {
    if (tarea.estado === 'completada' || !tarea.fecha) return null;
    if (tarea.fecha < hoyISO) return 'vencida';
    if (tarea.fecha <= en1dia) return 'pronto';
    return null;
  }

  // Prioridad visual: 0 vencidas, 1 próximas a vencer, 2 activas normales, 3 completadas (siempre al final).
  // (sort de JS es estable, así que dentro de cada grupo se respeta el orden original)
  function rangoPrioridad(tarea) {
    if (tarea.estado === 'completada') return 3;
    const urgencia = estadoUrgencia(tarea);
    if (urgencia === 'vencida') return 0;
    if (urgencia === 'pronto') return 1;
    return 2;
  }
  const tareasOrdenadas = [...tareas].sort((a, b) => rangoPrioridad(a) - rangoPrioridad(b));

  // Mismo día -> ordenados por hora ascendente (8:00 antes que 9:00)
  function ordenarPorFechaYHora(lista) {
    return [...lista].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  }

  return (
    <div className="dash-page">
      <header className="dash-topbar">
        <Logo />
        <div className="dash-user">
          <NotificationBell recordatorios={recordatorios} />
          {usuario?.rol === 'admin' && (
            <Link to="/admin" className="icon-btn-crown" title="Panel admin" aria-label="Ir al panel de administrador">
              👑
            </Link>
          )}
          <span>Hola, {usuario?.nombre}</span>
          <button className="icon-btn-danger" onClick={cerrarSesion} title="Cerrar sesión" aria-label="Cerrar sesión">
            🚪
          </button>
        </div>
      </header>

      <div className="dash-shell">
        <div className="dash-header">
          <div className="dash-eyebrow">Tu progreso</div>
          <h2>Panel de tareas</h2>
        </div>

        {total > 0 && (
          <div className="dash-stats">
            <div className="stat-card">
              <span className="stat-value">{total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card completada">
              <span className="stat-value">{conteo.completada}</span>
              <span className="stat-label">Completadas</span>
            </div>
            <div className="stat-card en_proceso">
              <span className="stat-value">{conteo.en_proceso}</span>
              <span className="stat-label">En proceso</span>
            </div>
            <div className="stat-card pendiente">
              <span className="stat-value">{conteo.pendiente}</span>
              <span className="stat-label">Pendientes</span>
            </div>
          </div>
        )}

        {total > 0 && (
          <>
            <div className="progress-track">
              {conteo.completada > 0 && (
                <div className="progress-seg completada" style={{ width: `${(conteo.completada / total) * 100}%` }} />
              )}
              {conteo.en_proceso > 0 && (
                <div className="progress-seg en_proceso" style={{ width: `${(conteo.en_proceso / total) * 100}%` }} />
              )}
              {conteo.pendiente > 0 && (
                <div className="progress-seg pendiente" style={{ width: `${(conteo.pendiente / total) * 100}%` }} />
              )}
            </div>
            <div className="progress-legend">
              <span><span className="legend-dot completada" /> {conteo.completada} completadas</span>
              <span><span className="legend-dot en_proceso" /> {conteo.en_proceso} en proceso</span>
              <span><span className="legend-dot pendiente" /> {conteo.pendiente} pendientes</span>
            </div>
          </>
        )}

        <div className="action-row">
          <button className="btn-primary add-task-btn" onClick={() => setModalCrear(true)}>
            + Nueva tarea
          </button>
          <button className="btn-accent-outline add-reminder-btn" onClick={() => setModalRecordatorio(true)}>
            + Agregar recordatorio
          </button>
        </div>

        {tareas.length === 0 ? (
          <div className="empty-state">Aún no tienes tareas. Crea la primera arriba.</div>
        ) : (
          <ul className="task-grid">
            {tareasOrdenadas.map((t) => {
              const urgencia = estadoUrgencia(t);
              const recordatoriosTarea = ordenarPorFechaYHora(
                recordatorios.filter((r) => r.tarea_id === t.id)
              );
              const expandida = expandidas.has(t.id);
              const tieneDetalle = t.descripcion || t.fecha || recordatoriosTarea.length > 0;

              return (
                <li key={t.id} className={`task-tile ${t.estado} ${urgencia ? `urgencia-${urgencia}` : ''}`}>
                  <div className="task-tile-header">
                    <span className="task-tile-title">{t.titulo}</span>
                    <span className={`task-badge ${t.estado}`}>{etiquetaEstado[t.estado]}</span>
                  </div>

                  {urgencia === 'vencida' && <span className="flag-badge vencida">⚠ Vencida</span>}
                  {urgencia === 'pronto' && <span className="flag-badge pronto">⏳ Vence pronto</span>}

                  <div className="task-tile-actions">
                    <select
                      className="task-tile-select"
                      value={t.estado}
                      onChange={(e) => cambiarEstado(t.id, e.target.value)}
                      disabled={t.estado === 'completada'}
                      title={t.estado === 'completada' ? 'Una tarea completada no puede cambiar de estado' : undefined}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="completada">Completada</option>
                    </select>

                    {tieneDetalle && (
                      <button
                        className={`tile-icon-btn view ${expandida ? 'active' : ''}`}
                        onClick={() => alternarDetalle(t.id)}
                        title={expandida ? 'Ocultar detalles' : 'Ver detalles'}
                        aria-label={expandida ? 'Ocultar detalles de la tarea' : 'Ver detalles de la tarea'}
                      >
                        👁
                      </button>
                    )}
                    {t.estado !== 'completada' && (
                      <button
                        className="tile-icon-btn edit"
                        onClick={() => setTareaEditando(t)}
                        title="Editar tarea"
                        aria-label="Editar tarea"
                      >
                        ✎
                      </button>
                    )}
                    <button
                      className="tile-icon-btn delete"
                      onClick={() => pedirEliminar(t)}
                      title="Eliminar tarea"
                      aria-label="Eliminar tarea"
                    >
                      🗑
                    </button>
                  </div>

                  {expandida && (
                    <div className="task-tile-details">
                      {t.descripcion && <p className="task-desc">{t.descripcion}</p>}
                      {t.fecha && <span className="task-fecha">Vence: {t.fecha}</span>}

                      {recordatoriosTarea.length > 0 && (
                        <ul className="reminder-chip-list">
                          {recordatoriosTarea.map((r) => (
                            <li key={r.id} className="reminder-chip">
                              🔔 {r.fecha} · {r.hora?.slice(0, 5)}
                              <button
                                className="reminder-chip-edit"
                                onClick={() => setRecordatorioEditando(r)}
                                aria-label="Editar recordatorio"
                              >
                                ✎
                              </button>
                              <button onClick={() => eliminarRecordatorio(r.id)} aria-label="Eliminar recordatorio">×</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {modalCrear && (
          <TaskModal onGuardar={crearTarea} onCerrar={() => setModalCrear(false)} />
        )}

        {tareaEditando && (
          <TaskModal
            tarea={tareaEditando}
            onGuardar={guardarEdicion}
            onCerrar={() => setTareaEditando(null)}
          />
        )}

        {modalRecordatorio && (
          <ReminderModal
            tareas={tareas}
            onGuardar={crearRecordatorio}
            onCerrar={() => setModalRecordatorio(false)}
          />
        )}

        {recordatorioEditando && (
          <ReminderModal
            recordatorio={recordatorioEditando}
            onGuardar={guardarEdicionRecordatorio}
            onCerrar={() => setRecordatorioEditando(null)}
          />
        )}

        {tareaAEliminar && (
          <ConfirmModal
            titulo="¿Eliminar esta tarea?"
            mensaje={`"${tareaAEliminar.titulo}" todavía no está marcada como completada. Si la eliminas, no podrás recuperarla.`}
            textoConfirmar="Sí, eliminar"
            onConfirmar={() => eliminarTarea(tareaAEliminar.id)}
            onCancelar={() => setTareaAEliminar(null)}
          />
        )}
      </div>
    </div>
  );
}
