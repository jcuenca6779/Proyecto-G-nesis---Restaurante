import { ESTADOS_MESA } from "./estados.js";
import { ref } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

export const grupos = ref([]);

export function cambiarEstado(
  mesasIndividuales,
  mesasSeleccionadas,
  nuevoEstado
) {
  if (mesasSeleccionadas.value.length === 1) {
    const mesaId = mesasSeleccionadas.value[0];
    const mesa = mesasIndividuales.value.find((m) => m.id === mesaId);
    if (!mesa) return;

    if (
      mesa.estado === ESTADOS_MESA.OCUPADA &&
      nuevoEstado === ESTADOS_MESA.RESERVADA
    ) {
      alert(
        `La mesa ${mesa.id} está ocupada y no puede ser marcada como reservada`
      );
      return;
    }
    mesa.estado = nuevoEstado;
  }
}

export function unirMesas(
  mesa1,
  mesa2,
  mesasIndividuales,
  grupos,
  showUnionFeedback,
  mesasSeleccionadas
) {
  try {
    if (
      mesa1.estado !== ESTADOS_MESA.DISPONIBLE ||
      mesa2.estado !== ESTADOS_MESA.DISPONIBLE
    ) {
      alert("Solo se pueden unir mesas disponibles");
      return false;
    }

    const grupoId = "G" + Date.now().toString().slice(-3);
    const x = (mesa1.x + mesa2.x) / 2;
    const y = (mesa1.y + mesa2.y) / 2;

    const anchoTotal = Math.min(
      mesa1.anchoCuadriculas + mesa2.anchoCuadriculas,
      10
    );
    const altoTotal = Math.min(
      mesa1.altoCuadriculas + mesa2.altoCuadriculas,
      10
    );

    // Se crea el grupo con toda la información necesaria (incluyendo tamaño y forma)
    grupos.value.push({
      id: grupoId,
      mesas: [
        {
          id: mesa1.id,
          capacidad: mesa1.capacidad,
          anchoCuadriculas: mesa1.anchoCuadriculas,
          altoCuadriculas: mesa1.altoCuadriculas,
          forma: mesa1.forma,
        },
        {
          id: mesa2.id,
          capacidad: mesa2.capacidad,
          anchoCuadriculas: mesa2.anchoCuadriculas,
          altoCuadriculas: mesa2.altoCuadriculas,
          forma: mesa2.forma,
        },
      ],
      capacidadTotal: mesa1.capacidad + mesa2.capacidad,
      estado: mesa1.estado,
      x: x,
      y: y,
      anchoCuadriculas: anchoTotal,
      altoCuadriculas: altoTotal,
    });

    mesasIndividuales.value = mesasIndividuales.value.filter(
      (mesa) => mesa.id !== mesa1.id && mesa.id !== mesa2.id
    );

    showUnionFeedback.value = true;
    setTimeout(() => (showUnionFeedback.value = false), 1200);
    mesasSeleccionadas.value = [];

    return true;
  } catch (error) {
    console.error("Error al unir mesas:", error);
    alert(
      "Ocurrió un error al intentar unir las mesas. Por favor, inténtalo de nuevo."
    );
    return false;
  }
}

export function separarGrupoSeleccionado(
  grupos,
  grupoSeleccionado,
  mesasIndividuales,
  mapWidth,
  mapHeight
) {
  const grupo = grupos.value.find((g) => g.id === grupoSeleccionado.value);
  if (!grupo) return;
  const radio = 100;
  const anguloBase = (2 * Math.PI) / grupo.mesas.length;
  grupo.mesas.forEach((mesaData, index) => {
    const anguloRad = anguloBase * index;
    mesasIndividuales.value.push({
      id: mesaData.id,
      estado: grupo.estado,
      capacidad: mesaData.capacidad,
      forma: mesaData.forma,
      // Propiedades de tamaño corregidas
      anchoCuadriculas: mesaData.anchoCuadriculas,
      altoCuadriculas: mesaData.altoCuadriculas,
      x: Math.max(
        0,
        Math.min(mapWidth - 90, grupo.x + Math.cos(anguloRad) * radio)
      ),
      y: Math.max(
        0,
        Math.min(mapHeight - 90, grupo.y + Math.sin(anguloRad) * radio)
      ),
    });
  });
  grupos.value = grupos.value.filter((g) => g.id !== grupoSeleccionado.value);
  grupoSeleccionado.value = null;
}

export function unirMesaAGrupo(
  mesa,
  grupo,
  mesasIndividuales,
  grupos,
  showUnionFeedback,
  mesasSeleccionadas
) {
  if (mesa.estado !== ESTADOS_MESA.DISPONIBLE) {
    alert("Solo se pueden unir mesas disponibles a un grupo");
    return;
  }

  // Clonar la mesa antes de agregarla al grupo
  const mesaClonada = {
    ...mesa,
    grupoId: grupo.id,
  };

  grupo.mesas.push(mesaClonada);
  grupo.capacidadTotal += mesa.capacidad;

  mesasIndividuales.value = mesasIndividuales.value.filter(
    (m) => m.id !== mesa.id
  );

  showUnionFeedback.value = true;
  setTimeout(() => (showUnionFeedback.value = false), 2000);

  mesasSeleccionadas.value = [];

  return true;
}
