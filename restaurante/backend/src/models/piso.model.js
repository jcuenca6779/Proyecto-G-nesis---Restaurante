const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Piso = sequelize.define('Piso', {
  // El ID se crea automáticamente por Sequelize
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Piso;