const Usuario = require('../models/Usuario');
const Tarea = require('../models/Tarea');
const Recordatorio = require('../models/Recordatorio');

// GET /api/admin/estadisticas
async function estadisticas(req, res) {
  try {
    const [
      totalUsuarios,
      usuariosActivos,
      totalTareas,
      totalRecordatorios,
      tareasPendientes,
      tareasEnProceso,
      tareasCompletadas,
    ] = await Promise.all([
      Usuario.count(),
      Usuario.count({ where: { activo: true } }),
      Tarea.count(),
      Recordatorio.count(),
      Tarea.count({ where: { estado: 'pendiente' } }),
      Tarea.count({ where: { estado: 'en_proceso' } }),
      Tarea.count({ where: { estado: 'completada' } }),
    ]);

    res.json({
      totalUsuarios,
      usuariosActivos,
      totalTareas,
      totalRecordatorios,
      tareasPendientes,
      tareasEnProceso,
      tareasCompletadas,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
  }
}

// GET /api/admin/usuarios
async function listarUsuarios(req, res) {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'correo', 'rol', 'activo', 'creado_en'],
      order: [['id', 'ASC']],
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ mensaje: 'Error al listar usuarios' });
  }
}

// PATCH /api/admin/usuarios/:id/activo -> alterna activo/inactivo
async function cambiarActivo(req, res) {
  try {
    const { id } = req.params;

    if (Number(id) === req.usuarioId) {
      return res.status(400).json({ mensaje: 'No puedes desactivar tu propia cuenta' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    await usuario.update({ activo: !usuario.activo });
    res.json(usuario);
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
  }
}

// DELETE /api/admin/usuarios/:id
async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;

    if (Number(id) === req.usuarioId) {
      return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    await usuario.destroy(); // ON DELETE CASCADE se encarga de sus tareas y recordatorios
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el usuario' });
  }
}

// GET /api/admin/tareas -> de TODOS los usuarios (solo lectura)
async function listarTareas(req, res) {
  try {
    const tareas = await Tarea.findAll({
      include: { model: Usuario, attributes: ['nombre', 'correo'] },
      order: [['id', 'DESC']],
    });
    res.json(tareas);
  } catch (error) {
    console.error('Error al listar tareas:', error);
    res.status(500).json({ mensaje: 'Error al listar tareas' });
  }
}

module.exports = { estadisticas, listarUsuarios, cambiarActivo, eliminarUsuario, listarTareas };
