<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ title }}
      </v-card-title>

      <v-card-text>{{ confirmMessage.message }} </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="applyEdits(false)"> Cancel </v-btn>
        <v-btn color="primary" text @click="applyEdits(true)"> Confirm </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  name: "Confirmation",
  props: {
    value: {
      typeof: Boolean,
    },
    title: { typeof: String },
    confirmMessage: { typeof: Object },
  },
  data: () => ({
    //defDialog: this.showDialog,
  }),
  methods: {
    applyEdits(doEdits) {
      this.show = false;
      this.$root.$emit("doEdits", doEdits);
    },
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
};
</script>
<style>
</style>