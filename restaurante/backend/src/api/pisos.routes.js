const express = require('express');
const router = express.Router();
const pisosController = require('../controllers/pisos.controller');

// GET /api/pisos -> Obtener todos los pisos
router.get('/', pisosController.getAllPisos);

// POST /api/pisos -> Crear un nuevo piso
router.post('/', pisosController.createPiso);

// PUT /api/pisos/:id -> Actualizar un piso existente (Guardar estado)
router.put('/:id', pisosController.updatePiso);

// DELETE /api/pisos/:id -> Eliminar un piso
router.delete('/:id', pisosController.deletePiso);

module.exports = router;
