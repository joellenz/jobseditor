<template>
  <div class="map-div">
    <div id="viewDiv" class="viewdiv"></div>
  </div>
</template>
<script>
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point";
//Widgets
import Home from "@arcgis/core/widgets/Home";
import Legend from "@arcgis/core/widgets/Legend";
export default {
  name: "mapview",
  components: {},
  props: {
    mapId: String,
  },
  data: () => ({
    graphicsLayer: null,
    showDialog: false,
    showToolWindow: false,
    toolTitle: "Tool",
    drawer: true,
    centerPoint: new Point({
      x: 1074942.965329757,
      y: 4122404.698884261,
      spatialReference: 3857,
    }),
    lod: 7,
    legend: null,
  }),
  methods: {
    initMap() {
      if (!this.graphicsLayer) {
        this.graphicsLayer = new GraphicsLayer({});
      }
      let mapComponent = this;
      const map = new WebMap({
        portalItem: {
          id: this.mapId,
        },
      });
      const mapView = new MapView({
        container: "viewDiv",
        map: map,
      });
      mapView.when((res) => {
        console.log(res);
        map.layers.add(mapComponent.graphicsLayer);
        const homeWidget = new Home({
          view: mapView,
        });
        mapView.ui.add(homeWidget, "top-left");
        mapView.popupEnabled = false;
        mapView.popup.autoOpenEnabled = false;
        //mapView.on("pointer-move", mapComponent.viewPointerMoveHandler);

        if (mapComponent.legend) {
          //this.legend.layerInfos = [];
          mapComponent.legend.view = mapView;
        } else {
          mapComponent.legend = new Legend(
            {
              view: mapView,
            },
            "map-legend"
          );
        }
      });
      mapView.center = this.centerPoint;
      mapView.zoom = this.lod;
    },
  },
  computed: {},
  mounted() {
    this.initMap();
  },
};
</script>
<style scoped>
@import url("https://js.arcgis.com/4.18/esri/themes/light/main.css");

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