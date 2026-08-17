const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');
const {
  estadisticas,
  listarUsuarios,
  cambiarActivo,
  eliminarUsuario,
  listarTareas,
} = require('../controllers/adminController');

router.use(verificarToken, verificarAdmin);

router.get('/estadisticas', estadisticas);
router.get('/usuarios', listarUsuarios);
router.patch('/usuarios/:id/activo', cambiarActivo);
router.delete('/usuarios/:id', eliminarUsuario);
router.get('/tareas', listarTareas);

module.exports = router;
