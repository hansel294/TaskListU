const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./Usuario');

const Tarea = sequelize.define('Tarea', {
  titulo: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_proceso', 'completada'),
    defaultValue: 'pendiente',
  },
  fecha: { type: DataTypes.DATEONLY },
}, {
  tableName: 'tareas',
  timestamps: false,
});

// Un usuario tiene muchas tareas
Usuario.hasMany(Tarea, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
Tarea.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = Tarea;
