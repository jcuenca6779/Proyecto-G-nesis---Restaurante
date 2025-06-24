import { useStore } from 'vuex';

export default function useMesaManagement() {
  const store = useStore();

  const agregarMesaNueva = () => {
    store.commit('modal/SET_TYPE', 'addMesa');
    store.commit('modal/SET_SHOW', true);
  };

  const eliminarMesaSeleccionada = () => {
    const mesasSeleccionadas = store.getters['pisos/mesasSeleccionadas'];
    if (confirm('¿Está seguro de eliminar esta mesa?')) {
      if (mesasSeleccionadas.length === 1) {
        store.dispatch('pisos/deleteMesa', mesasSeleccionadas[0]);
      }
    }
  };

  const abrirMenuMesa = (id) => {
    const mesa = store.getters['pisos/mesaById'](id);
    if (mesa) {
      store.commit('pisos/SET_EDITED_MESA', { ...mesa });
      store.commit('modal/SET_TYPE', 'editMesa');
      store.commit('modal/SET_SHOW', true);
    }
  };

  const seleccionarMesaIndividual = (id) => {
    // Deselecciona cualquier grupo y selecciona la mesa
    store.commit('pisos/SET_SELECTED_GROUP', null);
    store.commit('pisos/SET_SELECTED_MESAS', [id]);
  };

  return {
    agregarMesaNueva,
    eliminarMesaSeleccionada,
    abrirMenuMesa,
    seleccionarMesaIndividual
  };
}