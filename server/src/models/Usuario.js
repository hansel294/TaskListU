const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Usuario = sequelize.define('Usuario', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  correo: { type: DataTypes.STRING, allowNull: false, unique: true },
  contrasena: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'usuarios',
  timestamps: false,
  // Por defecto, NINGUNA consulta a Usuario trae el hash de la contraseña,
  // así evitamos que quede expuesto por accidente en alguna respuesta de la API.
  // Donde sí se necesita (verificar login), se usa el scope 'conContrasena' explícitamente.
  defaultScope: {
    attributes: { exclude: ['contrasena'] },
  },
  scopes: {
    conContrasena: {
      attributes: {},
    },
  },
});

module.exports = Usuario;
