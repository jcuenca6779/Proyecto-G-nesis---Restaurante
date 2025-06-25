const { sequelize } = require('../config/database');
const Piso = require('./piso.model');
const Mesa = require('./mesa.model');
const Grupo = require('./grupo.model');
const ElementoDecorativo = require('./elementoDecorativo.model');
const Pedido = require('./pedido.model');

// --- DEFINICIÓN DE ASOCIACIONES ---

// Un Piso puede tener muchas Mesas, Grupos y Elementos Decorativos
Piso.hasMany(Mesa, { foreignKey: 'pisoId', onDelete: 'CASCADE' });
Mesa.belongsTo(Piso, { foreignKey: 'pisoId' });

Piso.hasMany(Grupo, { foreignKey: 'pisoId', onDelete: 'CASCADE' });
Grupo.belongsTo(Piso, { foreignKey: 'pisoId' });

Piso.hasMany(ElementoDecorativo, { foreignKey: 'pisoId', onDelete: 'CASCADE' });
ElementoDecorativo.belongsTo(Piso, { foreignKey: 'pisoId' });

// Un Grupo está compuesto por muchas Mesas
// Esta es una relación conceptual que manejaremos a nivel de la lógica,
// no necesariamente con una foreign key directa si las mesas se eliminan al agruparse.

// Un Pedido puede estar asociado a UNA Mesa
Mesa.hasOne(Pedido, { foreignKey: 'mesaId', allowNull: true });
Pedido.belongsTo(Mesa, { foreignKey: 'mesaId' });

// Un Pedido puede estar asociado a UN Grupo
Grupo.hasOne(Pedido, { foreignKey: 'grupoId', allowNull: true });
Pedido.belongsTo(Grupo, { foreignKey: 'grupoId' });


const db = {
  sequelize,
  Piso,
  Mesa,
  Grupo,
  ElementoDecorativo,
  Pedido,
};

module.exports = db;