<template>
  <div class="form-modal"> <h2>Editar Mesa {{ mesa.id }}</h2>

    <!-- Mensaje de error para las validaciones -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div class="form-group">
      <label for="capacidad">Capacidad (Máx. 6):</label>
      <!-- CORRECCIÓN: Se cambia a tipo 'text' y se añade el evento @input -->
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
    
    // Obtener la mesa original del store
    const mesa = computed(() => store.state.mesas.mesaEditada);

    // Crear una copia local para la edición
    // CORRECCIÓN: Se convierte la capacidad a String para la validación en tiempo real
    const mesaEditable = ref({ 
      ...mesa.value,
      capacidad: String(mesa.value.capacidad || '') 
    });

    // Observar si la mesa original cambia (por si el modal se reutiliza)
    watch(mesa, (newVal) => {
      mesaEditable.value = { 
        ...newVal,
        capacidad: String(newVal.capacidad || '')
      };
    });

    // --- NUEVA FUNCIÓN DE VALIDACIÓN ---
    const validarSoloNumerosCapacidad = () => {
      // Reemplaza cualquier carácter que no sea un número
      const valorNumerico = mesaEditable.value.capacidad.replace(/[^0-9]/g, '');
      mesaEditable.value.capacidad = valorNumerico;
    };

    const closeModal = () => {
      store.commit('modal/SET_SHOW', false);
    };

    const guardarCambios = () => {
      errorMessage.value = ''; // Limpiar errores previos
      const capacidad = parseInt(mesaEditable.value.capacidad, 10);

      // --- VALIDACIONES DE CAPACIDAD ---
      if (isNaN(capacidad) || mesaEditable.value.capacidad.trim() === '') {
        errorMessage.value = 'La capacidad no puede estar vacía.';
        return;
      }
      if (capacidad > 6) {
        errorMessage.value = 'La capacidad máxima por mesa es de 6 personas.';
        return;
      }
      if (capacidad < 1) {
        errorMessage.value = 'La capacidad debe ser de al menos 1 persona.';
        return;
      }

      // Preparamos el objeto final con la capacidad como número
      const datosActualizados = {
    ...mesaEditable.value,
    capacidad: capacidad
      };
      // Llamamos a la acción para actualizar, que a su vez llama a la mutación
      store.dispatch('mesas/updateMesa', datosActualizados);
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

<style scoped>

</style>
