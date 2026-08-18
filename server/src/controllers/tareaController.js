const Tarea = require('../models/Tarea');

// Railway ejecuta el servidor en UTC, pero los usuarios están en Colombia (UTC-5).
// Sin este ajuste, "hoy" del servidor puede no coincidir con "hoy" del usuario.
function obtenerFechaHoyColombia() {
  const OFFSET_COLOMBIA_HORAS = 5;
  return new Date(Date.now() - OFFSET_COLOMBIA_HORAS * 60 * 60 * 1000).toISOString().split('T')[0];
}

// La fecha límite no puede ser anterior al día de hoy.
function fechaEsValida(fecha) {
  if (!fecha) return true; // la fecha es opcional
  const hoy = obtenerFechaHoyColombia();
  return fecha >= hoy;
}

// GET /api/tareas -> solo las del usuario logueado
async function listar(req, res) {
  try {
    const tareas = await Tarea.findAll({ where: { usuario_id: req.usuarioId } });
    res.json(tareas);
  } catch (error) {
    console.error('Error al listar tareas:', error);
    res.status(500).json({ mensaje: 'Error al listar tareas' });
  }
}

// POST /api/tareas
async function crear(req, res) {
  try {
    const { titulo, descripcion, fecha } = req.body;
    if (!titulo) {
      return res.status(400).json({ mensaje: 'El título es obligatorio' });
    }
    if (!fechaEsValida(fecha)) {
      return res.status(400).json({ mensaje: 'La fecha límite no puede ser anterior a hoy' });
    }
    const tarea = await Tarea.create({
      titulo,
      descripcion,
      fecha,
      usuario_id: req.usuarioId,
    });
    res.status(201).json(tarea);
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ mensaje: 'Error al crear tarea' });
  }
}

// PUT /api/tareas/:id
async function editar(req, res) {
  try {
    const { id } = req.params;
    const tarea = await Tarea.findOne({ where: { id, usuario_id: req.usuarioId } });
    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada' });

    const { titulo, descripcion, fecha } = req.body;
    if (!fechaEsValida(fecha)) {
      return res.status(400).json({ mensaje: 'La fecha límite no puede ser anterior a hoy' });
    }
    await tarea.update({ titulo, descripcion, fecha });
    res.json(tarea);
  } catch (error) {
    console.error('Error al editar tarea:', error);
    res.status(500).json({ mensaje: 'Error al editar tarea' });
  }
}

// DELETE /api/tareas/:id
async function eliminar(req, res) {
  try {
    const { id } = req.params;
    const tarea = await Tarea.findOne({ where: { id, usuario_id: req.usuarioId } });
    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada' });

    await tarea.destroy();
    res.json({ mensaje: 'Tarea eliminada' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ mensaje: 'Error al eliminar tarea' });
  }
}

// PATCH /api/tareas/:id/estado
async function cambiarEstado(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body; // 'pendiente' | 'en_proceso' | 'completada'

    const tarea = await Tarea.findOne({ where: { id, usuario_id: req.usuarioId } });
    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada' });

    await tarea.update({ estado });
    res.json(tarea);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ mensaje: 'Error al cambiar estado' });
  }
}

module.exports = { listar, crear, editar, eliminar, cambiarEstado };
