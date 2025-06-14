// utilidades.js
import { ESTADOS_MESA } from "./estados.js";

export function obtenerColor(estado) {
  switch (estado) {
    case ESTADOS_MESA.DISPONIBLE:
      return '#2ecc71';
    case ESTADOS_MESA.OCUPADA:
      return '#e74c3c';
    case ESTADOS_MESA.RESERVADA:
      return '#f1c40f';
    default:
      return '#95a5a6';
  }
}