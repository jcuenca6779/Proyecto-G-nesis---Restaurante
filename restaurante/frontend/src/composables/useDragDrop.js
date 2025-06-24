import { ref } from "vue";
import { useStore } from "vuex";

export default function useDragDrop() {
  const store = useStore();
  const draggingItem = ref(null);
  const dragStartPos = ref({ x: 0, y: 0 });
  const dragPosition = ref({ x: 0, y: 0 });
  const dropTarget = ref(null);
  const dropTargetGroup = ref(null);
  const showUnionFeedback = ref(false);
  const mapWidth = 1175;
  const mapHeight = 895;

  const startDrag = (event, item, type) => {
    try {
      event?.preventDefault();
      
      if (type === 'mesa') {
        store.commit('pisos/SET_SELECTED_GROUP', null);
        store.commit('pisos/SET_SELECTED_MESAS', [item.id]);
      } else if (type === 'grupo') {
        store.commit('pisos/SET_SELECTED_MESAS', []);
        store.commit('pisos/SET_SELECTED_GROUP', item.id);
      }
      
      const mapContainer = document.querySelector(".map-container");
      const rect = mapContainer.getBoundingClientRect();

      draggingItem.value = {
        ...item,
        type,
        offsetX: event.clientX - rect.left - item.x,
        offsetY: event.clientY - rect.top - item.y,
        // displayId se añade desde MapContainer.vue para grupos
        displayId: item.displayId || null
      };
      
      document.body.style.cursor = "grabbing";
    } catch (error) {
      console.error("Error al iniciar el arrastre:", error);
      draggingItem.value = null;
    }
  };

  const onDragMove = (event) => {
    if (!draggingItem.value) return;

    const mapContainer = document.querySelector(".map-container");
    const rect = mapContainer.getBoundingClientRect();
    
    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;

    const elementX = rawX - draggingItem.value.offsetX;
    const elementY = rawY - draggingItem.value.offsetY;

    const gridSize = 50;
    let newX = Math.round(elementX / gridSize) * gridSize;
    let newY = Math.round(elementY / gridSize) * gridSize;

    let width, height;

    if (draggingItem.value.type === "mesa") {
      const mesa = store.getters["pisos/mesaById"](draggingItem.value.id);
      if (mesa) {
        width = mesa.anchoCuadriculas * 50;
        height = mesa.altoCuadriculas * 50;
      }
    } else if (draggingItem.value.type === "grupo") {
      const grupo = draggingItem.value;
      width = (grupo.anchoCuadriculas || 8) * 40;
      height = 290;
    }

    newX = Math.max(0, Math.min(mapWidth - (width || 0), newX));
    newY = Math.max(0, Math.min(mapHeight - (height || 0), newY));

    dragPosition.value = { x: newX, y: newY };

    if (draggingItem.value.type === "mesa") {
      store.dispatch("pisos/updateMesaPosition", { id: draggingItem.value.id, x: newX, y: newY });
    } else if (draggingItem.value.type === "grupo") {
      store.dispatch("pisos/updateGrupoPosition", { id: draggingItem.value.id, x: newX, y: newY });
    }

    dropTarget.value = null;
    dropTargetGroup.value = null;
    const currentDraggedItem = draggingItem.value;
    const draggedWidth = width;
    const draggedHeight = height;

    const targetMesa = store.getters['pisos/mesasDelPisoActivo'].find((mesa) => {
      if (mesa.id === currentDraggedItem.id) return false;
      const targetWidth = mesa.anchoCuadriculas * 50;
      const targetHeight = mesa.altoCuadriculas * 50;
      return (
        Math.abs(mesa.x + targetWidth / 2 - (newX + draggedWidth / 2)) < (targetWidth + draggedWidth) / 2 &&
        Math.abs(mesa.y + targetHeight / 2 - (newY + draggedHeight / 2)) < (targetHeight + draggedHeight) / 2
      );
    });

    if (targetMesa) dropTarget.value = targetMesa.id;

    const targetGrupo = store.getters['pisos/gruposDelPisoActivo'].find((grupo) => {
      if (grupo.id === currentDraggedItem.id) return false;
      const targetWidth = (grupo.anchoCuadriculas || 8) * 40;
      const targetHeight = 290;
      return (
        Math.abs(grupo.x + targetWidth / 2 - (newX + draggedWidth / 2)) < (targetWidth + draggedWidth) / 2 &&
        Math.abs(grupo.y + targetHeight / 2 - (newY + draggedHeight / 2)) < (targetHeight + draggedHeight) / 2
      );
    });

    if (targetGrupo) dropTargetGroup.value = targetGrupo.id;
  };

  const stopDrag = () => {
    document.body.style.cursor = "";
    if (draggingItem.value) {
      draggingItem.value = null;
      dropTarget.value = null;
      dropTargetGroup.value = null;
    }
  };

  const handleDrop = () => {
    if (draggingItem.value && draggingItem.value.type === "mesa") {
      const mesaOrigen = store.getters["pisos/mesaById"](draggingItem.value.id);
      if (!mesaOrigen) { stopDrag(); return; }

      if (dropTargetGroup.value) {
        const grupo = store.getters["pisos/grupoById"](dropTargetGroup.value);
        if (grupo) store.dispatch("pisos/unirMesaAGrupo", { mesa: mesaOrigen, grupo, showUnionFeedback });
      } else if (dropTarget.value) {
        const mesaDestino = store.getters["pisos/mesaById"](dropTarget.value);
        if (mesaDestino) store.dispatch("pisos/unirMesas", { mesa1: mesaOrigen, mesa2: mesaDestino, showUnionFeedback });
      }
    }
    stopDrag();
  };

  return {
    draggingItem,
    dragPosition,
    dropTarget,
    dropTargetGroup,
    showUnionFeedback,
    startDrag,
    onDragMove,
    stopDrag,
    handleDrop,
  };
}