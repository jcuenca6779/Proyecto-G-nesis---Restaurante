<template>
  <div class="form-modal">
    <h2>Añadir Nueva Mesa</h2>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="mesaId">Número de Mesa (1-20):</label>
        <input 
          type="text" 
          id="mesaId" 
          v-model="mesaParaAgregar.id"
          placeholder="Ej: 5"
          @input="validarSoloNumerosId"
        />
      </div>
      <div class="form-group">
        <label for="capacidad">Capacidad (1-6):</label>
        <input 
          type="text" 
          id="capacidad" 
          v-model="mesaParaAgregar.capacidad"
          @input="validarSoloNumerosCapacidad"
        />
      </div>
    </div>

    <div class="form-group">
      <label for="forma">Forma:</label>
      <select id="forma" v-model="mesaParaAgregar.forma">
        <option value="cuadrada">Cuadrada</option>
        <option value="redonda">Redonda</option>
        <option value="rectangular">Rectangular</option>
      </select>
    </div>

    <div class="form-group">
      <label>Tamaño en Cuadrantes (Mín: 2, Máx: 5)</label>
      <div class="size-controls">
        <div class="dimension-control">
          <label for="ancho">Ancho:</label>
          <input type="text" id="ancho" v-model="mesaParaAgregar.anchoCuadriculas" @input="validarDimension('anchoCuadriculas')">
        </div>
        <div class="dimension-control">
          <label for="alto">Alto:</label>
          <input type="text" id="alto" v-model="mesaParaAgregar.altoCuadriculas" @input="validarDimension('altoCuadriculas')">
        </div>
      </div>
    </div>

    <!-- === VISTA PREVIA DE LA MESA === -->
    <div class="size-preview">
      <p class="preview-label">Vista Previa:</p>
      <div class="preview-area">
        <div class="mesa-preview" :style="previewStyle"></div>
      </div>
    </div>
    <!-- ============================== -->

    <div class="form-actions">
      <button @click="confirmarMesa" class="btn-guardar">Confirmar y Añadir</button>
      <button @click="closeModal" class="btn-cancelar">Cancelar</button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
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
      mesaParaAgregar.value.capacidad = mesaParaAgregar.value.capacidad.replace(/[^0-9]/g, '');
    };

    /**
     * Valida que las dimensiones sean solo números y estén dentro del rango.
     * @param {'anchoCuadriculas' | 'altoCuadriculas'} dimension - La propiedad a validar.
     */
    const validarDimension = (dimension) => {
        let valor = String(mesaParaAgregar.value[dimension]).replace(/[^0-9]/g, '');
        if (valor) {
            let num = parseInt(valor, 10);
            if (num < 2) num = 2;
            if (num > 5) num = 5;
            valor = num;
        }
        mesaParaAgregar.value[dimension] = valor;
    };

    // Estilo computado para la vista previa
    const previewStyle = computed(() => {
        const escala = 20; // 20px por cuadrante para la vista previa
        const ancho = (Number(mesaParaAgregar.value.anchoCuadriculas) || 3) * escala;
        const alto = (Number(mesaParaAgregar.value.altoCuadriculas) || 3) * escala;
        let borderRadius = '10px';
        if (mesaParaAgregar.value.forma === 'redonda') {
            borderRadius = '50%';
        }
        return {
            width: `${ancho}px`,
            height: `${alto}px`,
            borderRadius
        };
    });

    const closeModal = () => store.commit('modal/SET_SHOW', false);

    const confirmarMesa = () => {
      // (Lógica de confirmación existente...)
      // La validación ahora asegura que los valores son correctos
      errorMessage.value = '';
      const nuevoId = parseInt(mesaParaAgregar.value.id, 10);
      const capacidad = parseInt(mesaParaAgregar.value.capacidad, 10);
      const ancho = parseInt(mesaParaAgregar.value.anchoCuadriculas, 10);
      const alto = parseInt(mesaParaAgregar.value.altoCuadriculas, 10);

      if (!nuevoId) { errorMessage.value = 'El número de mesa es obligatorio.'; return; }
      if (!capacidad) { errorMessage.value = 'La capacidad es obligatoria.'; return; }
      if (!ancho || !alto) { errorMessage.value = 'El tamaño es obligatorio.'; return; }
      
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
        capacidad: capacidad,
        anchoCuadriculas: ancho,
        altoCuadriculas: alto
      };
      
      store.dispatch('pisos/addMesa', mesaFinal);
      closeModal();
    };

    return {
      mesaParaAgregar,
      errorMessage,
      validarSoloNumerosId,
      validarSoloNumerosCapacidad,
      validarDimension,
      previewStyle,
      confirmarMesa,
      closeModal
    };
  }
};
</script>

<style scoped>
.form-row { display: flex; gap: 20px; }
.form-row .form-group { flex: 1; }
.size-controls { display: flex; gap: 20px; }
.dimension-control { flex: 1; }
.dimension-control label { display: block; margin-bottom: 5px; }
.dimension-control input { width: 100%; }

.size-preview {
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}
.preview-label {
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
  text-align: center;
}
.preview-area {
  min-height: 120px;
  background-color: #f8f9fa;
  border: 1px dashed #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.mesa-preview {
  background: #3498db;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
</style>
