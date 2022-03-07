<template>
  <div>
    <v-row>
      <v-col md="6">
        <h1>ATF</h1>
        <v-tabs v-model="tab" align-with-title>
          <v-tab>Records</v-tab>
          <v-tab>Upload</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <FeatureTable />
          </v-tab-item>
          <v-tab-item>
            <Upload />
          </v-tab-item>
        </v-tabs-items>
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
import FeatureTable from "@/components/MainUI/FeatureTable.vue";
import Upload from "@/components/MainUI/Upload.vue";
export default {
  name: "ATF",
  components: { webMap, FeatureTable, Upload },
  data: () => ({
    tab: 0,
    webMapId: "39e4568c5d6f49b3accae0eb579c94c6",
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