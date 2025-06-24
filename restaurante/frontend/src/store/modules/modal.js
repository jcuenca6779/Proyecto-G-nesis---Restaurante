export default {
  namespaced: true,
  state: () => ({
    show: false,
    type: null // 'addMesa', 'editMesa', 'instructions'
  }),
  mutations: {
    SET_SHOW(state, value) {
      state.show = value
    },
    SET_TYPE(state, type) {
      state.type = type
    }
  }
}