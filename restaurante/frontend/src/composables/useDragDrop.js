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
  const dragIndicatorSize = ref({ width: 150, height: 110 });
  const mapWidth = 1155;
  const mapHeight = 895;

  const startDrag = (event, item, type) => {
    try {
      event?.preventDefault();
      draggingItem.value = { ...item, type };
      dragStartPos.value = { x: event.clientX, y: event.clientY };
      dragPosition.value = { x: item.x, y: item.y };
      document.body.style.cursor = "grabbing";

      const mapContainer = document.querySelector(".map-container");
      const rect = mapContainer.getBoundingClientRect();

      // Actualizar el tamaño del indicador de arrastre
      if (type === 'mesa') {
        // Limpiamos la selección de cualquier grupo
        store.commit('grupos/SET_SELECTED_GROUP', null);
        // Establecemos la mesa actual como la seleccionada
        store.commit('mesas/SET_SELECTED_MESAS', [item.id]);
      } else if (type === 'grupo') {
        // Si es un grupo, limpiamos la selección de mesas
        store.commit('mesas/SET_SELECTED_MESAS', []);
        // Y seleccionamos el grupo
        store.commit('grupos/SET_SELECTED_GROUP', item.id);
      }
      draggingItem.value = {
        ...item,
        type,
        startX: item.x,
        startY: item.y,
        offsetX: event.clientX - rect.left - item.x,
        offsetY: event.clientY - rect.top - item.y,
      };
    } catch (error) {
      console.error("Error al iniciar el arrastre:", error);
      draggingItem.value = null;
      document.body.style.cursor = "";
    }
  };

  const onDragMove = (event) => {
    if (!draggingItem.value) return;

    // Obtener posición relativa del contenedor del mapa
    const mapContainer = document.querySelector(".map-container");
    const rect = mapContainer.getBoundingClientRect();

    // Calcular posición relativa al mapa
    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;

    const elementX = rawX - draggingItem.value.offsetX;
    const elementY = rawY - draggingItem.value.offsetY;

    // Tamaño de la celda de la cuadrícula
    const gridSize = 50;

    // Ajustar a la cuadrícula
    let newX = Math.round(elementX / gridSize) * gridSize;
    let newY = Math.round(elementY / gridSize) * gridSize;

    // Usar tamaño personalizado si existe
    let width, height;

    if (draggingItem.value.type === "mesa") {
      const mesa = store.getters["mesas/mesaById"](draggingItem.value.id);
      if (mesa) {
        width = mesa.anchoCuadriculas * 50; // Se ajusta para usar el tamaño de la cuadrícula
        height = mesa.altoCuadriculas * 50;
      }
    } else if (draggingItem.value.type === "grupo") {
      // Obtenemos los datos del grupo que se está arrastrando
      const grupo = draggingItem.value;
      // Calculamos el tamaño dinámicamente, igual que en MapContainer.vue
      width = (grupo.anchoCuadriculas || 8) * 40;
      height = 270;
    }

    // Asegurar que la mesa se mantiene dentro del mapa
    newX = Math.max(0, Math.min(mapWidth - width, newX));
    let finalHeight = height;
    if (draggingItem.value.type === "grupo") {
      finalHeight = 290; // Usamos explícitamente la altura fija
    }
    newY = Math.max(0, Math.min(mapHeight - finalHeight, newY));

    dragPosition.value = { x: newX, y: newY };

    // Actualizar la posición del elemento arrastrado
    if (draggingItem.value.type === "mesa") {
      store.commit("mesas/UPDATE_MESA_POSITION", {
        id: draggingItem.value.id,
        x: newX,
        y: newY,
      });
    } else if (draggingItem.value.type === "grupo") {
      store.commit("grupos/UPDATE_GRUPO_POSITION", {
        id: draggingItem.value.id,
        x: newX,
        y: newY,
      });
    }

    // Lógica de detección de drop target
    dropTarget.value = null;
    dropTargetGroup.value = null;
    const currentDraggedItem = draggingItem.value;
    const draggedWidth = width;
    const draggedHeight = height;

    // Detección de mesas
    const targetMesa = store.state.mesas.mesasIndividuales.find((mesa) => {
      if (mesa.id === currentDraggedItem.id) return false;
      return (
        Math.abs(mesa.x - newX) <
          (mesa.anchoCuadriculas * 50 + draggedWidth) / 2 &&
        Math.abs(mesa.y - newY) <
          (mesa.altoCuadriculas * 50 + draggedHeight) / 2
      );
    });

    if (targetMesa) {
      dropTarget.value = targetMesa.id;
    }

    // Lógica de detección de drop target (GRUPOS)
    const targetGrupo = store.state.grupos.grupos.find((grupo) => {
      const targetWidth = (grupo.anchoCuadriculas || 8) * 40;
      const targetHeight = 270;
      return (
        // Comparamos la distancia entre centros con la mitad de la suma de sus tamaños
        Math.abs(grupo.x + targetWidth / 2 - (newX + draggedWidth / 2)) <
          (targetWidth + draggedWidth) / 2 &&
        Math.abs(grupo.y + targetHeight / 2 - (newY + draggedHeight / 2)) <
          (targetHeight + draggedHeight) / 2
      );
    });

    if (targetGrupo) {
      dropTargetGroup.value = targetGrupo.id;
    }
  };

  const stopDrag = () => {
    document.body.style.cursor = "";
    if (draggingItem.value) {
      document.body.style.cursor = "";
      draggingItem.value = null;
      dropTarget.value = null;
      dropTargetGroup.value = null;
    }
  };

  const handleDrop = (event) => {
    if (showUnionFeedback.value) {
      setTimeout(() => {
        showUnionFeedback.value = false;
      }, 2000);
    }
    if (draggingItem.value && draggingItem.value.type === "mesa") {
      const mesaOrigen = store.getters["mesas/mesaById"](draggingItem.value.id);

      if (!mesaOrigen) {
        stopDrag();
        return;
      }

      if (dropTargetGroup.value) {
        const grupo = store.getters["grupos/grupoById"](dropTargetGroup.value);
        if (grupo && mesaOrigen) {
          store.dispatch("grupos/unirMesaAGrupo", {
            mesa: mesaOrigen,
            grupo,
            showUnionFeedback,
          });
        }
      } else if (dropTarget.value) {
        const mesaDestino = store.getters["mesas/mesaById"](dropTarget.value);
        if (mesaDestino && mesaDestino.id !== mesaOrigen.id) {
          store.dispatch("mesas/unirMesas", {
            mesa1: mesaOrigen,
            mesa2: mesaDestino,
            showUnionFeedback,
          });
        }
      }
    }
    stopDrag();
  };

  return {
    draggingItem,
    dragStartPos,
    dragPosition,
    dropTarget,
    dropTargetGroup,
    showUnionFeedback,
    dragIndicatorSize,
    startDrag,
    onDragMove,
    stopDrag,
    handleDrop,
  };
}
