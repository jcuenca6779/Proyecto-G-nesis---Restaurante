const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grupo = sequelize.define('Grupo', {
  // El ID se crea automáticamente
  capacidadTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  x: { type: DataTypes.INTEGER, allowNull: false },
  y: { type: DataTypes.INTEGER, allowNull: false },
  anchoCuadriculas: DataTypes.INTEGER,
  altoCuadriculas: DataTypes.INTEGER,
  pedidoId: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: false,
});

module.exports = Grupo;