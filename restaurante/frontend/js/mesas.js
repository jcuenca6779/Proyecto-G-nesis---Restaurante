import { ESTADOS_MESA } from "./estados.js";
import { ref } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

// Declarar grupos como un array reactivo
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

// Función para unir mesas
export function unirMesas(
  mesa1,
  mesa2,
  mesasIndividuales,
  grupos,
  showUnionFeedback
) {
  // Verificar que ambas mesas estén disponibles
  if (
    mesa1.estado !== ESTADOS_MESA.DISPONIBLE ||
    mesa2.estado !== ESTADOS_MESA.DISPONIBLE
  ) {
    alert("Solo se pueden unir mesas disponibles");
    return false;
  }

  // Crear el grupo (posición promedio de las mesas)
  const grupoId = "G" + Date.now().toString().slice(-3);
  const x = (mesa1.x + mesa2.x) / 2;
  const y = (mesa1.y + mesa2.y) / 2;

  grupos.value.push({
    id: grupoId,
    mesas: [
      { id: mesa1.id, capacidad: mesa1.capacidad },
      { id: mesa2.id, capacidad: mesa2.capacidad },
    ],
    capacidadTotal: mesa1.capacidad + mesa2.capacidad,
    estado: mesa1.estado,
    x: x,
    y: y,
    width: 200,
    height: 250,
  });

  // Eliminar las mesas individuales
  mesasIndividuales.value = mesasIndividuales.value.filter(
    (mesa) => mesa.id !== mesa1.id && mesa.id !== mesa2.id
  );

  // Mostrar feedback visual
  showUnionFeedback.value = true;
  setTimeout(() => (showUnionFeedback.value = false), 1200);
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
  showUnionFeedback
) {
  if (mesa.estado !== ESTADOS_MESA.DISPONIBLE) {
    alert("Solo se pueden unir mesas disponibles a un grupo");
    return;
  }
  // Añadir la mesa al grupo
  grupo.mesas.push({ id: mesa.id, capacidad: mesa.capacidad });
  grupo.capacidadTotal += mesa.capacidad;

  // Eliminar la mesa individual
  mesasIndividuales.value = mesasIndividuales.value.filter(
    (m) => m.id !== mesa.id
  );
  // Mostrar feedback visual
  showUnionFeedback.value = true;
  setTimeout(() => (showUnionFeedback.value = false), 2000);

  return true;
}