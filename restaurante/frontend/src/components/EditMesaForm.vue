<template>
  <div class="form-modal">
    <h2>Editar Mesa {{ mesa.id }}</h2>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div class="form-group">
      <label for="capacidad">Capacidad (Máx. 6):</label>
      <input
        type="text"
        id="capacidad"
        v-model="mesaEditable.capacidad"
        @input="validarSoloNumerosCapacidad"
      />
    </div>

    <div class="form-group">
      <label for="estado">Estado:</label>
      <select id="estado" v-model="mesaEditable.estado">
        <option value="disponible">Disponible</option>
        <option value="ocupada">Ocupada</option>
        <option value="reservada">Reservada</option>
      </select>
    </div>

    <div class="form-actions">
      <button @click="guardarCambios" class="btn-guardar">Guardar Cambios</button>
      <button @click="closeModal" class="btn-cancelar">Cancelar</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const errorMessage = ref('');
    
    const mesa = computed(() => store.state.pisos.mesaEditada);

    const mesaEditable = ref({ 
      ...mesa.value,
      capacidad: String(mesa.value.capacidad || '') 
    });

    watch(mesa, (newVal) => {
      if (newVal) {
        mesaEditable.value = { 
          ...newVal,
          capacidad: String(newVal.capacidad || '')
        };
      }
    });

    const validarSoloNumerosCapacidad = () => {
      const valorNumerico = mesaEditable.value.capacidad.replace(/[^0-9]/g, '');
      mesaEditable.value.capacidad = valorNumerico;
    };

    const closeModal = () => {
      store.commit('modal/SET_SHOW', false);
    };

    const guardarCambios = () => {
      errorMessage.value = '';
      const capacidad = parseInt(mesaEditable.value.capacidad, 10);

      if (isNaN(capacidad) || mesaEditable.value.capacidad.trim() === '') {
        errorMessage.value = 'La capacidad no puede estar vacía.';
        return;
      }
      if (capacidad > 6 || capacidad < 1) {
        errorMessage.value = 'La capacidad debe ser entre 1 y 6.';
        return;
      }

      const datosActualizados = {
        ...mesaEditable.value,
        capacidad: capacidad
      };
      
      store.dispatch('pisos/updateMesa', datosActualizados);
      closeModal();
    };

    return {
      mesa,
      mesaEditable,
      errorMessage,
      validarSoloNumerosCapacidad,
      guardarCambios,
      closeModal
    };
  }
};
</script>