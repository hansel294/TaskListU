const Recordatorio = require('../models/Recordatorio');
const Tarea = require('../models/Tarea');

function fechaEsValida(fecha) {
  const hoy = new Date().toISOString().split('T')[0];
  return fecha >= hoy;
}

// Si el recordatorio es para hoy, la hora no puede ya haber pasado.
function horaEsValida(fecha, hora) {
  const ahora = new Date();
  const hoy = ahora.toISOString().split('T')[0];
  if (fecha !== hoy) return true;
  const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  return hora >= horaActual;
}

// GET /api/recordatorios -> de todas las tareas del usuario logueado
async function listar(req, res) {
  try {
    const recordatorios = await Recordatorio.findAll({
      include: { model: Tarea, where: { usuario_id: req.usuarioId }, attributes: ['titulo'] },
    });
    res.json(recordatorios);
  } catch (error) {
    console.error('Error al listar recordatorios:', error);
    res.status(500).json({ mensaje: 'Error al listar recordatorios' });
  }
}

// POST /api/recordatorios
async function crear(req, res) {
  try {
    const { fecha, hora, mensaje, tarea_id } = req.body;
    if (!fecha || !hora || !tarea_id) {
      return res.status(400).json({ mensaje: 'fecha, hora y tarea_id son obligatorios' });
    }
    if (!fechaEsValida(fecha)) {
      return res.status(400).json({ mensaje: 'La fecha del recordatorio no puede ser anterior a hoy' });
    }
    if (!horaEsValida(fecha, hora)) {
      return res.status(400).json({ mensaje: 'La hora ya pasó para el día de hoy' });
    }

    const tarea = await Tarea.findOne({ where: { id: tarea_id, usuario_id: req.usuarioId } });
    if (!tarea) return res.status(404).json({ mensaje: 'La tarea asociada no existe' });

    const recordatorio = await Recordatorio.create({ fecha, hora, mensaje, tarea_id });
    res.status(201).json(recordatorio);
  } catch (error) {
    console.error('Error al crear recordatorio:', error);
    res.status(500).json({ mensaje: 'Error al crear recordatorio' });
  }
}

// PUT /api/recordatorios/:id
async function editar(req, res) {
  try {
    const { id } = req.params;
    const recordatorio = await Recordatorio.findByPk(id);
    if (!recordatorio) return res.status(404).json({ mensaje: 'Recordatorio no encontrado' });

    const { fecha, hora, mensaje } = req.body;
    if (!fechaEsValida(fecha)) {
      return res.status(400).json({ mensaje: 'La fecha del recordatorio no puede ser anterior a hoy' });
    }
    if (!horaEsValida(fecha, hora)) {
      return res.status(400).json({ mensaje: 'La hora ya pasó para el día de hoy' });
    }
    await recordatorio.update({ fecha, hora, mensaje });
    res.json(recordatorio);
  } catch (error) {
    console.error('Error al editar recordatorio:', error);
    res.status(500).json({ mensaje: 'Error al editar recordatorio' });
  }
}

// DELETE /api/recordatorios/:id
async function eliminar(req, res) {
  try {
    const { id } = req.params;
    const recordatorio = await Recordatorio.findByPk(id);
    if (!recordatorio) return res.status(404).json({ mensaje: 'Recordatorio no encontrado' });

    await recordatorio.destroy();
    res.json({ mensaje: 'Recordatorio eliminado' });
  } catch (error) {
    console.error('Error al eliminar recordatorio:', error);
    res.status(500).json({ mensaje: 'Error al eliminar recordatorio' });
  }
}

module.exports = { listar, crear, editar, eliminar };
