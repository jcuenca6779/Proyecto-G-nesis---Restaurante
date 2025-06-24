import { useStore } from 'vuex';

export default function useGroupManagement() {
  const store = useStore();

  const separarGrupoSeleccionado = () => {
    const grupoId = store.getters['pisos/grupoSeleccionado'];
    if (grupoId) {
      store.dispatch('pisos/separarGrupo', grupoId);
    }
  };

  const seleccionarGrupo = (id) => {
    // Deselecciona cualquier mesa y selecciona el grupo
    store.commit('pisos/SET_SELECTED_MESAS', []);
    store.commit('pisos/SET_SELECTED_GROUP', id);
  };

  return {
    separarGrupoSeleccionado,
    seleccionarGrupo
  };
}