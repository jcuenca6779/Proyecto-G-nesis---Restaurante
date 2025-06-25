const { Sequelize } = require('sequelize');
require('dotenv').config();

// Creamos una nueva instancia de Sequelize con las credenciales del .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // Desactiva los logs de SQL en la consola para no saturar
  }
);

// Función para conectar y autenticar
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL conectado exitosamente.');
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };