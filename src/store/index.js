import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    esriCred: null,
    esriCredLoading: true,
    userInfos: null,
    isPublic: false,

  },
  mutations: {
    setEsriCred(state, payload) {
      state.esriCred = payload
      state.esriCredLoading = false
    },
    setUserInfos(state, payload) {
      state.userInfos = payload
    },
  },
  actions: {
    setEsriCred: ({ commit, state }, payload) => {
      commit('setEsriCred', payload)
    },
    setUserInfos: ({ commit, state }, payload) => {
      commit('setUserInfos', payload)
    },
  },
  modules: {
  }
});
