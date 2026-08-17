const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const { listar, crear, editar, eliminar, cambiarEstado } = require('../controllers/tareaController');

router.use(verificarToken); // todas las rutas de tareas requieren sesión iniciada

router.get('/', listar);
router.post('/', crear);
router.put('/:id', editar);
router.delete('/:id', eliminar);
router.patch('/:id/estado', cambiarEstado);

module.exports = router;
