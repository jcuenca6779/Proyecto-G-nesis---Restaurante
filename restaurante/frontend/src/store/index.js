import { createStore } from 'vuex'
import mesas from './modules/mesas'
import grupos from './modules/grupos'
import modal from './modules/modal'
import app from './modules/app'

export default createStore({
  modules: {
    mesas,
    grupos,
    modal,
    app
  }
})