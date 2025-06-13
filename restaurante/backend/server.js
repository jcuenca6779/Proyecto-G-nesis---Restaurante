const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Datos iniciales en memoria
let mesas = [
  { id: 1, estado: 'disponible', capacidad: 4 },
  { id: 2, estado: 'disponible', capacidad: 4 },
  { id: 3, estado: 'disponible', capacidad: 4 },
  { id: 4, estado: 'disponible', capacidad: 6 },
  { id: 5, estado: 'disponible', capacidad: 2 },
  { id: 6, estado: 'disponible', capacidad: 4 },
  { id: 7, estado: 'disponible', capacidad: 8 },
  { id: 8, estado: 'disponible', capacidad: 4 },
  { id: 9, estado: 'disponible', capacidad: 10 }
];
let grupos = [];

// Endpoints
app.get('/api/mesas', (req, res) => {
  res.json({ mesas, grupos });
});

app.post('/api/mesas/estado', (req, res) => {
  const { mesaId, nuevoEstado } = req.body;
  const mesa = mesas.find(m => m.id === mesaId);
  
  if (!mesa) return res.status(404).send('Mesa no encontrada');
  
  // Validación especial
  if (mesa.estado === 'ocupada' && nuevoEstado === 'reservada') {
    return res.status(400).send('Mesa ocupada no puede ser reservada');
  }
  
  mesa.estado = nuevoEstado;
  res.json(mesa);
});

app.post('/api/mesas/unir', (req, res) => {
  const { mesasIds } = req.body;
  
  if (mesasIds.length < 2) {
    return res.status(400).send('Seleccione al menos 2 mesas');
  }
  
  // Crear grupo
  const grupoId = Date.now();
  const mesasGrupo = [];
  let capacidadTotal = 0;
  
  mesasIds.forEach(id => {
    const mesa = mesas.find(m => m.id === id);
    if (mesa && mesa.estado === 'disponible') {
      mesasGrupo.push({
        id: mesa.id,
        capacidad: mesa.capacidad
      });
      capacidadTotal += mesa.capacidad;
    }
  });
  
  if (mesasGrupo.length < 2) {
    return res.status(400).send('Mesas no disponibles para unión');
  }
  
  // Crear grupo
  grupos.push({
    id: grupoId,
    mesas: mesasGrupo,
    capacidadTotal,
    estado: 'ocupada'
  });
  
  // Eliminar mesas individuales
  mesas = mesas.filter(m => !mesasIds.includes(m.id));
  
  res.json({ grupos, mesas });
});

app.post('/api/grupos/separar', (req, res) => {
  const { grupoId } = req.body;
  const grupoIndex = grupos.findIndex(g => g.id === grupoId);
  
  if (grupoIndex === -1) {
    return res.status(404).send('Grupo no encontrado');
  }
  
  const grupo = grupos[grupoIndex];
  
  // Restaurar mesas individuales
  grupo.mesas.forEach(mesaData => {
    mesas.push({
      id: mesaData.id,
      estado: 'disponible',
      capacidad: mesaData.capacidad
    });
  });
  
  // Eliminar grupo
  grupos.splice(grupoIndex, 1);
  
  res.json({ grupos, mesas });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});