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
    const mapHeight = 895;
    const dragIndicatorSize = reactive({ width: 150, height: 110 });

    const mesasIndividuales = ref([
      {
        id: 1,
        estado: ESTADOS_MESA.DISPONIBLE,
        capacidad: 4,
        x: 50,
        y: 50,
        anchoCuadriculas: 3,
        altoCuadriculas: 3,
      },
      {
        id: 2,
        estado: ESTADOS_MESA.DISPONIBLE,
        capacidad: 4,
        x: 200,
        y: 250,
        anchoCuadriculas: 3,
        altoCuadriculas: 3,
      },
      {
        id: 3,
        estado: ESTADOS_MESA.DISPONIBLE,
        capacidad: 4,
        x: 350,
        y: 250,
        anchoCuadriculas: 3,
        altoCuadriculas: 3,
      },
      {
        id: 4,
        estado: ESTADOS_MESA.DISPONIBLE,
        capacidad: 6,
        x: 50,
        y: 100,
        anchoCuadriculas: 3,
        altoCuadriculas: 3,
      },
      {
        id: 5,
        estado: ESTADOS_MESA.DISPONIBLE,
        capacidad: 2,
        x: 100,
        y: 100,
        anchoCuadriculas: 3,
        altoCuadriculas: 3,
      },
      {
        id: 6,
        estado: ESTADOS_MESA.DISPONIBLE,
        capacidad: 4,
        x: 250,
        y: 100,
        anchoCuadriculas: 3,
        altoCuadriculas: 3,
      },
      {
        id: 7,
        estado: ESTADOS_MESA.DISPONIBLE,
        capacidad: 8,
        x: 50,
        y: 250,
        anchoCuadriculas: 3,
        altoCuadriculas: 3,
      },
      {
        id: 8,
        estado: ESTADOS_MESA.DISPONIBLE,
        capacidad: 4,
        x: 100,
        y: 250,
        anchoCuadriculas: 3,
        altoCuadriculas: 3,
      },
      {
        id: 9,
        estado: ESTADOS_MESA.DISPONIBLE,
        capacidad: 10,
        x: 450,
        y: 450,
        anchoCuadriculas: 3,
        altoCuadriculas: 3,
      },
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
        ...mesasIndividuales.value.map((m) =>
          typeof m.id === "number" ? m.id : 0
        ),
        ...grupos.value.flatMap((g) =>
          g.mesas.map((gm) => (typeof gm.id === "number" ? gm.id : 0))
        )
      ) + 1
    );

    const deshabilitarReservada = computed(() => {
      if (mesasSeleccionadas.value.length !== 1) return true;

      const mesa = mesasIndividuales.value.find(
        (m) => m.id === mesasSeleccionadas.value[0]
      );

      return mesa && esMesaOcupada(mesa);
    });

    const eliminarMesaSeleccionada = () => {
      try {
        if (mesasSeleccionadas.value.length !== 1) {
          alert("Por favor, seleccione una única mesa para eliminar.");
          return;
        }
        const mesaIdAEliminar = mesasSeleccionadas.value[0];
        const mesaAEliminar = mesasIndividuales.value.find(
          (m) => m.id === mesaIdAEliminar
        );

        if (!mesaAEliminar) {
          alert("La mesa seleccionada no se encontró.");
          return;
        }

        if (
          confirm(
            `¿Está seguro de que desea eliminar la Mesa ${mesaIdAEliminar}? Esta acción no se puede deshacer.`
          )
        ) {
          mesasIndividuales.value = mesasIndividuales.value.filter(
            (m) => m.id !== mesaIdAEliminar
          );
          mesasSeleccionadas.value = [];
        }
      } catch (error) {
        console.error("Error al eliminar mesa:", error);
        alert("Error inesperado al eliminar la mesa. Detalles en consola.");
      }
    };

    const showAddModal = ref(false);
    const nuevaMesa = reactive({
      id: null,
      capacidad: 4,
      estado: ESTADOS_MESA.DISPONIBLE,
      forma: "cuadrada",
      anchoCuadriculas: 2,
      altoCuadriculas: 2,
    });
    const errores = reactive({
      id: "",
      capacidad: "",
      tamano: "",
    });

    const agregarMesaNueva = () => {
      // Resetear errores
      errores.id = "";
      errores.capacidad = "";
      // Asignar el próximo ID disponible como sugerencia
      nuevaMesa.id = proximoIdMesa.value;
      nuevaMesa.capacidad = 4;
      nuevaMesa.forma = "cuadrada";
      nuevaMesa.anchoCuadriculas = 3;
      nuevaMesa.altoCuadriculas = 3;
      showAddModal.value = true;
    };

    const confirmarNuevaMesa = () => {
      try {
        // Resetear errores
        errores.id = "";
        errores.capacidad = "";

        // Validaciones mejoradas
        let valido = true;

        const minSize = 2;
        if (
          nuevaMesa.anchoCuadriculas < minSize ||
          nuevaMesa.altoCuadriculas < minSize
        ) {
          errores.tamano = `El tamaño mínimo es ${minSize}x${minSize} cuadrículas`;
          valido = false;
        }

        if (!nuevaMesa.id || isNaN(nuevaMesa.id)) {
          errores.id = "Por favor, ingrese un número válido";
          valido = false;
        } else if (nuevaMesa.id <= 0) {
          errores.id = "El número debe ser positivo";
          valido = false;
        } else if (
          mesasIndividuales.value.some((m) => m.id === nuevaMesa.id) ||
          grupos.value.some((g) => g.mesas.some((m) => m.id === nuevaMesa.id))
        ) {
          errores.id = "Este número ya existe";
          valido = false;
        }

        if (!nuevaMesa.capacidad || isNaN(nuevaMesa.capacidad)) {
          errores.capacidad = "Ingrese capacidad válida";
          valido = false;
        } else if (nuevaMesa.capacidad < 2) {
          errores.capacidad = "Mínimo 2 personas";
          valido = false;
        } else if (nuevaMesa.capacidad > 20) {
          errores.capacidad = "Máximo 20 personas";
          valido = false;
        }

        if (!valido) {
          // Enfocar el primer campo con error
          if (errores.id) {
            document.getElementById("mesa-id").focus();
          } else if (errores.capacidad) {
            document.getElementById("mesa-capacidad").focus();
          }
          return;
        }

        // Ajustar posición a la cuadrícula
        const gridSize = 50;
        const posX = Math.round(20 / gridSize) * gridSize;
        const posY = Math.round(20 / gridSize) * gridSize;

        // Crear la mesa con las propiedades basadas en cuadrícula
        mesasIndividuales.value.push({
          id: nuevaMesa.id,
          estado: nuevaMesa.estado,
          capacidad: nuevaMesa.capacidad,
          x: posX,
          y: posY,
          forma: nuevaMesa.forma,
          anchoCuadriculas: nuevaMesa.anchoCuadriculas,
          altoCuadriculas: nuevaMesa.altoCuadriculas,
        });

        // Actualizar el próximo ID
        proximoIdMesa.value = Math.max(proximoIdMesa.value, nuevaMesa.id) + 1;

        // Cerrar modal
        showAddModal.value = false;
      } catch (error) {
        console.error("Error al agregar nueva mesa:", error);
        alert("Error inesperado al agregar la mesa. Detalles en consola.");
      }
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

      // Actualizar el tamaño del indicador de arrastre
      if (type === "mesa") {
        const mesa = mesasIndividuales.value.find((m) => m.id === item.id);
        if (mesa) {
          dragIndicatorSize.width = mesa.anchoCuadriculas * 50;
          dragIndicatorSize.height = mesa.altoCuadriculas * 50;
        }
      } else if (type === "grupo") {
        dragIndicatorSize.width = 200;
        dragIndicatorSize.height = 280;
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
        (mesa, grupo) => {
          // Verificar si la mesa ya pertenece a un grupo
          if (mesa.grupoId) {
            alert("Esta mesa ya pertenece a un grupo");
            return false;
          }
          return unirMesaAGrupo(
            mesa,
            grupo,
            mesasIndividuales,
            grupos,
            showUnionFeedback,
            mesasSeleccionadas
          );
        },
        (mesa1, mesa2) => {
          // Verificar si alguna mesa ya está en un grupo
          if (mesa1.grupoId || mesa2.grupoId) {
            alert("Una de las mesas ya pertenece a un grupo");
            return false;
          }
          return unirMesas(
            mesa1,
            mesa2,
            mesasIndividuales,
            grupos,
            showUnionFeedback,
            mesasSeleccionadas
          );
        },
        handleStopDrag,
        showUnionFeedback
      );

    const showMesaMenu = ref(false);
    const mesaEditada = reactive({
      id: null,
      estado: "",
      capacidad: 4,
      forma: "cuadrada",
      tamano: 100,
    });
    const erroresEdit = reactive({
      capacidad: "",
      tamano: "",
    });

    const abrirEdicionMesa = (mesa) => {
      mesaEditada = {
        ...mesa,
        anchoCuadriculas: mesa.anchoCuadriculas || 2, // Valor por defecto si no existe
        altoCuadriculas: mesa.altoCuadriculas || 2, // Valor por defecto si no existe
      };
      showMesaMenu = true;
    };

    // Función para abrir el menú de edición
    const abrirMenuMesa = (id) => {
      const mesa = mesasIndividuales.value.find((m) => m.id === id);
      if (mesa) {
        mesaEditada.id = mesa.id;
        mesaEditada.estado = mesa.estado;
        mesaEditada.capacidad = mesa.capacidad;
        mesaEditada.forma = mesa.forma || "cuadrada";
        mesaEditada.anchoCuadriculas = mesa.anchoCuadriculas || 2;
        mesaEditada.altoCuadriculas = mesa.altoCuadriculas || 2;
        showMesaMenu.value = true;
      }
    };

    // Modificamos la función seleccionarMesaIndividual
    const seleccionarMesaIndividual = (id) => {
      grupoSeleccionado.value = null;
      if (mesasSeleccionadas.value.includes(id)) {
        mesasSeleccionadas.value = [];
        return;
      }
      mesasSeleccionadas.value = [id];
      // Quitamos la apertura automática del menú
    };

    const guardarCambiosMesa = () => {
      // Validar capacidad
      erroresEdit.capacidad = "";
      const minSize = 2;
      if (
        mesaEditada.anchoCuadriculas < minSize ||
        mesaEditada.altoCuadriculas < minSize
      ) {
        erroresEdit.tamano = `El tamaño mínimo es ${minSize}x${minSize} cuadrículas`;
        return;
      }
      if (!mesaEditada.capacidad || mesaEditada.capacidad < 2) {
        erroresEdit.capacidad = "La capacidad debe ser al menos 2 personas.";
        return;
      }

      // Buscar la mesa y actualizar
      const mesa = mesasIndividuales.value.find((m) => m.id === mesaEditada.id);
      if (mesa) {
        mesa.estado = mesaEditada.estado;
        mesa.capacidad = mesaEditada.capacidad;
        mesa.forma = mesaEditada.forma;
        mesa.anchoCuadriculas = mesaEditada.anchoCuadriculas;
        mesa.altoCuadriculas = mesaEditada.altoCuadriculas;
      }

      showMesaMenu.value = false;
    };
    const seleccionarGrupo = (id) => {
      mesasSeleccionadas.value = [];
      grupoSeleccionado.value = grupoSeleccionado.value === id ? null : id;
    };

    const esMesaOcupada = (mesa) =>
      mesa && mesa.estado === ESTADOS_MESA.OCUPADA;

    // Función para alternar las instrucciones
    const toggleInstructions = () => {
      showInstructions.value = !showInstructions.value;
    };

    // Información de la mesa seleccionada
    const mesaSeleccionadaInfo = computed(() => {
      if (mesasSeleccionadas.value.length !== 1) return {};
      const mesaId = mesasSeleccionadas.value[0];
      const mesa = mesasIndividuales.value.find((m) => m.id === mesaId);
      if (!mesa) return {};
      return { ...mesa }; // Devolver una copia para modificarla
    });

    // Función para actualizar el tamaño de la mesa
    const actualizarTamanoMesa = () => {
      if (mesasSeleccionadas.value.length !== 1) return;

      const mesaId = mesasSeleccionadas.value[0];
      const mesa = mesasIndividuales.value.find((m) => m.id === mesaId);

      if (!mesa) return;

      // Asegurar valores mínimos y máximos
      const ancho = Math.max(
        1,
        Math.min(8, mesaSeleccionadaInfo.value.anchoCuadriculas)
      );
      const alto = Math.max(
        1,
        Math.min(8, mesaSeleccionadaInfo.value.altoCuadriculas)
      );

      mesa.anchoCuadriculas = ancho;
      mesa.altoCuadriculas = alto;
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
      handleDrop: (event) => handleDropWrapper(event),
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
      showMesaMenu,
      mesaEditada,
      abrirMenuMesa,
      abrirEdicionMesa,
      erroresEdit,
      guardarCambiosMesa,
      showAddModal,
      nuevaMesa,
      errores,
      confirmarNuevaMesa,
      mesaSeleccionadaInfo,
      actualizarTamanoMesa,
    };
  },
}).mount("#app");
