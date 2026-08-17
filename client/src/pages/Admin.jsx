import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ConfirmModal from '../components/ConfirmModal';
import TasksPopover from '../components/TasksPopover';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [popover, setPopover] = useState(null); // { usuario, top, left } | null
  const { usuario, cerrarSesion } = useAuth();

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    const [resStats, resUsuarios, resTareas] = await Promise.all([
      api.get('/admin/estadisticas'),
      api.get('/admin/usuarios'),
      api.get('/admin/tareas'),
    ]);
    setStats(resStats.data);
    setUsuarios(resUsuarios.data);
    setTareas(resTareas.data);
  }

  async function alternarActivo(id) {
    await api.patch(`/admin/usuarios/${id}/activo`);
    cargarTodo();
  }

  async function eliminarUsuario(id) {
    await api.delete(`/admin/usuarios/${id}`);
    setUsuarioAEliminar(null);
    cargarTodo();
  }

  function alternarPopover(u, e) {
    if (popover?.usuario.id === u.id) {
      setPopover(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const anchoPopover = 300;
    const altoEstimado = 340;
    const margen = 12;

    // Por defecto, abre debajo del ícono. Si no cabe, lo abre hacia arriba.
    let top = rect.bottom + 8;
    if (top + altoEstimado > window.innerHeight - margen) {
      top = Math.max(margen, rect.top - altoEstimado - 8);
    }

    // Evita que se salga por los lados de la pantalla.
    let left = rect.right - anchoPopover;
    left = Math.min(Math.max(left, margen), window.innerWidth - anchoPopover - margen);

    setPopover({ usuario: u, top, left });
  }

  return (
    <div className="dash-page">
      <header className="dash-topbar">
        <div className="admin-topbar-left">
          <Logo />
          <span className="admin-tag">Administrador</span>
        </div>
        <div className="dash-user">
          <Link to="/dashboard" className="btn-ghost">Ir a mi dashboard</Link>
          <span>Hola, {usuario?.nombre}</span>
          <button className="icon-btn-danger" onClick={cerrarSesion} title="Cerrar sesión" aria-label="Cerrar sesión">
            🚪
          </button>
        </div>
      </header>

      <div className="dash-shell admin-shell">
        <div className="dash-header">
          <div className="dash-eyebrow">Panel de administración</div>
          <h2>Vista general del sistema</h2>
        </div>

        {stats && (
          <div className="dash-stats admin-stats">
            <div className="stat-card">
              <span className="stat-value">{stats.totalUsuarios}</span>
              <span className="stat-label">Usuarios</span>
            </div>
            <div className="stat-card completada">
              <span className="stat-value">{stats.usuariosActivos}</span>
              <span className="stat-label">Activos</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.totalTareas}</span>
              <span className="stat-label">Tareas totales</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.totalRecordatorios}</span>
              <span className="stat-label">Recordatorios</span>
            </div>
            <div className="stat-card pendiente">
              <span className="stat-value">{stats.tareasPendientes}</span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat-card en_proceso">
              <span className="stat-value">{stats.tareasEnProceso}</span>
              <span className="stat-label">En proceso</span>
            </div>
            <div className="stat-card completada">
              <span className="stat-value">{stats.tareasCompletadas}</span>
              <span className="stat-label">Completadas</span>
            </div>
          </div>
        )}

        <section className="admin-section">
          <h3>Usuarios registrados</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.correo}</td>
                    <td><span className={`role-badge ${u.rol}`}>{u.rol}</span></td>
                    <td><span className={`status-badge ${u.activo ? 'activo' : 'inactivo'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td>{u.creado_en?.slice(0, 10)}</td>
                    <td className="admin-actions">
                      <button
                        className="btn-ghost"
                        disabled={u.id === usuario.id}
                        onClick={() => alternarActivo(u.id)}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        className="task-delete"
                        disabled={u.id === usuario.id}
                        onClick={() => setUsuarioAEliminar(u)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <h3>Tareas por usuario</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Total tareas</th>
                  <th>Ver</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const tareasDeUsuario = tareas.filter((t) => t.usuario_id === u.id);
                  return (
                    <tr key={u.id}>
                      <td>{u.nombre}</td>
                      <td>{u.correo}</td>
                      <td>{tareasDeUsuario.length}</td>
                      <td>
                        <button
                          className={`icon-btn ${popover?.usuario.id === u.id ? 'active' : ''}`}
                          onClick={(e) => alternarPopover(u, e)}
                          aria-label={`Ver tareas de ${u.nombre}`}
                          disabled={tareasDeUsuario.length === 0}
                        >
                          👁
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {popover && (
        <TasksPopover
          tareas={tareas.filter((t) => t.usuario_id === popover.usuario.id)}
          top={popover.top}
          left={popover.left}
          onClose={() => setPopover(null)}
        />
      )}

      {usuarioAEliminar && (
        <ConfirmModal
          titulo="¿Eliminar este usuario?"
          mensaje={`Se eliminará a "${usuarioAEliminar.nombre}" junto con todas sus tareas y recordatorios. Esta acción no se puede deshacer.`}
          textoConfirmar="Sí, eliminar"
          onConfirmar={() => eliminarUsuario(usuarioAEliminar.id)}
          onCancelar={() => setUsuarioAEliminar(null)}
        />
      )}
    </div>
  );
}
