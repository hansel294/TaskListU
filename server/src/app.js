const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
require('./models/Usuario');
require('./models/Tarea');
require('./models/Recordatorio');

const usuarioRoutes = require('./routes/usuarioRoutes');
const tareaRoutes = require('./routes/tareaRoutes');
const recordatorioRoutes = require('./routes/recordatorioRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/recordatorios', recordatorioRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de TaskListU funcionando correctamente' });
});

const PORT = process.env.PORT || 4000;

// Verifica la conexión a MySQL antes de levantar el servidor
sequelize
  .authenticate()
  .then(() => {
    console.log('Conexión a MySQL establecida correctamente.');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a MySQL:', error.message);
  });
