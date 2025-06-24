<template>
  <div class="controls-panel">
    <div class="panel-header">
      <h2>Controles</h2>
      <button class="help-button" @click="toggleInstructions">
        ?
      </button>
    </div>

    <div class="controls-grid">
      <div class="control-group">
        <h3>Gestión de Mesas</h3>
        <div class="button-group">
          <button class="badge add" @click="agregarMesaNueva">
            ➕ Añadir Mesa
          </button>
          <button
            class="badge delete"
            @click="eliminarMesaSeleccionada"
            :disabled="mesasSeleccionadas.length !== 1"
          >
            🗑️ Eliminar Mesa
          </button>
        </div>
      </div>

      <div v-if="mesasSeleccionadas.length > 0" class="info-section">
        <div class="selection-info">
          ✅
          <div>
            <strong>Mesa seleccionada:</strong>
            <p>{{ mesasSeleccionadas.join(', ') }}</p>
            <button
              class="btn-editar-mesa"
              v-if="mesasSeleccionadas.length === 1"
              @click="abrirMenuMesa(mesasSeleccionadas[0])"
            >
              ✏️ Editar Mesa
            </button>
          </div>
        </div>
      </div>

      <div v-if="grupoSeleccionado" class="control-group">
        <h3>Acciones de Grupo</h3>
        <div class="button-group">
          <button
            class="badge separar"
            @click="separarGrupoSeleccionado"
          >
            ✂️ Separar grupo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import useMesaManagement from '@/composables/useMesaManagement';
import useGroupManagement from '@/composables/useGroupManagement';

export default {
  setup() {
    const store = useStore();
    const {
      agregarMesaNueva,
      eliminarMesaSeleccionada,
      abrirMenuMesa
    } = useMesaManagement();
    const { separarGrupoSeleccionado } = useGroupManagement();

    const mesasSeleccionadas = computed(() => store.getters['pisos/mesasSeleccionadas']);
    const grupoSeleccionado = computed(() => store.getters['pisos/grupoSeleccionado']);

    const toggleInstructions = () => {
      store.commit('modal/SET_TYPE', 'instructions');
      store.commit('modal/SET_SHOW', true);
    };

    return {
      mesasSeleccionadas,
      grupoSeleccionado,
      agregarMesaNueva,
      eliminarMesaSeleccionada,
      abrirMenuMesa,
      separarGrupoSeleccionado,
      toggleInstructions
    };
  }
};
</script>

<style scoped>
.btn-editar-mesa {
  margin-top: 10px;
  padding: 8px 15px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}
.btn-editar-mesa:hover {
  background: #2980b9;
  transform: translateY(-2px);
}
</style>