import { COLORES_ESTADO } from "./estados.js";

export function obtenerColor(estado) {
  return COLORES_ESTADO[estado] || "#95a5a6";
}
