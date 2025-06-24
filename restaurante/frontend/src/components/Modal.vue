<template>
  <div class="modal" @click.self="closeModal">
    <div class="modal-content">
      <button class="modal-close" @click="closeModal">
        ✕
      </button>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'

export default {
  setup() {
    const store = useStore()
    
    const closeModal = () => {
      store.commit('modal/SET_SHOW', false)
    }
    
    return { closeModal }
  }
}
</script>

<style scoped>

</style>