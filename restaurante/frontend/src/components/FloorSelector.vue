<template>
  <div class="floor-selector-bar">
    <div class="floor-tabs">
      <div v-for="piso in pisos" :key="piso.id" class="floor-tab-item">
        <button
          :class="{ active: piso.id === pisoActivoId }"
          @click="cambiarPiso(piso.id)"
        >
          {{ piso.nombre }}
        </button>
        <!-- El botón de eliminar no aparece para el Piso 1 -->
        <button 
          v-if="piso.id !== 1"
          class="delete-floor-btn" 
          @click.stop="eliminarPiso(piso.id)"
          title="Eliminar este piso"
        >
          &times;
        </button>
      </div>
    </div>
    <button class="add-floor-btn" @click="agregarPiso">
      + Añadir Piso
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
    
    const pisos = computed(() => store.state.pisos.pisos);
    const pisoActivoId = computed(() => store.state.pisos.pisoActivoId);

    const cambiarPiso = (id) => store.dispatch('pisos/cambiarPiso', id);
    const agregarPiso = () => store.dispatch('pisos/agregarPiso');
    const eliminarPiso = (id) => store.dispatch('pisos/eliminarPiso', id);

    return {
      pisos,
      pisoActivoId,
      cambiarPiso,
      agregarPiso,
      eliminarPiso,
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
  padding: 5px 15px;
  border-bottom: 2px solid #dde4e8;
  flex-shrink: 0;
}
.floor-tabs {
  display: flex;
  gap: 5px;
}
.floor-tab-item {
  position: relative;
  display: flex;
  align-items: center;
}
.floor-tab-item button {
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
.floor-tab-item:hover button:not(.delete-floor-btn) {
  background-color: #e5e8ea;
  border-radius: 5px 5px 0 0;
}
.floor-tab-item button.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

/* === ESTILO CORREGIDO Y MÁS PEQUEÑO DEL BOTÓN ELIMINAR === */
.delete-floor-btn {
  position: absolute;
  padding-bottom: 6px;
  right: 2px;
  width: 18px; /* Más pequeño */
  height: 18px; /* Más pequeño */
  border-radius: 50%;
  background: #bdc3c7; /* Color más discreto */
  color: white;
  border: none;
  font-weight: bold;
  line-height: 16px;
  font-size: 14px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease-in-out;
  z-index: 10;
}
.floor-tab-item:hover .delete-floor-btn {
  opacity: 1;
  transform: scale(1);
}
.delete-floor-btn:hover {
  margin-top: 8px /* Rojo al pasar el mouse */
}

.add-floor-btn {
  padding: 8px 15px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
</style>
