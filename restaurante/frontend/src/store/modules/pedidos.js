import { generarId } from '@/utils/helpers';

export default {
  namespaced: true,
  state: () => ({
    menu: [
      { id: 'p01', nombre: 'Patacón con Todo', precio: 8.50 },
      { id: 'p02', nombre: 'Ceviche de Pescado', precio: 7.00 },
      { id: 'p03', nombre: 'Seco de Gallina', precio: 6.50 },
      { id: 'p04', nombre: 'Bandera', precio: 9.00 },
      { id: 'p05', nombre: 'Encebollado', precio: 5.00 },
      { id: 'p06', nombre: 'Cola', precio: 1.00 },
      { id: 'p07', nombre: 'Jugo Natural', precio: 1.50 },
    ],
    pedidos: []
  }),
  mutations: {
    ADD_PEDIDO(state, pedido) {
      state.pedidos.push(pedido);
    },
    UPDATE_PEDIDO(state, { pedidoId, updates }) {
        const pedido = state.pedidos.find(p => p.id === pedidoId);
        if (pedido) {
            Object.assign(pedido, updates);
        }
    }
  },
  actions: {
    crearPedido({ commit }, { items, total }) {
      const nuevoPedido = {
        id: generarId('ord'),
        timestamp: new Date(),
        items,
        total
      };
      commit('ADD_PEDIDO', nuevoPedido);
      return nuevoPedido;
    },
    actualizarPedido({ commit }, { pedidoId, updates }) {
        commit('UPDATE_PEDIDO', { pedidoId, updates });
    }
  },
  getters: {
    getMenu: state => state.menu,
    getPedidoById: state => (id) => state.pedidos.find(p => p.id === id)
  }
};
