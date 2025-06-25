const { Piso, Mesa, Grupo, ElementoDecorativo, sequelize } = require('../models');

// Obtener todos los pisos con sus datos anidados
const getAllPisos = async (req, res) => {
  try {
    const pisos = await Piso.findAll({
      include: [
        { model: Mesa },
        { model: Grupo },
        { model: ElementoDecorativo },
      ],
      // Ordena los pisos por su ID
      order: [['id', 'ASC']]
    });
    res.status(200).json(pisos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pisos', error: error.message });
  }
};

// Crear un nuevo piso vacío
const createPiso = async (req, res) => {
    try {
        const { nombre } = req.body;
        const nuevoPiso = await Piso.create({ nombre });
        res.status(201).json(nuevoPiso);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el piso', error: error.message });
    }
};

// Actualiza el estado completo de un piso. Es la acción de "Guardar".
const updatePiso = async (req, res) => {
    const { id } = req.params;
    const { mesas, grupos, elementosDecorativos } = req.body;

    const t = await sequelize.transaction(); // Inicia una transacción

    try {
        // 1. Borra los datos antiguos del piso
        await Mesa.destroy({ where: { pisoId: id }, transaction: t });
        await Grupo.destroy({ where: { pisoId: id }, transaction: t });
        await ElementoDecorativo.destroy({ where: { pisoId: id }, transaction: t });

        // 2. Crea los nuevos datos con el estado actual
        if (mesas && mesas.length > 0) {
            const mesasConPisoId = mesas.map(m => ({ ...m, pisoId: id }));
            await Mesa.bulkCreate(mesasConPisoId, { transaction: t });
        }
        if (grupos && grupos.length > 0) {
            const gruposConPisoId = grupos.map(g => ({ ...g, pisoId: id }));
            await Grupo.bulkCreate(gruposConPisoId, { transaction: t });
        }
        if (elementosDecorativos && elementosDecorativos.length > 0) {
            const decoracionConPisoId = elementosDecorativos.map(d => ({ ...d, pisoId: id }));
            await ElementoDecorativo.bulkCreate(decoracionConPisoId, { transaction: t });
        }
        
        await t.commit(); // Si todo va bien, confirma los cambios
        res.status(200).json({ message: 'Piso actualizado correctamente' });
    } catch (error) {
        await t.rollback(); // Si algo falla, deshace todo
        res.status(500).json({ message: 'Error al actualizar el piso', error: error.message });
    }
};

// Eliminar un piso
const deletePiso = async (req, res) => {
    try {
        const { id } = req.params;
        const pisoEliminado = await Piso.destroy({
            where: { id: id }
        });
        if (!pisoEliminado) {
            return res.status(404).json({ message: 'Piso no encontrado' });
        }
        res.status(200).json({ message: 'Piso eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el piso', error: error.message });
    }
};

module.exports = {
  getAllPisos,
  createPiso,
  updatePiso,
  deletePiso
};