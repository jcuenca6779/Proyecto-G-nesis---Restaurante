<template>
  <div class="controls-panel">
    <div class="panel-header">
      <h2>Controles</h2>
      <button class="help-button" @click="toggleInstructions">?</button>
    </div>

    <div class="controls-grid">
      <div class="control-group">
        <h3>Gestión General</h3>
        <div class="button-group">
          <button class="badge add" @click="agregarMesaNueva">➕ Añadir Mesa</button>
        </div>
      </div>

      <!-- SECCIÓN DE SELECCIÓN (MESA O GRUPO) -->
      <div v-if="targetSeleccionado" class="info-section">
        <div class="selection-info">
          ✅
          <div>
            <strong>{{ esGrupoSeleccionado ? 'Grupo Seleccionado' : 'Mesa Seleccionada:' }}</strong>
            <p>{{ esGrupoSeleccionado ? `Grupo ${grupoIndex + 1}` : targetSeleccionado.id }}</p>
            
            <!-- Acciones para Mesa -->
            <div v-if="!esGrupoSeleccionado" class="action-buttons">
              <button @click="abrirModalPedido" class="btn-accion tomar-pedido" :disabled="targetSeleccionado.estado !== 'disponible'">📋 Tomar Pedido</button>
              <button @click="abrirModalEditarPedido" class="btn-accion editar-pedido" v-if="targetSeleccionado.pedidoId">📄 Ver/Editar Pedido</button>
              <button @click="abrirMenuMesa(targetSeleccionado.id)" class="btn-accion editar-mesa">✏️ Editar Mesa</button>
              <button @click="eliminarMesaSeleccionada" class="btn-accion eliminar" :disabled="!!targetSeleccionado.pedidoId">🗑️ Eliminar</button>
            </div>
            
            <!-- Acciones para Grupo -->
            <div v-if="esGrupoSeleccionado" class="action-buttons">
              <button @click="abrirModalPedido" class="btn-accion tomar-pedido" :disabled="targetSeleccionado.estado !== 'disponible'">📋 Tomar Pedido</button>
              <button @click="abrirModalEditarPedido" class="btn-accion editar-pedido" v-if="targetSeleccionado.pedidoId">📄 Ver/Editar Pedido</button>
              <button @click="separarGrupoSeleccionado" class="btn-accion separar" :disabled="!!targetSeleccionado.pedidoId">✂️ Separar Grupo</button>
            </div>
          </div>
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
    const { agregarMesaNueva, eliminarMesaSeleccionada, abrirMenuMesa } = useMesaManagement();
    const { separarGrupoSeleccionado } = useGroupManagement();

    const mesasSeleccionadas = computed(() => store.getters['pisos/mesasSeleccionadas']);
    const grupoSeleccionadoId = computed(() => store.getters['pisos/grupoSeleccionado']);
    const esGrupoSeleccionado = computed(() => !!grupoSeleccionadoId.value);

    const targetSeleccionado = computed(() => {
      if (esGrupoSeleccionado.value) return store.getters['pisos/grupoById'](grupoSeleccionadoId.value);
      if (mesasSeleccionadas.value.length === 1) return store.getters['pisos/mesaById'](mesasSeleccionadas.value[0]);
      return null;
    });

    const grupoIndex = computed(() => {
        if(!esGrupoSeleccionado.value) return -1;
        return store.getters['pisos/gruposDelPisoActivo'].findIndex(g => g.id === grupoSeleccionadoId.value);
    });

    const abrirModalPedido = () => {
        store.commit('modal/SET_TYPE', 'tomarPedido');
        store.commit('modal/SET_SHOW', true);
    };

    const abrirModalEditarPedido = () => {
        store.commit('modal/SET_TYPE', 'editarPedido');
        store.commit('modal/SET_SHOW', true);
    };

    const toggleInstructions = () => {
      store.commit('modal/SET_TYPE', 'instructions');
      store.commit('modal/SET_SHOW', true);
    };

    return {
      targetSeleccionado,
      esGrupoSeleccionado,
      grupoIndex,
      agregarMesaNueva,
      eliminarMesaSeleccionada,
      abrirMenuMesa,
      separarGrupoSeleccionado,
      abrirModalPedido,
      abrirModalEditarPedido,
      toggleInstructions
    };
  }
};
</script>

<style scoped>
.action-buttons { margin-top: 15px; display: flex; flex-direction: column; gap: 10px; }
.btn-accion { padding: 8px 12px; border: none; border-radius: 5px; color: white; cursor: pointer; font-weight: bold; }
.btn-accion:disabled { opacity: 0.5; cursor: not-allowed; }
.tomar-pedido { background-color: #3498db; }
.editar-pedido { background-color: #f39c12; }
.editar-mesa { background-color: #9b59b6; }
.separar { background-color: #e67e22; }
.eliminar { background-color: #e74c3c; }
</style>
