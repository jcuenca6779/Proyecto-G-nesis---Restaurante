import { ESTADOS_MESA } from '@/utils/constants';
import { generarId } from '@/utils/helpers';

const crearPiso = (id, nombre) => ({
  id,
  nombre,
  mesas: id === 1 ? [
    { id: 1, capacidad: 4, estado: 'disponible', forma: 'cuadrada', anchoCuadriculas: 3, altoCuadriculas: 3, x: 50, y: 50, pedidoId: null },
    { id: 2, capacidad: 2, estado: 'ocupada', forma: 'redonda', anchoCuadriculas: 2, altoCuadriculas: 2, x: 200, y: 50, pedidoId: null },
    { id: 3, capacidad: 6, estado: 'reservada', forma: 'rectangular', anchoCuadriculas: 4, altoCuadriculas: 2, x: 350, y: 50, pedidoId: null }
  ] : [],
  grupos: [],
  elementosDecorativos: id === 1 ? [
    
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
    // === NUEVA MUTACIÓN ===
    DELETE_PISO(state, pisoId) {
        state.pisos = state.pisos.filter(p => p.id !== pisoId);
    },
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
    ASIGNAR_PEDIDO_A_MESA(state, { pisoId, mesaId, pedidoId }) {
        const piso = state.pisos.find(p => p.id === pisoId);
        if (piso) {
            const mesa = piso.mesas.find(m => m.id === mesaId);
            if (mesa) {
                mesa.pedidoId = pedidoId;
                // Al asignar un pedido, la mesa pasa a estar ocupada
                mesa.estado = 'ocupada';
            }
        }
    },
    SET_EDITED_MESA(state, mesa) { state.mesaEditada = mesa; },
    ASIGNAR_PEDIDO(state, { pisoId, targetId, pedidoId, isGroup }) {
        const piso = state.pisos.find(p => p.id === pisoId);
        if (!piso) return;
        const targetList = isGroup ? piso.grupos : piso.mesas;
        const target = targetList.find(t => t.id === targetId);
        if (target) {
            target.pedidoId = pedidoId;
            target.estado = ESTADOS_MESA.OCUPADA;
        }
    },
    LIBERAR_MESA_O_GRUPO(state, { pisoId, targetId, isGroup }) {
        const piso = state.pisos.find(p => p.id === pisoId);
        if (!piso) return;
        const targetList = isGroup ? piso.grupos : piso.mesas;
        const target = targetList.find(t => t.id === targetId);
        if (target) {
            target.pedidoId = null;
            target.estado = ESTADOS_MESA.DISPONIBLE;
        }
    },
  },

  actions: {
    eliminarPiso({ commit, state }, pisoId) {
        // === LÓGICA DE PROTECCIÓN AÑADIDA ===
        if (pisoId === 1) {
            alert('El Piso 1 es el principal y no se puede eliminar.');
            return; // Detiene la ejecución de la acción
        }
        if (state.pisos.length <= 1) {
            alert('No se puede eliminar el único piso existente.');
            return;
        }
        if (confirm(`¿Está seguro de que desea eliminar el ${state.pisos.find(p=>p.id === pisoId)?.nombre}? Esta acción es irreversible.`)) {
            commit('DELETE_PISO', pisoId);
            if (state.pisoActivoId === pisoId) {
                commit('SET_PISO_ACTIVO', state.pisos[0]?.id || null);
            }
        }
    },
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
        if (mesa1.estado !== ESTADOS_MESA.DISPONIBLE || mesa2.estado !== ESTADOS_MESA.DISPONIBLE) {
            alert('Solo se pueden unir mesas que estén disponibles.');
            return;
        }

        const pisoId = state.pisoActivoId;
        const nuevoGrupo = {
            id: generarId('grupo'),
            mesas: [mesa1, mesa2],
            capacidadTotal: mesa1.capacidad + mesa2.capacidad,
            // === CORRECCIÓN: El estado inicial de un grupo ahora es 'disponible' ===
            estado: ESTADOS_MESA.DISPONIBLE,
            // Se añade pedidoId nulo por consistencia
            pedidoId: null,
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
    asignarPedido({ commit, state }, { targetId, pedidoId, isGroup }) {
        commit('ASIGNAR_PEDIDO', { pisoId: state.pisoActivoId, targetId, pedidoId, isGroup });
    },

    liberarMesaOGrupo({ commit, state }, { targetId, isGroup }) {
        commit('LIBERAR_MESA_O_GRUPO', { pisoId: state.pisoActivoId, targetId, isGroup });
    },
    
    // ACCIONES CON NUEVAS REGLAS DE NEGOCIO
    deleteMesa({ commit, state, getters }, mesaId) {
        const mesa = getters.mesaById(mesaId);
        if (mesa && mesa.pedidoId) {
            alert('No se puede eliminar una mesa con un pedido activo.');
            return;
        }
        commit('DELETE_MESA', { pisoId: state.pisoActivoId, mesaId });
        commit('SET_SELECTED_MESAS', []);
    },

    updateMesa({ commit, state, getters }, mesaActualizada) {
        const mesaOriginal = getters.mesaById(mesaActualizada.id);
        if (mesaOriginal.pedidoId && mesaOriginal.estado !== mesaActualizada.estado) {
            alert('No se puede cambiar el estado de una mesa con un pedido activo.');
            return;
        }
        if (mesaOriginal.estado === 'ocupada' && mesaActualizada.estado === 'reservada') {
            alert('Una mesa ocupada no puede ser marcada como reservada.');
            return;
        }
        commit('UPDATE_MESA', { pisoId: state.pisoActivoId, mesaActualizada });
    },

    separarGrupo({ commit, state, getters }, grupoId) {
        const grupo = getters.grupoById(grupoId);
        if (grupo && grupo.pedidoId) {
            alert('No se puede separar un grupo con un pedido activo.');
            return;
        }
        if (!grupo) return;
        grupo.mesas.forEach(mesa => {
            commit('ADD_MESA', { pisoId: state.pisoActivoId, mesa: { ...mesa, estado: 'disponible', pedidoId: null } });
        });
        commit('DELETE_GRUPO', { pisoId: state.pisoActivoId, grupoId });
        commit('SET_SELECTED_GROUP', null);
    },
  }
};