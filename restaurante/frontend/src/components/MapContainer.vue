<template>
  <div class="map-container-wrapper">
    <FloorSelector />
    <div 
      class="map-container"
      @mousemove="handleDragMove"
      @mouseup="handleDrop"
      @mouseleave="handleStopDrag"
    >
      <div
        class="restaurant-map"
        @mousemove="handleDragMove"
        @mouseup="handleDrop"
        @mouseleave="handleStopDrag"
      >
        <!-- Elementos decorativos del piso activo -->
        <div
          v-for="elemento in elementosDecorativos"
          :key="elemento.id"
          :class="['layout-elemento', elemento.tipo]"
          :style="{
            left: elemento.x + 'px', 
            top: elemento.y + 'px', 
            width: elemento.width + 'px', 
            height: elemento.height + 'px',
            transform: 'rotate(' + (elemento.rotacion || 0) + 'deg)',
            backgroundColor: elemento.color 
          }"
        ></div>

        <div class="map-boundary"></div>

        <!-- Silueta de arrastre -->
        <div
          v-if="draggingItem"
          class="drag-indicator"
          :style="{
            left: dragPosition.x + 'px',
            top: dragPosition.y + 'px',
            width: draggingItem.type === 'mesa' 
              ? `${(draggingItem.anchoCuadriculas || 3) * 50}px` 
              : `${(draggingItem.anchoCuadriculas || 8) * 40}px`,
            height: draggingItem.type === 'mesa' 
              ? `${(draggingItem.altoCuadriculas || 3) * 50}px` 
              : '290px'
          }"
        >
          {{ draggingItem.type === 'mesa' ? `Mesa ${draggingItem.id}` : draggingItem.displayId }}
        </div>

        <div class="union-feedback" :class="{ show: showUnionFeedback }">
          ¡Mesas unidas con éxito!
        </div>

        <!-- Grupos del piso activo -->
        <div
          v-for="(grupo, index) in grupos"
          :key="grupo.id"
          class="mesa-grupo"
          :class="{ 
            'grupo-seleccionado': grupoSeleccionado === grupo.id,
            'dragging': draggingItem && draggingItem.type === 'grupo' && draggingItem.id === grupo.id
          }"
          :style="{ 
            left: grupo.x + 'px', 
            top: grupo.y + 'px',
            width: (grupo.anchoCuadriculas || 8) * 40 + 'px',
            backgroundColor: obtenerColor(grupo.estado) /* Color dinámico */
          }"
          @mousedown="startDrag($event, { ...grupo, displayId: `Grupo ${index + 1}` }, 'grupo')"
          @click="seleccionarGrupo(grupo.id)"
        >
          <h3>Grupo {{ index + 1 }}</h3>
          <!-- === LÍNEAS RESTAURADAS === -->
          <div class="grupo-info">Capacidad: {{ grupo.capacidadTotal }}</div>
          <div class="grupo-info">Estado: {{ grupo.estado }}</div>
          <div class="grupo-info" style="font-size: 0.9rem">
            Mesas: {{ grupo.mesas.map(m => m.id).join(', ') }}
          </div>
          <!-- ======================== -->
          <div v-if="grupo.pedidoId" class="pedido-id-badge" title="Número de Pedido">
            #{{ grupo.pedidoId.slice(-6) }}
          </div>
        </div>

        <!-- Mesas individuales del piso activo -->
        <div
          v-for="mesa in mesasIndividuales"
          :key="mesa.id"
          class="mesa"
          :class="{
            'mesa-seleccionada': mesasSeleccionadas.includes(mesa.id),
            'dragging': draggingItem && draggingItem.type === 'mesa' && draggingItem.id === mesa.id,
            'drop-target': dropTarget === mesa.id
          }"
          :style="{ 
            left: mesa.x + 'px', 
            top: mesa.y + 'px',
            width: (mesa.anchoCuadriculas || 3) * 50 + 'px',
            height: (mesa.altoCuadriculas || 3) * 50 + 'px',
            backgroundColor: obtenerColor(mesa.estado) 
          }"
          @mousedown="startDrag($event, mesa, 'mesa')"
          @click="seleccionarMesaIndividual(mesa.id)"
        >
          <h3>Mesa {{ mesa.id }}</h3>
          <p>Cap: {{ mesa.capacidad }}</p>
          <p>Estado: {{ mesa.estado }}</p>
          <div v-if="mesa.pedidoId" class="pedido-id-badge" title="Número de Pedido">
            #{{ mesa.pedidoId.slice(-6) }}
          </div>
        </div>

        <!-- Mesas individuales del piso activo -->
        <div
          v-for="mesa in mesasIndividuales"
          :key="mesa.id"
          class="mesa"
          :class="{
            'mesa-seleccionada': mesasSeleccionadas.includes(mesa.id),
            'dragging': draggingItem && draggingItem.type === 'mesa' && draggingItem.id === mesa.id,
            'drop-target': dropTarget === mesa.id
          }"
          :style="{ 
            left: mesa.x + 'px', 
            top: mesa.y + 'px',
            width: (mesa.anchoCuadriculas || 3) * 50 + 'px',
            height: (mesa.altoCuadriculas || 3) * 50 + 'px',
            backgroundColor: obtenerColor(mesa.estado) 
          }"
          @mousedown="startDrag($event, mesa, 'mesa')"
          @click="seleccionarMesaIndividual(mesa.id)"
        >
          <h3>Mesa {{ mesa.id }}</h3>
          <p>Cap: {{ mesa.capacidad }}</p>
          <p>Estado: {{ mesa.estado }}</p>
          <div v-if="mesa.pedidoId" class="pedido-id-badge" title="Número de Pedido">
            #{{ mesa.pedidoId.slice(-6) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import useDragDrop from '@/composables/useDragDrop';
import { obtenerColor } from '@/utils/helpers';
import useMesaManagement from '@/composables/useMesaManagement';
import useGroupManagement from '@/composables/useGroupManagement';
import FloorSelector from './FloorSelector.vue';

export default {
  components: { FloorSelector },
  setup() {
    const store = useStore();
    
    const {
      draggingItem,
      dragPosition,
      dropTarget,
      dropTargetGroup,
      showUnionFeedback,
      startDrag,
      onDragMove: handleDragMove,
      stopDrag: handleStopDrag,
      handleDrop
    } = useDragDrop();

    const mesasIndividuales = computed(() => store.getters['pisos/mesasDelPisoActivo']);
    const grupos = computed(() => store.getters['pisos/gruposDelPisoActivo']);
    const elementosDecorativos = computed(() => store.getters['pisos/decoracionDelPisoActivo']);
    const mesasSeleccionadas = computed(() => store.getters['pisos/mesasSeleccionadas']);
    const grupoSeleccionado = computed(() => store.getters['pisos/grupoSeleccionado']);

    const { seleccionarMesaIndividual } = useMesaManagement();
    const { seleccionarGrupo } = useGroupManagement();

    return {
      elementosDecorativos,
      mesasIndividuales,
      grupos,
      mesasSeleccionadas,
      grupoSeleccionado,
      draggingItem,
      dragPosition,
      dropTarget,
      dropTargetGroup,
      showUnionFeedback,
      startDrag,
      handleDragMove,
      handleStopDrag,
      handleDrop,
      seleccionarMesaIndividual,
      seleccionarGrupo,
      obtenerColor
    };
  }
};
</script>

<style scoped>
.map-container-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.map-container {
  flex-grow: 1;
  position: relative;
  width: 100%;
  height: 100%;
  background: #d8e6e7;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.restaurant-map {
  position: relative;
  width: 1295px;
  height: 900px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f8ff"/><path d="M0 50 L100 50 M50 0 L50 100" stroke="%23d0e0e0" stroke-width="0.5"/></svg>');
  background-size: 50px 50px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  user-select: none;
}

.mesa, .mesa-grupo {
  transition: transform 0.2s ease, box-shadow 0.2s ease, width 0.3s ease, height 0.3s ease;
}

.drag-indicator {
  position: absolute;
  border-radius: 15px;
  background: rgba(46, 204, 113, 0.3);
  border: 2px dashed #2ecc71;
  pointer-events: none;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #27ae60;
  font-size: 1.2rem;
  transition: width 0.2s ease, height 0.2s ease;
  box-shadow: 0 0 0 3px #27ae60;
}

.layout-elemento {
  position: absolute;
  background-color: grey;
  border: 1px solid #555;
  user-select: none;
}
.layout-elemento.pared {
  background-color: #a9a9a9;
}
.layout-elemento.barra {
  background-color: #8b4513;
}
.layout-elemento.planta {
  background-color: #228b22;
  width: 50px !important;
  height: 50px !important;
  border-radius: 50%;
}

.mesa {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  cursor: grab;
  text-align: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  border: 2px solid rgba(255, 255, 255, 0.3);
  z-index: 1;
  user-select: none;
  overflow: hidden;
  touch-action: none;
}

.mesa::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px 10px 0 0;
}

.mesa:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.mesa.dragging {
  cursor: grabbing;
  opacity: 0.8;
  box-shadow: 0 0 15px rgba(52, 152, 219, 0.8);
  z-index: 100;
}

.mesa.drop-target {
  transform: scale(1.1);
  box-shadow: 0 0 0 4px #2ecc71, 0 0 20px rgba(46, 204, 113, 0.6);
  z-index: 50;
}

.mesa h3 {
  margin: 5px 0;
  font-size: 1.3rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.mesa p {
  margin: 3px 0;
  font-size: 0.9rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  padding: 0 5px;
}

.mesa-grupo {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  border-radius: 15px;
  color: white;
  font-weight: bold;
  cursor: grab;
  padding: 15px;
  text-align: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
  border: 2px solid rgba(255, 255, 255, 0.3);
  z-index: 2;
  user-select: none;
  transition: all 0.2s ease;
  height: 290px;
}

.mesa-grupo.drop-target {
  transform: scale(1.1);
  box-shadow: 0 0 0 4px #f1c40f, 0 0 20px rgba(241, 196, 15, 0.6);
  z-index: 50;
}

.grupo-seleccionado {
  box-shadow: 0 0 0 6px #f1c40f, 0 0 30px rgba(241, 196, 15, 0.8);
  transform: scale(1.05);
  z-index: 5;
}

.mesa-grupo::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 15px 15px 0 0;
}

.mesa-grupo:hover {
  transform: scale(1.03);
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.25);
  z-index: 11;
}

.mesa-grupo.dragging {
  cursor: grabbing;
  opacity: 0.8;
  box-shadow: 0 0 15px rgba(155, 89, 182, 0.8);
  z-index: 100;
}

.mesa-grupo h3 {
  margin: 5px 0;
  font-size: 1.8rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.mesa-grupo .grupo-info {
  font-size: 1.1rem;
  margin: 8px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 10px;
  width: 90%;
  pointer-events: none;
}

.mesa-seleccionada {
  box-shadow: 0 0 0 4px #3498db, 0 0 25px rgba(52, 152, 219, 0.8);
  transform: scale(1.05);
  z-index: 5;
}

.union-feedback {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #2ecc71;
  color: white;
  padding: 15px 30px;
  border-radius: 30px;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s;
}

.union-feedback.show {
  opacity: 1;
}

.map-boundary {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px dashed #3498db;
  z-index: -1;
  pointer-events: none;
}

.pedido-id-badge {
  position: absolute;
  bottom: 4px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.65);
  color: white;
  font-size: 0.7rem;
  padding: 3px 6px;
  border-radius: 4px;
  font-weight: bold;
  letter-spacing: 0.5px;
}
</style>