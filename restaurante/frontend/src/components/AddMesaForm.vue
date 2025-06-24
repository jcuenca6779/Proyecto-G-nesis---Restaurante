<template>
  <div class="form-modal"> <h2>Añadir Nueva Mesa</h2>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div class="form-group">
      <label for="mesaId">Número de Mesa (Máx. 20):</label>
      <input 
        type="text" 
        id="mesaId" 
        v-model="mesaParaAgregar.id"
        placeholder="Ej: 5"
        @input="validarSoloNumerosId"
      />
    </div>

    <div class="form-group">
      <label for="capacidad">Capacidad (Máx. 6):</label>
      <!-- CORRECCIÓN: Se añade el evento @input para validar -->
      <input 
        type="text" 
        id="capacidad" 
        v-model="mesaParaAgregar.capacidad"
        @input="validarSoloNumerosCapacidad"
      />
    </div>

    <div class="form-group">
      <label for="forma">Forma:</label>
      <select id="forma" v-model="mesaParaAgregar.forma">
        <option value="cuadrada">Cuadrada</option>
        <option value="redonda">Redonda</option>
        <option value="rectangular">Rectangular</option>
      </select>
    </div>

    <div class="form-actions">
      <button @click="confirmarMesa" class="btn-guardar">Confirmar y Añadir</button>
      <button @click="closeModal" class="btn-cancelar">Cancelar</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { ESTADOS_MESA } from '@/utils/constants';

export default {
  setup() {
    const store = useStore();
    const errorMessage = ref('');

    const mesaParaAgregar = ref({
      id: '',
      capacidad: '4', // Se maneja como string para la validación en tiempo real
      forma: 'cuadrada',
      estado: ESTADOS_MESA.DISPONIBLE,
      anchoCuadriculas: 3,
      altoCuadriculas: 3,
      x: 300,
      y: 300
    });

    const validarSoloNumerosId = () => {
      mesaParaAgregar.value.id = mesaParaAgregar.value.id.replace(/[^0-9]/g, '');
    };
    
    // --- NUEVA FUNCIÓN DE VALIDACIÓN PARA CAPACIDAD ---
    const validarSoloNumerosCapacidad = () => {
      // Reemplaza cualquier carácter que no sea un número
      const valorNumerico = mesaParaAgregar.value.capacidad.replace(/[^0-9]/g, '');
      mesaParaAgregar.value.capacidad = valorNumerico;
    };

    const closeModal = () => {
      store.commit('modal/SET_SHOW', false);
    };

    const confirmarMesa = () => {
      errorMessage.value = '';
      const nuevoId = parseInt(mesaParaAgregar.value.id, 10);
      // Se convierte la capacidad a número para las validaciones
      const capacidad = parseInt(mesaParaAgregar.value.capacidad, 10);

      // --- VALIDACIONES ---
      if (!mesaParaAgregar.value.id.trim()) {
        errorMessage.value = 'El número de mesa no puede estar vacío.';
        return;
      }
      if (isNaN(nuevoId)) {
        errorMessage.value = 'Por favor, introduce un número válido para la mesa.';
        return;
      }
      if (nuevoId > 20) {
        errorMessage.value = 'El número de mesa no puede ser mayor a 20.';
        return;
      }

      // Validación para capacidad vacía o no numérica
      if (isNaN(capacidad) || mesaParaAgregar.value.capacidad.trim() === '') {
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
      
      const mesasIndividualesIds = store.state.mesas.mesasIndividuales.map(m => m.id);
      const mesasEnGruposIds = store.state.grupos.grupos.flatMap(g => g.mesas.map(m => m.id));
      const todosLosIds = [...mesasIndividualesIds, ...mesasEnGruposIds];

      if (todosLosIds.includes(nuevoId)) {
        errorMessage.value = `El número de mesa "${nuevoId}" ya existe. Por favor, elige otro.`;
        return;
      }

      const mesaFinal = {
        ...mesaParaAgregar.value,
        id: nuevoId,
        capacidad: capacidad // Aseguramos que se guarde como número
      };
      
      store.dispatch('mesas/addMesa', mesaFinal);
      closeModal();
    };

    return {
      mesaParaAgregar,
      errorMessage,
      validarSoloNumerosId,
      validarSoloNumerosCapacidad, // Exponemos la nueva función
      confirmarMesa,
      closeModal
    };
  }
};
</script>

<style scoped>

</style>
