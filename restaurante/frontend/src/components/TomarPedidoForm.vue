<template>
  <div class="pedido-form">
    <h2>Tomar Pedido para Mesa {{ mesaId }}</h2>
    <div class="menu-items">
      <div v-for="item in menu" :key="item.id" class="menu-item">
        <span>{{ item.nombre }} - ${{ item.precio.toFixed(2) }}</span>
        <div class="quantity-selector">
          <button @click="changeQuantity(item.id, -1)">-</button>
          <input type="text" :value="getQuantity(item.id)" readonly>
          <button @click="changeQuantity(item.id, 1)">+</button>
        </div>
      </div>
    </div>
    <div class="pedido-summary">
      <strong>Total: ${{ totalPedido.toFixed(2) }}</strong>
    </div>
    <div class="form-actions">
      <button @click="confirmarPedido" class="btn-guardar" :disabled="totalPedido === 0">Confirmar Pedido</button>
      <button @click="closeModal" class="btn-cancelar">Cancelar</button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const pedidoActual = ref({}); // { itemId: cantidad }

    const mesaId = computed(() => store.getters['pisos/mesasSeleccionadas'][0]);
    const menu = computed(() => store.getters['pedidos/getMenu']);

    const getQuantity = (itemId) => pedidoActual.value[itemId] || 0;

    const changeQuantity = (itemId, change) => {
      const currentQty = getQuantity(itemId);
      const newQty = Math.max(0, currentQty + change); // No permitir cantidades negativas
      if (newQty === 0) {
        delete pedidoActual.value[itemId];
      } else {
        pedidoActual.value[itemId] = newQty;
      }
    };

    const totalPedido = computed(() => {
      return Object.entries(pedidoActual.value).reduce((total, [itemId, quantity]) => {
        const menuItem = menu.value.find(item => item.id === itemId);
        return total + (menuItem.precio * quantity);
      }, 0);
    });

    const closeModal = () => store.commit('modal/SET_SHOW', false);

    const confirmarPedido = async () => {
      if (totalPedido.value === 0) return;

      const itemsDelPedido = Object.entries(pedidoActual.value).map(([itemId, cantidad]) => {
        const menuItem = menu.value.find(item => item.id === itemId);
        return { ...menuItem, cantidad };
      });
      
      // 1. Crear el pedido
      const nuevoPedido = await store.dispatch('pedidos/crearPedido', {
        items: itemsDelPedido,
        total: totalPedido.value
      });

      // 2. Asignar el ID del pedido a la mesa
      store.commit('pisos/ASIGNAR_PEDIDO_A_MESA', {
        pisoId: store.state.pisos.pisoActivoId,
        mesaId: mesaId.value,
        pedidoId: nuevoPedido.id
      });
      
      closeModal();
    };

    return { menu, mesaId, pedidoActual, getQuantity, changeQuantity, totalPedido, confirmarPedido, closeModal };
  }
};
</script>

<style scoped>
.pedido-form { display: flex; flex-direction: column; gap: 15px; }
.menu-items { max-height: 50vh; overflow-y: auto; padding-right: 10px; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
.quantity-selector { display: flex; align-items: center; }
.quantity-selector button { width: 30px; height: 30px; }
.quantity-selector input { width: 40px; text-align: center; border: 1px solid #ccc; height: 30px; }
.pedido-summary { text-align: right; font-size: 1.2rem; margin-top: 10px; }
</style>