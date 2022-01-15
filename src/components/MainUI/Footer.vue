<template>
  <v-footer color="secondary" class="black--text" bottom fixed>
    [footertexthere]
    <v-spacer></v-spacer>

    {{ dateNow }}
  </v-footer>
</template>
<script>
export default {
  data: () => ({}),
  computed: {
    dateNow() {
      let d = new Date();
      return d.toLocaleDateString();
    },
  },
};
</script>
