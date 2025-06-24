import { ESTADOS_MESA } from "@/utils/constants";

export default {
  namespaced: true,
  getters: {
    // Añadir esta sección de getters
    grupoById: (state) => (id) => {
      return state.grupos.find((grupo) => grupo.id === id);
    },
  },
  state: () => ({
    grupos: [],
    grupoSeleccionado: null,
  }),
  mutations: {
    ADD_GRUPO(state, grupo) {
      state.grupos.push(grupo);
    },
    UPDATE_GRUPO_POSITION(state, { id, x, y }) {
      const grupo = state.grupos.find((g) => g.id === id);
      if (grupo) {
        grupo.x = x;
        grupo.y = y;
      }
    },
    DELETE_GRUPO(state, id) {
      state.grupos = state.grupos.filter((g) => g.id !== id);
    },
    SET_SELECTED_GROUP(state, id) {
      state.grupoSeleccionado = id;
    },
  },
  actions: {
    unirMesaAGrupo({ commit, state }, { mesa, grupo, showUnionFeedback }) {
      if (mesa.estado !== ESTADOS_MESA.DISPONIBLE) {
        alert("Solo se pueden unir mesas disponibles");
        return;
      }

      const grupoState = state.grupos.find((g) => g.id === grupo.id);
      if (!grupoState) {
        alert("Grupo no encontrado");
        return;
      }

      if (grupoState.mesas.some((m) => m.id === mesa.id)) {
        alert("Esta mesa ya pertenece al grupo.");
        return;
      }

      // Actualizar datos del grupo
      grupoState.capacidadTotal =
        (grupoState.capacidadTotal || 0) + mesa.capacidad;
      grupoState.anchoCuadriculas = Math.min(
        (grupoState.anchoCuadriculas || 0) + mesa.anchoCuadriculas,
        10
      );
      grupoState.altoCuadriculas = Math.min(
        (grupoState.altoCuadriculas || 0) + mesa.altoCuadriculas,
        10
      );

      // Guardar la información completa de la mesa en el grupo
      grupoState.mesas = grupoState.mesas || [];
      grupoState.mesas.push({
        id: mesa.id,
        capacidad: mesa.capacidad,
        anchoCuadriculas: mesa.anchoCuadriculas,
        altoCuadriculas: mesa.altoCuadriculas,
        forma: mesa.forma,
        estado: mesa.estado,
        x: mesa.x,
        y: mesa.y,
      });

      // --- CORRECCIÓN CRÍTICA ---
      // Esta línea asegura que la mutación para BORRAR la mesa individual
      // se ejecute en el módulo correcto ('mesas'). El { root: true } es esencial.
      commit("mesas/DELETE_MESA", mesa.id, { root: true });
      commit("mesas/SET_SELECTED_MESAS", [], { root: true });
      commit("UPDATE_GRUPO_POSITION", {
        id: grupoState.id,
        x: grupo.x,
        y: grupo.y,
      });

      if (showUnionFeedback) {
        showUnionFeedback.value = true;
        // Corregimos el nombre de la variable a "showUnionFeedback"
        setTimeout(() => (showUnionFeedback.value = false), 2000);
      }
    },
    separarGrupo({ commit, state }, grupoId) {
      const grupo = state.grupos.find((g) => g.id === grupoId);
      if (!grupo || !grupo.mesas) return;

      grupo.mesas.forEach((mesa) => {
        const mesaCompleta = {
          ...mesa,
          estado: ESTADOS_MESA.DISPONIBLE,
        };
        commit("mesas/ADD_MESA", mesaCompleta, { root: true });
      });

      commit("DELETE_GRUPO", grupoId);
    },
  },
};
