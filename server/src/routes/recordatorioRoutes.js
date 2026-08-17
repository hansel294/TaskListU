const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const { listar, crear, editar, eliminar } = require('../controllers/recordatorioController');

router.use(verificarToken);

router.get('/', listar);
router.post('/', crear);
router.put('/:id', editar);
router.delete('/:id', eliminar);

module.exports = router;
