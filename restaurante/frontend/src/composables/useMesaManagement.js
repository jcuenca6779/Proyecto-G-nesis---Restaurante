import { useStore } from 'vuex'
import { ESTADOS_MESA } from '@/utils/constants'

export default function useMesaManagement() {
  const store = useStore()

  const agregarMesaNueva = () => {
    store.commit('modal/SET_TYPE', 'addMesa');
    store.commit('modal/SET_SHOW', true);
  }

  const confirmarNuevaMesa = () => {
    store.dispatch('mesas/addMesa')
  }

  const eliminarMesaSeleccionada = () => {
    if (confirm('¿Está seguro de eliminar esta mesa?')) {
        
    if (store.state.mesas.mesasSeleccionadas.length === 1) {
      store.dispatch('mesas/deleteMesa', store.state.mesas.mesasSeleccionadas[0])
    }
}
  }

  const abrirMenuMesa = (id) => {
    const mesa = store.getters['mesas/mesaById'](id)
    if (mesa) {
      store.commit('mesas/SET_EDITED_MESA', { ...mesa })
      store.commit('modal/SET_SHOW', true)
      store.commit('modal/SET_TYPE', 'editMesa')
    }
  }

  const guardarCambiosMesa = () => {
    store.dispatch('mesas/updateMesa')
  }

  const seleccionarMesaIndividual = (id) => {
    store.commit('grupos/SET_SELECTED_GROUP', null)
    store.commit('mesas/SET_SELECTED_MESAS', [id])
  }

  const esMesaOcupada = (mesa) => {
    if (!mesa) return false;
    return mesa.estado === ESTADOS_MESA.OCUPADA;
  };

  return {
    agregarMesaNueva,
    confirmarNuevaMesa,
    eliminarMesaSeleccionada,
    abrirMenuMesa,
    guardarCambiosMesa,
    seleccionarMesaIndividual,
    esMesaOcupada
  }
}