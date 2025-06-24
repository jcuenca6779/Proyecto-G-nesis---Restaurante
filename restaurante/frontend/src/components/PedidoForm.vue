<template>
  <div class="pedido-form">
    <h2>{{ isEditing ? 'Editar Pedido' : 'Tomar Pedido' }} para {{ targetName }}</h2>
    
    <div class="menu-items">
      <div v-for="item in menu" :key="item.id" class="menu-item">
        <span>{{ item.nombre }} - ${{ item.precio.toFixed(2) }}</span>
        <div class="quantity-selector">
          <button @click="changeQuantity(item.id, -1)" :disabled="!isEditing && target.estado !== 'disponible'">-</button>
          <input type="text" :value="getQuantity(item.id)" readonly>
          <button @click="changeQuantity(item.id, 1)" :disabled="!isEditing && target.estado !== 'disponible'">+</button>
        </div>
      </div>
    </div>

    <div class="pedido-summary">
      <strong>Total: ${{ totalPedido.toFixed(2) }}</strong>
    </div>

    <div class="form-actions">
      <button @click="closeModal" class="btn-cancelar">Cancelar</button>
      <button 
        v-if="isEditing" 
        @click="actualizarYFacturar" 
        class="btn-facturar"
        :disabled="totalPedido === 0"
      >
        Finalizar y Facturar
      </button>
      <button 
        @click="confirmarPedido" 
        class="btn-guardar"
        :disabled="totalPedido === 0"
      >
        {{ isEditing ? 'Actualizar Pedido' : 'Confirmar Pedido' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'PedidoForm',
  setup() {
    const store = useStore();
    const pedidoActual = ref({});

    // Determina si estamos editando o creando un nuevo pedido
    const target = computed(() => {
        const mesaSel = store.getters['pisos/mesasSeleccionadas'][0];
        const grupoSel = store.getters['pisos/grupoSeleccionado'];
        if (mesaSel) return store.getters['pisos/mesaById'](mesaSel);
        if (grupoSel) return store.getters['pisos/grupoById'](grupoSel);
        return null;
    });

    const isEditing = computed(() => !!target.value?.pedidoId);
    const targetName = computed(() => {
        if (!target.value) return '';
        return target.value.mesas ? `Grupo ${store.getters['pisos/gruposDelPisoActivo'].findIndex(g => g.id === target.value.id) + 1}` : `Mesa ${target.value.id}`;
    });
    
    const menu = computed(() => store.getters['pedidos/getMenu']);

    onMounted(() => {
      if (isEditing.value) {
        const pedidoExistente = store.getters['pedidos/getPedidoById'](target.value.pedidoId);
        if (pedidoExistente) {
          const itemsMap = {};
          pedidoExistente.items.forEach(item => {
            itemsMap[item.id] = item.cantidad;
          });
          pedidoActual.value = itemsMap;
        }
      }
    });

    const getQuantity = (itemId) => pedidoActual.value[itemId] || 0;

    const changeQuantity = (itemId, change) => {
      const currentQty = getQuantity(itemId);
      const newQty = Math.max(0, currentQty + change);
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

    const guardarPedido = async () => {
      const itemsDelPedido = Object.entries(pedidoActual.value).map(([itemId, cantidad]) => {
        const menuItem = menu.value.find(item => item.id === itemId);
        return { ...menuItem, cantidad };
      });

      if (isEditing.value) {
        await store.dispatch('pedidos/actualizarPedido', {
          pedidoId: target.value.pedidoId,
          updates: { items: itemsDelPedido, total: totalPedido.value }
        });
      } else {
        const nuevoPedido = await store.dispatch('pedidos/crearPedido', {
          items: itemsDelPedido,
          total: totalPedido.value
        });
        await store.dispatch('pisos/asignarPedido', { 
            targetId: target.value.id, 
            pedidoId: nuevoPedido.id,
            isGroup: !!target.value.mesas
        });
      }
    };

    const confirmarPedido = async () => {
      if (totalPedido.value === 0 && !isEditing.value) return;
      await guardarPedido();
      closeModal();
    };
    
    const actualizarYFacturar = async () => {
      if (totalPedido.value > 0) {
        await guardarPedido();
      }
      store.commit('modal/SET_TYPE', 'factura');
      // No cerramos el modal, lo cambiamos de tipo
    };

    return { menu, target, isEditing, targetName, pedidoActual, getQuantity, changeQuantity, totalPedido, confirmarPedido, closeModal, actualizarYFacturar };
  }
};
</script>

<style scoped>
.pedido-form { display: flex; flex-direction: column; gap: 15px; }
.menu-items { max-height: 50vh; overflow-y: auto; padding-right: 10px; border: 1px solid #eee; border-radius: 8px; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
.menu-item:last-child { border-bottom: none; }
.quantity-selector { display: flex; align-items: center; }
.quantity-selector button { width: 30px; height: 30px; }
.quantity-selector input { width: 40px; text-align: center; border: 1px solid #ccc; height: 30px; }
.pedido-summary { text-align: right; font-size: 1.2rem; margin-top: 10px; }
.btn-facturar {
  background-color: #e67e22;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
</style>
