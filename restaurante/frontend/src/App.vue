<template>
  <div id="app" class="app-container">
    <Header />
    <div class="main-content">
      <ControlsPanel class="controls-panel" />
      <MapContainer class="map-container" />
      <StatsPanel class="stats-panel" />
    </div>
    
    <Modal v-if="showModal" >
      <EditMesaForm v-if="modalType === 'editMesa'" />
      <AddMesaForm v-if="modalType === 'addMesa'" />
      <InstructionsModal v-if="modalType === 'instructions'" />
    </Modal>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import Header from '@/components/Header.vue';
import ControlsPanel from '@/components/ControlsPanel.vue';
import MapContainer from '@/components/MapContainer.vue';
import StatsPanel from '@/components/StatsPanel.vue';
import Modal from '@/components/Modal.vue';
import EditMesaForm from '@/components/EditMesaForm.vue';
import AddMesaForm from '@/components/AddMesaForm.vue';
// IMPORTAMOS EL NUEVO COMPONENTE
import InstructionsModal from '@/components/InstructionsModal.vue';

export default {
  name: 'App',
  components: {
    Header,
    ControlsPanel,
    MapContainer,
    StatsPanel,
    EditMesaForm,
    AddMesaForm,
    Modal,
    // REGISTRAMOS EL NUEVO COMPONENTE
    InstructionsModal
  },
  setup() {
    const store = useStore();
    const showModal = computed(() => store.state.modal?.show);
    const modalType = computed(() => store.state.modal?.type);
    
    return { 
      showModal,
      modalType
    };
  }
};
</script>

<style scoped>
.app-container {
  max-width: 1600px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  
  display: grid;
  grid-template-columns: 320px 1fr;
  grid-template-rows: 1fr auto;
}

.controls-panel {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  overflow-y: auto;
  min-height: 0;
  border-right: 1px solid #e0e0e0;
}

.map-container {
  grid-row: 1 / 2;
  grid-column: 2 / 3;
  position: relative;
  min-height: 0;
}

.stats-panel {
  grid-row: 2 / 3;
  grid-column: 1 / -1;
}

/* Lógica responsiva unificada */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(60vh, auto) auto;
  }

  .controls-panel {
    grid-column: 1;
    grid-row: 1;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .map-container {
    grid-column: 1;
    grid-row: 2;
    min-height: 60vh;
  }

  .stats-panel {
    grid-column: 1;
    grid-row: 3;
  }
}
</style>