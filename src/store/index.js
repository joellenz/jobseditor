import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    esriCred: null,
    esriCredLoading: true,
    isPublic: false,
  },
  mutations: {
    setEsriCred(state, payload) {
      state.esriCred = payload
      state.esriCredLoading = false
    },
  },
  actions: {
    setEsriCred: ({ commit, state }, payload) => {
      commit('setEsriCred', payload)
    },
  },
  modules: {
  }
});
