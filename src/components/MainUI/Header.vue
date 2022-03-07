<template>
  <div>
    <v-app-bar color="jobsblack" class="jobselemblack--text" elevation="4">
      <router-link to="/" tag="button" title="Home">
        <v-img
          class="mx-2"
          src="@/assets/Seal_RGB_294.png"
          max-height="40"
          max-width="40"
          contain
        ></v-img>
      </router-link>

      <v-app-bar-title color="jobselemblack text-no-wrap">{{
        appTitle
      }}</v-app-bar-title>
      <v-spacer></v-spacer>

      <h5><v-icon color="jobselemblack">mdi-account</v-icon>{{ userName }}</h5>
      <v-btn color="jobselemblack" icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-app-bar>
  </div>
</template>
<script>
export default {
  data: () => ({
    //userName: "Testing",
  }),
  methods: {},
  watch: {},
  computed: {
    appTitle() {
      return "Tunisia JOBS Editor";
    },
    userName() {
      if (this.$store.state.esriCred !== null) {
        return this.$store.state.esriCred.userId;
      } else {
        return "loading..";
      }
    },
  },
  mounted() {},
};
</script>
<style>
.v-app-bar-title__content {
  width: 200px !important;
}
</style>
