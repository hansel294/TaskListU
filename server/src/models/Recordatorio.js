const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Tarea = require('./Tarea');

const Recordatorio = sequelize.define('Recordatorio', {
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  hora: { type: DataTypes.TIME, allowNull: false },
  mensaje: { type: DataTypes.STRING },
}, {
  tableName: 'recordatorios',
  timestamps: false,
});

// Una tarea tiene muchos recordatorios (composición: se borran en cascada)
Tarea.hasMany(Recordatorio, { foreignKey: 'tarea_id', onDelete: 'CASCADE' });
Recordatorio.belongsTo(Tarea, { foreignKey: 'tarea_id' });

module.exports = Recordatorio;
