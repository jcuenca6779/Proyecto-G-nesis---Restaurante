require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./src/config/database'); // Importamos sequelize

// ... (importar rutas)

const app = express();
connectDB();

// Middlewares...
app.use(cors());
app.use(express.json());

// Rutas...
// app.use('/api/pisos', pisosRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  try {
    // Sincroniza los modelos con la base de datos.
    // {force: true} borraría y recrearía las tablas, útil en desarrollo.
    // Quítalo o ponlo en 'false' para producción.
    await sequelize.sync({ force: false }); 
    console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('Error al sincronizar los modelos:', error);
  }
});