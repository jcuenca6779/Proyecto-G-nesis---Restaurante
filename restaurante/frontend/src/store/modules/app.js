export default {
  namespaced: true,
  state: () => ({
    elementosDecorativos: []
  }),
  mutations: {
    SET_DECORACION(state, elementos) {
      state.elementosDecorativos = elementos;
    },
    ADD_ELEMENTO_DECORATIVO(state, elemento) {
      state.elementosDecorativos.push(elemento);
    },
    UPDATE_ELEMENTO_DECORATIVO(state, { id, updates }) {
      const index = state.elementosDecorativos.findIndex(el => el.id === id);
      if (index !== -1) {
        state.elementosDecorativos[index] = {
          ...state.elementosDecorativos[index],
          ...updates
        };
      }
    },
    DELETE_ELEMENTO_DECORATIVO(state, id) {
      state.elementosDecorativos = state.elementosDecorativos.filter(el => el.id !== id);
    }
  },
  actions: {
    agregarElemento({ commit }, elemento) {
      commit('ADD_ELEMENTO_DECORATIVO', {
        ...elemento,
        id: Date.now().toString()
      });
    },
    actualizarElemento({ commit }, { id, updates }) {
      commit('UPDATE_ELEMENTO_DECORATIVO', { id, updates });
    },
    eliminarElemento({ commit }, id) {
      commit('DELETE_ELEMENTO_DECORATIVO', id);
    }
  },
  getters: {
    elementos: state => state.elementosDecorativos,
    elementoById: state => id => {
      return state.elementosDecorativos.find(el => el.id === id);
    }
  }
};