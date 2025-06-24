import { createStore } from 'vuex';
import pisos from './modules/pisos';
import modal from './modules/modal';
import pedidos from './modules/pedidos'; // <-- IMPORTAR

export default createStore({
  modules: {
    pisos,
    modal,
    pedidos // <-- AÑADIR
  }
});