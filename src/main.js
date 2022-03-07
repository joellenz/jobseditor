import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import VuetifyDialog from 'vuetify-dialog'
import 'vuetify-dialog/dist/vuetify-dialog.css'

Vue.config.productionTip = false;
Vue.use(VuetifyDialog, {
  context: {
    vuetify
  }
})
new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
