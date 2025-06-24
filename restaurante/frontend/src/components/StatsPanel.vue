<template>
  <div class="stats">
    <div class="stat-item">
      <div>Mesas disponibles</div>
      <div class="stat-value">{{ estadisticas.disponibles }}</div>
    </div>
    <div class="stat-item">
      <div>Mesas ocupadas</div>
      <div class="stat-value">{{ estadisticas.ocupadas }}</div>
    </div>
    <div class="stat-item">
      <div>Mesas reservadas</div>
      <div class="stat-value">{{ estadisticas.reservadas }}</div>
    </div>
    <div class="stat-item">
      <div>Grupos de Mesas</div>
      <div class="stat-value">{{ estadisticas.grupos }}</div>
    </div>
    <div class="stat-item">
      <div>Capacidad total</div>
      <div class="stat-value">{{ estadisticas.capacidadTotal }}</div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { calcularEstadisticas } from '@/utils/helpers';

export default {
  setup() {
    const store = useStore();
    const estadisticas = computed(() => {
      return calcularEstadisticas(
        store.getters['pisos/mesasDelPisoActivo'],
        store.getters['pisos/gruposDelPisoActivo']
      );
    });

    return {
      estadisticas
    };
  }
};
</script>

<style scoped>
.stats {
  background: #2c3e50;
  color: white;
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  border-top: 3px solid #3498db;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.stat-item div:first-child {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #FFFFFF;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3498db;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
</style>