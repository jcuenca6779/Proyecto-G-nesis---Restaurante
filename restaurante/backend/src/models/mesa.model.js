const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Mesa = sequelize.define('Mesa', {
  // ID se crea automáticamente
  numero: { // Usamos 'numero' en lugar de 'id' para evitar conflictos
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  forma: DataTypes.STRING,
  anchoCuadriculas: DataTypes.INTEGER,
  altoCuadriculas: DataTypes.INTEGER,
  x: { type: DataTypes.INTEGER, allowNull: false },
  y: { type: DataTypes.INTEGER, allowNull: false },
  pedidoId: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: false,
});

module.exports = Mesa;