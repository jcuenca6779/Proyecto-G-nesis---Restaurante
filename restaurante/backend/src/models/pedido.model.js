const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  // El ID se crea automáticamente por Sequelize
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // La información de los items del pedido la guardaremos como un JSON
  // Esto nos da flexibilidad sin necesidad de crear más tablas para los items
  items: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  // Estado del pedido, ej: 'activo', 'pagado'
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'activo'
  }
}, {
  timestamps: true, // createdAt y updatedAt
});

module.exports = Pedido;