<template>
  <div class="map-div">
    <div id="viewDiv" class="viewdiv"></div>
  </div>
</template>
<script>
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Query from "@arcgis/core/rest/support/Query";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import Extent from "@arcgis/core/geometry/Extent";
//Widgets
import Home from "@arcgis/core/widgets/Home";
import Legend from "@arcgis/core/widgets/Legend";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Locate from "@arcgis/core/widgets/Locate";
import Expand from "@arcgis/core/widgets/Expand";
export default {
  name: "mapview",
  components: {},
  props: {
    layersInfo: { typeof: Object },
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
  }),
  methods: {
    initMap() {
      console.log("LAYERINFO", this.layersInfo.info);
      if (!this.graphicsLayer) {
        this.graphicsLayer = new GraphicsLayer({});
      }
      let mapComponent = this;
      const map = new Map({
        basemap: "topo-vector",
      });
      const mapView = new MapView({
        container: "viewDiv",
        map: map,
      });
      //Add Layers to map

      this.layersInfo.info.layers.forEach((layer) => {
        if (layer.type === "layer") {
          //build up point symbol
          let renderer = {
            type: "simple",
            symbol: {
              type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
              size: layer.symbol.size,
              color: layer.symbol.color,
              outline: {
                // autocasts as new SimpleLineSymbol()
                width: 1,
                color: "white",
              },
            },
          };
          let flayer = new FeatureLayer({
            // URL to the service
            id: layer.name,
            title: layer.title,
            url: layer.url,
            definitionExpression: layer.filter,
            visible: true,
            renderer: renderer,
          });
          //console.log(flayer);
          map.add(flayer);
        }
      });
      mapView.center = this.centerPoint;
      mapView.zoom = this.lod;
      mapView.when((res) => {
        map.layers.add(mapComponent.graphicsLayer);
        const homeWidget = new Home({
          view: mapView,
        });
        mapView.ui.add(homeWidget, "top-left");
        mapView.popupEnabled = false;
        mapView.popup.autoOpenEnabled = false;
        //mapView.on("pointer-move", mapComponent.viewPointerMoveHandler);
        const basemapGallery = new BasemapGallery({
          view: mapView,
        });
        // Add widget to the top right corner of the view
        const bgExpand = new Expand({
          view: mapView,
          content: basemapGallery,
        });
        const locateBtn = new Locate({
          view: mapView,
        });

        // Add the locate widget to the top left corner of the view
        mapView.ui.add(locateBtn, {
          position: "top-left",
        });
        mapView.ui.add(bgExpand, "top-left");
        let legend = new Legend({
          view: mapView,
        });
        mapView.ui.add(legend, "bottom-right");
        mapView.on("layerview-create", function (event) {
          if (event.layer.loadStatus === "loaded") {
            console.log("Layer view created!", event.layer);
            mapComponent.layersInfo.info.layers.forEach((clayer) => {
              if (event.layer.id === clayer.name) {
                if (clayer.featureFilter !== null) {
                  console.log("Layer Query", clayer.featureFilter);
                  let query = event.layer.createQuery();
                  query.where = clayer.featureFilter;
                  query.outFields = ["*"];
                  event.layer.queryFeatures(query).then(function (response) {
                    let pt = response.features[0].geometry;
                    console.log("Selected Geomtry", pt);
                    mapView.goTo({ target: pt, zoom: 15 }).catch((error) => {
                      if (error.name != "AbortError") {
                        console.error(error);
                      }
                    });
                  });
                }
              }
            });
          }
        });
      });
    },
  },
  computed: {},
  mounted() {
    this.initMap();
  },
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