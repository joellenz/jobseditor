import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#1B68B3',
                secondary: '#a8c5e7',
                accent: '#006f51',
                error: '#b71c1c',
                jobsred: '#BA1F30',
                jobsblack: '#1e251e',
                jobselemblack: '#a8c5e7'
            }
        }
    },
});
