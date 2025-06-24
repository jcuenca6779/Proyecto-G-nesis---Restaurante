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
            <strong>
              {{ mesasSeleccionadas.length > 1 ? 'Mesas seleccionadas:' : 'Mesa seleccionada:' }}
            </strong>
            <p>{{ mesasSeleccionadas.join(', ') }}</p>
            <button
              class="btn-editar-mesa"
              @click="abrirMenuMesa(mesasSeleccionadas[0])"
            >
              ✏️ Editar Mesa
            </button>
          </div>
        </div>

        <div
          v-if="mesaSeleccionada && esMesaOcupada(mesaSeleccionada)"
          class="status-info"
        >
          ⚠️
          <div>
            <strong>¡Atención!</strong>
            <p>
              La mesa está ocupada y no puede ser marcada como reservada
            </p>
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
import { computed } from 'vue'
import { useStore } from 'vuex'
import useMesaManagement from '@/composables/useMesaManagement'
import useGroupManagement from '@/composables/useGroupManagement'

export default {
  setup() {
    const store = useStore()
    const {
      agregarMesaNueva,
      eliminarMesaSeleccionada,
      abrirMenuMesa,
      esMesaOcupada
    } = useMesaManagement()
    const { separarGrupoSeleccionado } = useGroupManagement()

    const mesasSeleccionadas = computed(() => store.state.mesas.mesasSeleccionadas)
    const grupoSeleccionado = computed(() => store.state.grupos.grupoSeleccionado)
    const mesaSeleccionada = computed(() => {
      if (mesasSeleccionadas.value.length === 1) {
        return store.getters['mesas/mesaById'](mesasSeleccionadas.value[0]);
      }
      return null
    });

    const toggleInstructions = () => {
      store.commit('modal/SET_TYPE', 'instructions')
      store.commit('modal/SET_SHOW', true)
    }

    return {
      mesasSeleccionadas,
      grupoSeleccionado,
      mesaSeleccionada,
      agregarMesaNueva,
      eliminarMesaSeleccionada,
      abrirMenuMesa,
      esMesaOcupada,
      separarGrupoSeleccionado,
      toggleInstructions
    }
  }
}
</script>

<style scoped>
/* ESTILOS ÚNICOS QUE SE MANTIENEN */
.mesa-list {
  margin-top: 8px;
}

.mesa-item {
  padding: 4px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.estado-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  text-transform: capitalize;
  color: white; /* Color de texto es común a todos */
}

.estado-badge.disponible {
  background-color: #27ae60;
}

.estado-badge.ocupada {
  background-color: #e74c3c;
}

.estado-badge.reservada {
  background-color: #f39c12;
}
</style>