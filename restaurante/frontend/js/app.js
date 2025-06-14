import {
  createApp,
  ref,
  reactive,
  computed,
  nextTick,
} from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import { ESTADOS_MESA } from "./estados.js";
import { obtenerColor } from "./utilidades.js";
import {
  cambiarEstado,
  unirMesas,
  separarGrupoSeleccionado,
  unirMesaAGrupo,
} from "./mesas.js";
import { startDrag, onDragMove, stopDrag, handleDrop } from "./dragdrop.js";

createApp({
  setup() {
    const mapWidth = 1290;
    const mapHeight = 897;
    const dragIndicatorSize = reactive({ width: 150, height: 110 });

    const mesasIndividuales = ref([
      { id: 1, estado: ESTADOS_MESA.DISPONIBLE, capacidad: 4, x: 50, y: 50 },
      { id: 2, estado: ESTADOS_MESA.DISPONIBLE, capacidad: 4, x: 200, y: 250 },
      { id: 3, estado: ESTADOS_MESA.DISPONIBLE, capacidad: 4, x: 350, y: 250 },
      { id: 4, estado: ESTADOS_MESA.DISPONIBLE, capacidad: 6, x: 50, y: 100 },
      { id: 5, estado: ESTADOS_MESA.DISPONIBLE, capacidad: 2, x: 100, y: 100 },
      { id: 6, estado: ESTADOS_MESA.DISPONIBLE, capacidad: 4, x: 250, y: 100 },
      { id: 7, estado: ESTADOS_MESA.DISPONIBLE, capacidad: 8, x: 50, y: 250 },
      { id: 8, estado: ESTADOS_MESA.DISPONIBLE, capacidad: 4, x: 100, y: 250 },
      { id: 9, estado: ESTADOS_MESA.DISPONIBLE, capacidad: 10, x: 450, y: 450 },
    ]);
    const grupos = ref([]);
    const mesasSeleccionadas = ref([]);
    const grupoSeleccionado = ref(null);
    const draggingItem = ref(null);
    const dragStartPos = reactive({ x: 0, y: 0 });
    const dragPosition = reactive({ x: 0, y: 0 });
    const dropTarget = ref(null);
    const dropTargetGroup = ref(null);
    const showUnionFeedback = ref(false);
    const elementosDecorativos = ref([]);
    
    // Nuevo estado para mostrar instrucciones
    const showInstructions = ref(false);

    const proximoIdMesa = ref(
      Math.max(
        0,
        ...mesasIndividuales.value.map(m => typeof m.id === 'number' ? m.id : 0),
        ...grupos.value.flatMap(g => g.mesas.map(gm => typeof gm.id === 'number' ? gm.id : 0))
      ) + 1
    );

    const deshabilitarReservada = computed(() => {
      if (mesasSeleccionadas.value.length !== 1) return true;
      
      const mesa = mesasIndividuales.value.find(
        m => m.id === mesasSeleccionadas.value[0]
      );
      
      return mesa && esMesaOcupada(mesa);
    });

    const eliminarMesaSeleccionada = () => {
      if (mesasSeleccionadas.value.length !== 1) {
        alert("Por favor, seleccione una única mesa para eliminar.");
        return;
      }
      const mesaIdAEliminar = mesasSeleccionadas.value[0];
      const mesaAEliminar = mesasIndividuales.value.find(m => m.id === mesaIdAEliminar);

      if (!mesaAEliminar) {
        alert("La mesa seleccionada no se encontró.");
        return;
      }

      if (confirm(`¿Está seguro de que desea eliminar la Mesa ${mesaIdAEliminar}? Esta acción no se puede deshacer.`)) {
        mesasIndividuales.value = mesasIndividuales.value.filter(m => m.id !== mesaIdAEliminar);
        mesasSeleccionadas.value = [];
      }
    };

    const agregarMesaNueva = () => {
      const nuevaMesa = {
        id: proximoIdMesa.value,
        estado: ESTADOS_MESA.DISPONIBLE,
        capacidad: 4,
        x: 20,
        y: 20,
      };

      mesasIndividuales.value.push(nuevaMesa);
      proximoIdMesa.value++;
      nextTick(() => {
         seleccionarMesaIndividual(nuevaMesa.id);
       });
    };

    const estadisticas = computed(() => {
      let disponibles = 0,
        ocupadas = 0,
        reservadas = 0,
        capacidadTotal = 0;
      mesasIndividuales.value.forEach((mesa) => {
        if (mesa.estado === ESTADOS_MESA.DISPONIBLE) disponibles++;
        if (mesa.estado === ESTADOS_MESA.OCUPADA) ocupadas++;
        if (mesa.estado === ESTADOS_MESA.RESERVADA) reservadas++;
        capacidadTotal += mesa.capacidad;
      });
      grupos.value.forEach((grupo) => {
        if (grupo.estado === ESTADOS_MESA.DISPONIBLE) disponibles++;
        if (grupo.estado === ESTADOS_MESA.OCUPADA) ocupadas++;
        if (grupo.estado === ESTADOS_MESA.RESERVADA) reservadas++;
        capacidadTotal += grupo.capacidadTotal;
      });
      return {
        disponibles,
        ocupadas,
        reservadas,
        grupos: grupos.value.length,
        capacidadTotal,
      };
    });

    const handleStartDrag = (event, item, type) => {
      startDrag(event, item, type, draggingItem, dragStartPos, dragPosition);
      
      if (type === "mesa") {
        dragIndicatorSize.width = 150;
        dragIndicatorSize.height = 110;
      } else if (type === "grupo") {
        dragIndicatorSize.width = 200;
        dragIndicatorSize.height = 281;
      }
    };

    const handleDragMove = (event) =>
      onDragMove(
        event,
        draggingItem,
        dragStartPos,
        dragPosition,
        mesasIndividuales,
        grupos,
        dropTarget,
        dropTargetGroup,
        mapWidth,
        mapHeight
      );

    const handleStopDrag = () =>
      stopDrag(draggingItem, dropTarget, dropTargetGroup);

    const handleDropWrapper = (event, target) =>
      handleDrop(
        event,
        target,
        draggingItem,
        mesasIndividuales,
        grupos,
        dropTarget,
        dropTargetGroup,
        (mesa, grupo) =>
          unirMesaAGrupo(
            mesa,
            grupo,
            mesasIndividuales,
            grupos,
            showUnionFeedback
          ),
        (mesa1, mesa2) =>
          unirMesas(mesa1, mesa2, mesasIndividuales, grupos, showUnionFeedback),
        handleStopDrag,
        showUnionFeedback
      );

    const seleccionarMesaIndividual = (id) => {
      grupoSeleccionado.value = null;
      if (mesasSeleccionadas.value.includes(id)) {
        mesasSeleccionadas.value = [];
        return;
      }
      mesasSeleccionadas.value = [id];
    };

    const seleccionarGrupo = (id) => {
      mesasSeleccionadas.value = [];
      grupoSeleccionado.value = grupoSeleccionado.value === id ? null : id;
    };

    const esMesaOcupada = (mesa) => mesa && mesa.estado === ESTADOS_MESA.OCUPADA;
    
    // Función para alternar las instrucciones
    const toggleInstructions = () => {
      showInstructions.value = !showInstructions.value;
    };

    return {
      mesasIndividuales,
      grupos,
      mesasSeleccionadas,
      grupoSeleccionado,
      estadisticas,
      ESTADOS_MESA,
      dragIndicatorSize,
      draggingItem,
      dragStartPos,
      dragPosition,
      dropTarget,
      dropTargetGroup,
      showUnionFeedback,
      elementosDecorativos,
      esMesaOcupada,
      deshabilitarReservada,
      showInstructions, // Nuevo estado
      toggleInstructions, // Nueva función
      handleStartDrag,
      handleDragMove,
      handleStopDrag,
      handleDropWrapper,
      seleccionarMesaIndividual,
      seleccionarGrupo,
      cambiarEstado: (nuevoEstado) =>
        cambiarEstado(mesasIndividuales, mesasSeleccionadas, nuevoEstado),
      unirMesas: (mesa1, mesa2) =>
        unirMesas(mesa1, mesa2, mesasIndividuales, grupos, showUnionFeedback),
      separarGrupoSeleccionado: () =>
        separarGrupoSeleccionado(
          grupos,
          grupoSeleccionado,
          mesasIndividuales,
          mapWidth,
          mapHeight
        ),
      obtenerColor,
      agregarMesaNueva,
      eliminarMesaSeleccionada, 
    };
  },
}).mount("#app");