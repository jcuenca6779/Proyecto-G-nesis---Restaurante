import { ESTADOS_MESA, COLORES_ESTADO } from './constants'

export const obtenerColor = (estado) => {
  return COLORES_ESTADO[estado] || "#95a5a6"
}

export const calcularEstadisticas = (mesas, grupos) => {
  let disponibles = 0,
    ocupadas = 0,
    reservadas = 0,
    capacidadTotal = 0,
    gruposCount = grupos.length

  // Procesar mesas individuales
  mesas.forEach(mesa => {
    if (mesa.estado === ESTADOS_MESA.DISPONIBLE) disponibles++
    else if (mesa.estado === ESTADOS_MESA.OCUPADA) ocupadas++
    else if (mesa.estado === ESTADOS_MESA.RESERVADA) reservadas++
    
    capacidadTotal += mesa.capacidad
  })

  // Procesar grupos
  grupos.forEach(grupo => {
    if (grupo.estado === ESTADOS_MESA.DISPONIBLE) disponibles++
    else if (grupo.estado === ESTADOS_MESA.OCUPADA) ocupadas++
    else if (grupo.estado === ESTADOS_MESA.RESERVADA) reservadas++
    
    capacidadTotal += grupo.capacidadTotal
  })

  return {
    disponibles,
    ocupadas,
    reservadas,
    grupos: gruposCount,
    capacidadTotal
  }
}

// Función para generar IDs únicos
export const generarId = (prefix = '') => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}