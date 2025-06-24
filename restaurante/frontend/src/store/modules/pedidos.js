import { generarId } from '@/utils/helpers';

export default {
  // El 'namespaced: true' es crucial para poder llamar a las acciones y mutaciones
  // de forma organizada, ej: 'pedidos/crearPedido'
  namespaced: true,

  /**
   * El estado inicial del módulo.
   * Contiene el menú de platos y una lista para almacenar los pedidos.
   */
  state: () => ({
    // Menú de platos de ejemplo para "El patacón de Óscar"
    menu: [
      { id: 'p01', nombre: 'Patacón con Todo', precio: 8.50 },
      { id: 'p02', nombre: 'Ceviche de Pescado', precio: 7.00 },
      { id: 'p03', nombre: 'Seco de Gallina', precio: 6.50 },
      { id: 'p04', nombre: 'Bandera', precio: 9.00 },
      { id: 'p05', nombre: 'Encebollado', precio: 5.00 },
      { id: 'p06', nombre: 'Cola', precio: 1.00 },
      { id: 'p07', nombre: 'Jugo Natural', precio: 1.50 },
      { id: 'p08', nombre: 'Agua Aromática', precio: 0.75 },
    ],
    // Aquí se guardarán todos los pedidos completados de la sesión
    pedidos: []
  }),

  /**
   * Mutaciones: Las únicas funciones que pueden modificar el estado de forma directa.
   * Deben ser síncronas.
   */
  mutations: {
    /**
     * Añade un nuevo pedido al array de pedidos en el estado.
     * @param {object} state - El estado actual del módulo.
     * @param {object} pedido - El objeto de pedido a añadir.
     */
    ADD_PEDIDO(state, pedido) {
      state.pedidos.push(pedido);
    }
  },

  /**
   * Acciones: Pueden contener lógica asíncrona y llaman a las mutaciones
   * para efectuar cambios en el estado.
   */
  actions: {
    /**
     * Crea un objeto de pedido, lo guarda en el estado y lo devuelve.
     * @param {object} context - El contexto de la acción (incluye commit).
     * @param {object} payload - La información del pedido { items, total }.
     * @returns {object} El objeto del nuevo pedido creado, incluyendo su ID.
     */
    crearPedido({ commit }, { items, total }) {
      const nuevoPedido = {
        id: generarId('ord'), // Genera un ID único como 'ord-1672531200000-123'
        timestamp: new Date(),
        items, // El array de platos con sus cantidades
        total  // El costo total del pedido
      };
      
      // Llama a la mutación para guardar el pedido en el estado
      commit('ADD_PEDIDO', nuevoPedido);

      // Se devuelve el objeto completo para que el componente que llamó
      // a esta acción pueda obtener el ID del nuevo pedido.
      return nuevoPedido;
    }
  },

  /**
   * Getters: Permiten acceder a datos del estado, a menudo de forma computada.
   */
  getters: {
    /**
     * Devuelve el menú completo de platos.
     * @param {object} state - El estado actual del módulo.
     */
    getMenu: state => state.menu,

    /**
     * Permite buscar un pedido por su ID.
     * @param {object} state - El estado actual del módulo.
     */
    getPedidoById: state => (id) => {
      return state.pedidos.find(p => p.id === id);
    }
  }
};
