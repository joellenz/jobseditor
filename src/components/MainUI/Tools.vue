<template>
  <v-card>
    <v-row no-gutters>
      <v-col md="12">
        <div style="padding: 10px">
          <v-img height="40px" src="@/assets/logo_xl.png"></v-img>
        </div>
      </v-col>
      <v-col md="12">
        <!-- <v-card-title class="text-uppercase">Dashboards</v-card-title> -->

        <div style="padding: 10px; text-align: left">
          <v-combobox
            v-model="themeSelect"
            :items="selectItems"
            item-text="title"
            item-value="name"
            label="Select a Dashboard"
            @change="onThemeChange"
            dense
            class="text-caption text-uppercase text-left"
            style="text-align: left"
          ></v-combobox>
        </div>
        <v-tabs v-model="tab" grow>
          <v-tab v-if="showMap" style="color: #1e3468" class="text-caption">
            MAP KEY
          </v-tab>
          <v-tab> FILTERS </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item v-if="showMap">
            <div
              style="text-align: left; padding: 5px"
              id="map-legend"
              ref="map-legend"
            ></div>
          </v-tab-item>
          <v-tab-item>
            <v-row no-gutters>
              <v-col md="12">
                <br />
                <Filters :filters="filters" />
              </v-col>
            </v-row>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
  </v-card>
</template>
<script>
import dashboards from "@/assets/config/dashboards.json";
import themeHelper from "@/assets/scripts/themeHelper.js";
import Filters from "@/components/Filters/Filter.vue";

export default {
  name: "Tools",
  components: { Filters },
  props: {
    filters: {
      typeof: Object,
    },
  },
  data: () => ({
    tab: null,
    themeSelect: null,
    showMap: true,
  }),
  methods: {
    onThemeChange(object) {
      const path = `/dashboards/${object.name}`;
      if (this.$route.path !== path) this.$router.push(path);
      // this.$router.push({
      //   name: "Dashboards",
      //   params: { theme: object.name },
      // });
    },
  },
  watch: {
    filters() {},
  },
  computed: {
    selectItems() {
      //console.log(dashboards);
      return dashboards.themes;
    },
  },
  mounted() {
    this.themeSelect = this.selectItems.find((obj) => {
      return obj.name === this.$route.params.theme;
    });
  },
};
</script>
