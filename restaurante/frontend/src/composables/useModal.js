import { useStore } from 'vuex'

export default function useModal() {
  const store = useStore()

  const openModal = (type) => {
    store.commit('modal/SET_TYPE', type)
    store.commit('modal/SET_SHOW', true)
  }

  const closeModal = () => {
    store.commit('modal/SET_SHOW', false)
  }

  return {
    openModal,
    closeModal
  }
}