import { ESTADOS_MESA } from '@/utils/constants';
import { generarId } from '@/utils/helpers';

const crearPiso = (id, nombre) => ({
  id,
  nombre,
  mesas: id === 1 ? [
    { id: 1, capacidad: 4, estado: 'disponible', forma: 'cuadrada', anchoCuadriculas: 3, altoCuadriculas: 3, x: 50, y: 50 },
    { id: 2, capacidad: 2, estado: 'ocupada', forma: 'redonda', anchoCuadriculas: 2, altoCuadriculas: 2, x: 200, y: 50 },
    { id: 3, capacidad: 6, estado: 'reservada', forma: 'rectangular', anchoCuadriculas: 4, altoCuadriculas: 2, x: 350, y: 50 }
  ] : [],
  grupos: [],
  elementosDecorativos: id === 1 ? [
    { id: 'p1', tipo: 'pared', x: 0, y: 0, width: 1290, height: 20, color: '#a9a9a9' },
    { id: 'p2', tipo: 'pared', x: 0, y: 875, width: 1290, height: 20, color: '#a9a9a9' },
    { id: 'p3', tipo: 'pared', x: 0, y: 0, width: 20, height: 895, color: '#a9a9a9' },
    { id: 'p4', tipo: 'pared', x: 1270, y: 0, width: 20, height: 895, color: '#a9a9a9' }
  ] : [],
  mesasSeleccionadas: [],
  grupoSeleccionado: null,
});

export default {
  namespaced: true,
  state: () => ({
    pisos: [crearPiso(1, 'Piso 1')],
    pisoActivoId: 1,
    mesaEditada: null,
  }),

  getters: {
    pisoActivo: state => state.pisos.find(p => p.id === state.pisoActivoId),
    mesasDelPisoActivo: (state, getters) => getters.pisoActivo ? getters.pisoActivo.mesas : [],
    gruposDelPisoActivo: (state, getters) => getters.pisoActivo ? getters.pisoActivo.grupos : [],
    decoracionDelPisoActivo: (state, getters) => getters.pisoActivo ? getters.pisoActivo.elementosDecorativos : [],
    mesasSeleccionadas: (state, getters) => getters.pisoActivo ? getters.pisoActivo.mesasSeleccionadas : [],
    grupoSeleccionado: (state, getters) => getters.pisoActivo ? getters.pisoActivo.grupoSeleccionado : null,
    mesaById: (state, getters) => (id) => getters.mesasDelPisoActivo.find(mesa => mesa.id === id),
    grupoById: (state, getters) => (id) => getters.gruposDelPisoActivo.find(grupo => grupo.id === id)
  },

  mutations: {
    SET_PISO_ACTIVO(state, pisoId) { state.pisoActivoId = pisoId; },
    ADD_PISO(state, nuevoPiso) { state.pisos.push(nuevoPiso); },
    SET_SELECTED_MESAS(state, ids) {
        const piso = state.pisos.find(p => p.id === state.pisoActivoId);
        if (piso) piso.mesasSeleccionadas = ids;
    },
    SET_SELECTED_GROUP(state, id) {
        const piso = state.pisos.find(p => p.id === state.pisoActivoId);
        if (piso) piso.grupoSeleccionado = id;
    },
    ADD_MESA(state, { pisoId, mesa }) {
        const piso = state.pisos.find(p => p.id === pisoId);
        if (piso) piso.mesas.push(mesa);
    },
    DELETE_MESA(state, { pisoId, mesaId }) {
        const piso = state.pisos.find(p => p.id === pisoId);
        if (piso) piso.mesas = piso.mesas.filter(m => m.id !== mesaId);
    },
    UPDATE_MESA(state, { pisoId, mesaActualizada }) {
        const piso = state.pisos.find(p => p.id === pisoId);
        if (piso) {
            const index = piso.mesas.findIndex(m => m.id === mesaActualizada.id);
            if (index !== -1) piso.mesas[index] = mesaActualizada;
        }
    },
    UPDATE_MESA_POSITION(state, { pisoId, id, x, y }) {
        const piso = state.pisos.find(p => p.id === pisoId);
        const mesa = piso?.mesas.find(m => m.id === id);
        if (mesa) { mesa.x = x; mesa.y = y; }
    },
    ADD_GRUPO(state, { pisoId, grupo }) {
        const piso = state.pisos.find(p => p.id === pisoId);
        if (piso) piso.grupos.push(grupo);
    },
    DELETE_GRUPO(state, { pisoId, grupoId }) {
        const piso = state.pisos.find(p => p.id === pisoId);
        if (piso) piso.grupos = piso.grupos.filter(g => g.id !== grupoId);
    },
    UPDATE_GRUPO_POSITION(state, { pisoId, id, x, y }) {
        const piso = state.pisos.find(p => p.id === pisoId);
        const grupo = piso?.grupos.find(g => g.id === id);
        if (grupo) { grupo.x = x; grupo.y = y; }
    },
    UPDATE_GRUPO(state, { pisoId, grupoActualizado }) {
        const piso = state.pisos.find(p => p.id === pisoId);
        if (piso) {
            const index = piso.grupos.findIndex(g => g.id === grupoActualizado.id);
            if (index !== -1) piso.grupos[index] = grupoActualizado;
        }
    },
    SET_EDITED_MESA(state, mesa) { state.mesaEditada = mesa; },
  },

  actions: {
    cambiarPiso({ commit }, pisoId) {
      commit('SET_PISO_ACTIVO', pisoId);
      commit('SET_SELECTED_MESAS', []);
      commit('SET_SELECTED_GROUP', null);
    },
    agregarPiso({ commit, state }) {
      const nuevoId = state.pisos.length > 0 ? Math.max(...state.pisos.map(p => p.id)) + 1 : 1;
      const nuevoPiso = crearPiso(nuevoId, `Piso ${nuevoId}`);
      commit('ADD_PISO', nuevoPiso);
      commit('SET_PISO_ACTIVO', nuevoId);
    },
    addMesa({ commit, state }, mesa) {
        commit('ADD_MESA', { pisoId: state.pisoActivoId, mesa });
    },
    deleteMesa({ commit, state }, mesaId) {
        commit('DELETE_MESA', { pisoId: state.pisoActivoId, mesaId });
        commit('SET_SELECTED_MESAS', []);
    },
    updateMesa({ commit, state }, mesaActualizada) {
        commit('UPDATE_MESA', { pisoId: state.pisoActivoId, mesaActualizada });
    },
    unirMesas({ commit, state }, { mesa1, mesa2, showUnionFeedback }) {
        // === CORRECCIÓN 1: Validación de estado de las mesas ===
        if (mesa1.estado !== ESTADOS_MESA.DISPONIBLE || mesa2.estado !== ESTADOS_MESA.DISPONIBLE) {
            alert('Solo se pueden unir mesas que estén disponibles.');
            return;
        }

        const pisoId = state.pisoActivoId;
        const nuevoGrupo = {
            id: generarId('grupo'),
            mesas: [mesa1, mesa2],
            capacidadTotal: mesa1.capacidad + mesa2.capacidad,
            // === CORRECCIÓN 2: El estado inicial del grupo ahora es 'ocupado' ===
            estado: ESTADOS_MESA.OCUPADA, 
            x: (mesa1.x + mesa2.x) / 2,
            y: (mesa1.y + mesa2.y) / 2,
            anchoCuadriculas: Math.min(mesa1.anchoCuadriculas + mesa2.anchoCuadriculas, 10),
            altoCuadriculas: Math.min(mesa1.altoCuadriculas + mesa2.altoCuadriculas, 10)
        };
        commit('ADD_GRUPO', { pisoId, grupo: nuevoGrupo });
        commit('DELETE_MESA', { pisoId, mesaId: mesa1.id });
        commit('DELETE_MESA', { pisoId, mesaId: mesa2.id });
        commit('SET_SELECTED_MESAS', []);

        if (showUnionFeedback) {
            showUnionFeedback.value = true;
            setTimeout(() => (showUnionFeedback.value = false), 2000);
        }
    },
    unirMesaAGrupo({ commit, state, getters }, { mesa, grupo, showUnionFeedback }) {
        // === CORRECCIÓN 1: Validación de estado de la mesa a unir ===
        if (mesa.estado !== ESTADOS_MESA.DISPONIBLE) {
            alert('Solo se pueden unir mesas que estén disponibles.');
            return;
        }

        const pisoId = state.pisoActivoId;
        const grupoDelPiso = getters.grupoById(grupo.id);
        if (!grupoDelPiso) return;
        
        const grupoActualizado = { ...grupoDelPiso };
        grupoActualizado.mesas.push(mesa);
        grupoActualizado.capacidadTotal += mesa.capacidad;

        commit('UPDATE_GRUPO', { pisoId, grupoActualizado });
        commit('DELETE_MESA', { pisoId, mesaId: mesa.id });
        commit('SET_SELECTED_MESAS', []);

        if (showUnionFeedback) {
            showUnionFeedback.value = true;
            setTimeout(() => (showUnionFeedback.value = false), 2000);
        }
    },
    separarGrupo({ commit, state, getters }, grupoId) {
        const pisoId = state.pisoActivoId;
        const grupo = getters.grupoById(grupoId);
        if (!grupo) return;

        grupo.mesas.forEach(mesa => {
            const mesaCompleta = { ...mesa, estado: ESTADOS_MESA.DISPONIBLE };
            commit('ADD_MESA', { pisoId, mesa: mesaCompleta });
        });

        commit('DELETE_GRUPO', { pisoId, grupoId });
        commit('SET_SELECTED_GROUP', null);
    },
    updateMesaPosition({ commit, state }, { id, x, y }) {
        commit('UPDATE_MESA_POSITION', { pisoId: state.pisoActivoId, id, x, y });
    },
    updateGrupoPosition({ commit, state }, { id, x, y }) {
        commit('UPDATE_GRUPO_POSITION', { pisoId: state.pisoActivoId, id, x, y });
    },
  }
};