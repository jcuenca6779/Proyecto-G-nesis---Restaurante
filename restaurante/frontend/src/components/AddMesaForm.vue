<template>
  <div class="form-modal">
    <h2>Añadir Nueva Mesa</h2>
    
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
      capacidad: '4',
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
    
    const validarSoloNumerosCapacidad = () => {
      const valorNumerico = mesaParaAgregar.value.capacidad.replace(/[^0-9]/g, '');
      mesaParaAgregar.value.capacidad = valorNumerico;
    };

    const closeModal = () => {
      store.commit('modal/SET_SHOW', false);
    };

    const confirmarMesa = () => {
      errorMessage.value = '';
      const nuevoId = parseInt(mesaParaAgregar.value.id, 10);
      const capacidad = parseInt(mesaParaAgregar.value.capacidad, 10);

      if (!mesaParaAgregar.value.id.trim() || isNaN(nuevoId)) {
        errorMessage.value = 'Por favor, introduce un número válido para la mesa.';
        return;
      }
      if (nuevoId > 20 || nuevoId < 1) {
        errorMessage.value = 'El número de mesa debe estar entre 1 y 20.';
        return;
      }

      if (isNaN(capacidad) || mesaParaAgregar.value.capacidad.trim() === '') {
        errorMessage.value = 'La capacidad no puede estar vacía.';
        return;
      }
      if (capacidad > 6 || capacidad < 1) {
        errorMessage.value = 'La capacidad debe estar entre 1 y 6.';
        return;
      }
      
      const mesasActuales = store.getters['pisos/mesasDelPisoActivo'];
      const gruposActuales = store.getters['pisos/gruposDelPisoActivo'];
      
      const mesasEnGruposIds = gruposActuales.flatMap(g => g.mesas.map(m => m.id));
      const todosLosIds = [...mesasActuales.map(m => m.id), ...mesasEnGruposIds];

      if (todosLosIds.includes(nuevoId)) {
        errorMessage.value = `El número de mesa "${nuevoId}" ya existe en este piso.`;
        return;
      }

      const mesaFinal = {
        ...mesaParaAgregar.value,
        id: nuevoId,
        capacidad: capacidad
      };
      
      store.dispatch('pisos/addMesa', mesaFinal);
      closeModal();
    };

    return {
      mesaParaAgregar,
      errorMessage,
      validarSoloNumerosId,
      validarSoloNumerosCapacidad,
      confirmarMesa,
      closeModal
    };
  }
};
</script>