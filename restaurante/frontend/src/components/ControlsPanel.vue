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
          
          <!-- BOTÓN NUEVO PARA TOMAR PEDIDO -->
          <button 
            class="badge tomar-pedido"
            v-if="mesasSeleccionadas.length === 1"
            :disabled="!sePuedeTomarPedido"
            @click="abrirModalPedido"
            title="Solo para mesas disponibles"
          >
            📋 Tomar Pedido
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

      <!-- SECCIÓN DE INFORMACIÓN DE LA MESA SELECCIONADA -->
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

      <!-- SECCIÓN DE ACCIONES DEL GRUPO SELECCIONADO -->
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

    // Propiedades computadas que leen del store de 'pisos'
    const mesasSeleccionadas = computed(() => store.getters['pisos/mesasSeleccionadas']);
    const grupoSeleccionado = computed(() => store.getters['pisos/grupoSeleccionado']);

    // Obtiene el objeto completo de la mesa seleccionada para verificar su estado
    const mesaSeleccionada = computed(() => {
        if (mesasSeleccionadas.value.length === 1) {
            return store.getters['pisos/mesaById'](mesasSeleccionadas.value[0]);
        }
        return null;
    });

    // Determina si el botón "Tomar Pedido" debe estar activo
    const sePuedeTomarPedido = computed(() => {
        return mesaSeleccionada.value && mesaSeleccionada.value.estado === 'disponible';
    });

    // Abre el modal para tomar el pedido
    const abrirModalPedido = () => {
        store.commit('modal/SET_TYPE', 'tomarPedido');
        store.commit('modal/SET_SHOW', true);
    };

    const toggleInstructions = () => {
      store.commit('modal/SET_TYPE', 'instructions');
      store.commit('modal/SET_SHOW', true);
    };

    return {
      mesasSeleccionadas,
      grupoSeleccionado,
      sePuedeTomarPedido,
      agregarMesaNueva,
      eliminarMesaSeleccionada,
      abrirMenuMesa,
      separarGrupoSeleccionado,
      toggleInstructions,
      abrirModalPedido
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
.badge.tomar-pedido {
  background: linear-gradient(to bottom, #3498db, #2980b9);
}
</style>