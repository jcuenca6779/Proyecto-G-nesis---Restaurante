<template>
  <div class="floor-selector-bar">
    <div class="floor-tabs">
      <button
        v-for="piso in pisos"
        :key="piso.id"
        :class="{ active: piso.id === pisoActivoId }"
        @click="cambiarPiso(piso.id)"
      >
        {{ piso.nombre }}
      </button>
    </div>
    <button class="add-floor-btn" @click="agregarPiso">
      &#43; Añadir Piso
    </button>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'FloorSelector',
  setup() {
    const store = useStore();
    
    // Propiedades computadas para obtener los datos del store
    const pisos = computed(() => store.state.pisos.pisos);
    const pisoActivoId = computed(() => store.state.pisos.pisoActivoId);

    /**
     * Llama a la acción del store para cambiar el piso activo.
     * @param {number} id - El ID del piso al que se quiere cambiar.
     */
    const cambiarPiso = (id) => {
      store.dispatch('pisos/cambiarPiso', id);
    };

    /**
     * Llama a la acción del store para añadir un nuevo piso.
     */
    const agregarPiso = () => {
      store.dispatch('pisos/agregarPiso');
    };

    return {
      pisos,
      pisoActivoId,
      cambiarPiso,
      agregarPiso
    };
  }
};
</script>

<style scoped>
.floor-selector-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f0f3f5;
  padding: 5px 20px;
  border-bottom: 2px solid #dde4e8;
  flex-shrink: 0; /* Evita que la barra se encoja */
}

.floor-tabs {
  display: flex;
  gap: 5px;
}

.floor-tabs button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  color: #566573;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.floor-tabs button:hover {
  background-color: #e5e8ea;
  border-radius: 5px 5px 0 0;
}

.floor-tabs button.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.add-floor-btn {
  padding: 8px 15px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.add-floor-btn:hover {
  background-color: #229954;
}
</style>