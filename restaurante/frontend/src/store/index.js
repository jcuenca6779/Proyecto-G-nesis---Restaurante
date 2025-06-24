import { createStore } from 'vuex';
import pisos from './modules/pisos'; // <-- NUEVO
import modal from './modules/modal';

export default createStore({
  modules: {
    pisos, // <-- NUEVO
    modal
  }
});