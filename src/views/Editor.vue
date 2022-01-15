<template>
  <div>
    <v-row>
      <v-col md="6">
        <h1>Editor</h1>
      </v-col>
      <v-col md="6"
        ><div class="max-main-height-col">
          <webMap :mapId="webMapId" ref="WebMap" /></div
      ></v-col>
    </v-row>
  </div>
</template>
<script>
import webMap from "@/components/Maps/WebMap.vue";

export default {
  name: "Editor",
  components: { webMap },
  data: () => ({
    webMapId: "c3aea6a2bf244a1ebb87ade1a8a5bfb8",
  }),
  beforeCreate() {},
  created() {},
  methods: {},
  computed: {},
  watch: {},
  mounted() {},
};
</script>
<style scoped>
@import url("https://js.arcgis.com/4.22/esri/themes/light/main.css");

.viewdiv {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
}
.map-div {
  position: relative;
  height: 100%;
  width: 100%;
}
</style>