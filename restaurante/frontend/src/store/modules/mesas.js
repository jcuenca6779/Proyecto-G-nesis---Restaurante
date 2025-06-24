// src/store/modules/mesas.js
import { ESTADOS_MESA } from '@/utils/constants'
import { generarId } from '@/utils/helpers'

export default {
  namespaced: true,
  // Getters para acceder a las mesas
  getters: {
    mesasIndividuales: state => state.mesasIndividuales,
    mesasSeleccionadas: state => state.mesasSeleccionadas,
    nuevaMesa: state => state.nuevaMesa,
    mesaEditada: state => state.mesaEditada,
    mesaById: (state) => (id) => {
    return state.mesasIndividuales.find(mesa => mesa.id === id);
  }
},
  // Estado inicial de las mesas
  state: () => ({
  mesasIndividuales: [
    {
      id: 1,
      capacidad: 4,
      estado: ESTADOS_MESA.DISPONIBLE,
      forma: 'cuadrada',
      anchoCuadriculas: 3,
      altoCuadriculas: 3,
      x: 50,  // <-- Coordenada X añadida
      y: 50   // <-- Coordenada Y añadida
    },
    {
      id: 2,
      capacidad: 2,
      estado: ESTADOS_MESA.OCUPADA,
      forma: 'redonda',
      anchoCuadriculas: 2,
      altoCuadriculas: 2,
      x: 200, // <-- Coordenada X añadida
      y: 50   // <-- Coordenada Y añadida
    },
    {
      id: 3,
      capacidad: 6,
      estado: ESTADOS_MESA.RESERVADA,
      forma: 'rectangular',
      anchoCuadriculas: 4,
      altoCuadriculas: 2,
      x: 350, // <-- Coordenada X añadida
      y: 50   // <-- Coordenada Y añadida
    }
  ],
  mesasSeleccionadas: [],
  nuevaMesa: {
    id: null,
    capacidad: 4,
    estado: ESTADOS_MESA.DISPONIBLE,
    forma: 'cuadrada',
    anchoCuadriculas: 3,
    altoCuadriculas: 3
  },
  mesaEditada: {
    id: null,
    estado: '',
    capacidad: 4,
    forma: 'cuadrada',
    anchoCuadriculas: 3,
    altoCuadriculas: 3
  }
}),
  mutations: {
  ADD_MESA(state, mesa) {
    state.mesasIndividuales.push(mesa)
  },
  UPDATE_MESA(state, mesa) { // La mutación ya está bien
  const index = state.mesasIndividuales.findIndex(m => m.id === mesa.id)
  if (index !== -1) {
    // CORRECCIÓN: Asegúrate de reemplazar todo el objeto
    state.mesasIndividuales[index] = mesa;
  }
},
  UPDATE_MESA_POSITION(state, payload) {
      const index = state.mesasIndividuales.findIndex(m => m.id === payload.id);
      if (index !== -1) {
        state.mesasIndividuales.splice(index, 1, {
          ...state.mesasIndividuales[index],
          x: payload.x,
          y: payload.y
        });
      }
    },
  DELETE_MESA(state, id) {
    state.mesasIndividuales = state.mesasIndividuales.filter(m => m.id !== id)
  },
  SET_SELECTED_MESAS(state, ids) {
    state.mesasSeleccionadas = ids
  },
  SET_NEW_MESA(state, mesa) {
    state.nuevaMesa = mesa
  },
  SET_EDITED_MESA(state, mesa) {
    state.mesaEditada = mesa
  },
  SET_MESAS_INITIAL(state, mesas) {
      state.mesasIndividuales = [...mesas]; // Usar spread para reactividad
    },
},
 actions: {
    // Esta acción ya la tenías
    async unirMesas({ commit, state, dispatch }, { mesa1, mesa2, showUnionFeedback }) {
      if (mesa1.estado !== ESTADOS_MESA.DISPONIBLE || mesa2.estado !== ESTADOS_MESA.DISPONIBLE) { //
        alert('Solo se pueden unir mesas disponibles') //
        return
      }
      try {
        const grupoId = generarId('grupo') //
        const nuevoGrupo = {
          id: grupoId,
          mesas: [mesa1, mesa2],
          capacidadTotal: mesa1.capacidad + mesa2.capacidad,
          estado: ESTADOS_MESA.DISPONIBLE, //
          x: (mesa1.x + mesa2.x) / 2,
          y: (mesa1.y + mesa2.y) / 2,
          anchoCuadriculas: Math.min(mesa1.anchoCuadriculas + mesa2.anchoCuadriculas, 10), //
          altoCuadriculas: Math.min(mesa1.altoCuadriculas + mesa2.altoCuadriculas, 10) //
        }
        commit('DELETE_MESA', mesa1.id) //
        commit('DELETE_MESA', mesa2.id) //
        commit('grupos/ADD_GRUPO', nuevoGrupo, { root: true }) //
        showUnionFeedback.value = true //
        setTimeout(() => (showUnionFeedback.value = false), 2000) //
        return true
      } catch (error) {
        console.error('Error al unir mesas:', error) //
        alert('Ocurrió un error al unir las mesas') //
        return false
      }
    },

    // --- ACCIONES QUE FALTABAN ---
    
    // Acción para añadir la nueva mesa
    addMesa({ commit }, nuevaMesa) {
  commit('ADD_MESA', nuevaMesa);
},

    // Acción para eliminar una mesa
    deleteMesa({ commit }, mesaId) {
      commit('DELETE_MESA', mesaId);
      commit('SET_SELECTED_MESAS', []);
    },

    // Acción para actualizar una mesa (la necesitarás para el formulario de edición)
    updateMesa({ commit }, mesaActualizada) {
  commit('UPDATE_MESA', mesaActualizada);
}
  }
}