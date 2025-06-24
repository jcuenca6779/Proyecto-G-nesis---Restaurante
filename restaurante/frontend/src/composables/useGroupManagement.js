import { useStore } from 'vuex'

export default function useGroupManagement() {
  const store = useStore()

  const separarGrupoSeleccionado = () => {
    if (store.state.grupos.grupoSeleccionado) {
      store.dispatch('grupos/separarGrupo', store.state.grupos.grupoSeleccionado)
    }
  }

  const seleccionarGrupo = (id) => {
    store.commit('mesas/SET_SELECTED_MESAS', [])
    store.commit('grupos/SET_SELECTED_GROUP', id)
  }

  return {
    separarGrupoSeleccionado,
    seleccionarGrupo
  }
}