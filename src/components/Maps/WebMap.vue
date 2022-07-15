<template>
  <div class="map-div">
    <div id="viewDiv" class="viewdiv"></div>
  </div>
</template>
<script>
import axios from "axios";
import store from "../../store";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import esriRequest from "@arcgis/core/request";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point";
//Widgets
import Home from "@arcgis/core/widgets/Home";
import Legend from "@arcgis/core/widgets/Legend";
export default {
  name: "mapview",
  components: {},
  props: {
    mapId: { typeof: String },
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
    legend: null,
  }),
  methods: {
    initMap() {
      //TODO: Add Map Click
      if (!this.graphicsLayer) {
        this.graphicsLayer = new GraphicsLayer({});
      }
      let _this = this;
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
        map.layers.add(_this.graphicsLayer);
        const homeWidget = new Home({
          view: mapView,
        });
        mapView.ui.add(homeWidget, "top-left");
        mapView.popupEnabled = false;
        mapView.popup.autoOpenEnabled = false;
        //mapView.on("pointer-move", _this.viewPointerMoveHandler);

        _this.legend = new Legend({
          view: mapView,
        });
        mapView.ui.add(_this.legend, "bottom-left");
      });
      mapView.center = this.centerPoint;
      mapView.zoom = this.lod;
      mapView.on("layerview-create", function (event) {
        if (event.layer.loadStatus === "loaded") {
          //console.log("Layer view created!", event.layer);
          _this.layersInfo.forEach((clayer) => {
            if (event.layer.id === clayer.layerId) {
              if (clayer.filter !== null) {
                //console.log("Layer Query", clayer.featureFilter);
                let query = event.layer.createQuery();
                query.where = clayer.filter;
                query.outFields = ["*"];
                event.layer.queryFeatures(query).then((response) => {
                  let pt = response.features[0].geometry;
                  _this.buildEditForms(mapView.map, response.features[0]);
                  mapView.goTo({ target: pt, zoom: 18 }).catch((error) => {
                    if (error.name != "AbortError") {
                      console.error(error);
                    }
                  });
                });
              } else {
                _this.buildTableObject(event.layer);
              }
            }
          });
        }
      });
    },
    buildTableObject(layer) {
      console.log("LAYER", layer);
    },
    buildEditForms(map, parentFeature) {
      let _this = this;
      console.log("MAP", map);
      console.log("PARENTID", parentFeature.attributes.globalid);
      let globalId = parentFeature.attributes.globalid;
      let editObjects = [];
      this.layersInfo.forEach((layerInfo) => {
        if (layerInfo.isEditable) {
          //get Popups
          let tableObj = map.allTables.items.find((obj) => {
            return obj.id === layerInfo.layerId;
          });

          let popupDisplay = [];
          let popupEdit = [];
          tableObj.popupTemplate.fieldInfos.forEach((fieldInfo) => {
            if (fieldInfo.visible) {
              if (fieldInfo.isEditable) {
                fieldInfo.recValue = null;
                popupEdit.push(fieldInfo);
              } else {
                fieldInfo.recValue = null;
                popupDisplay.push(fieldInfo);
              }
            }
          });
          layerInfo.popupDisplay = popupDisplay;
          layerInfo.popupEdit = popupEdit;
          editObjects.push(layerInfo);
        }
      });
      //need to query infos for each
      let axioRequests = [];
      //console.log("REQUESTSTOMAKE", requestsToMake);
      editObjects.forEach((request) => {
        let url = new URL(request.url);
        let params = {
          where: "1=1",
          f: "json",
          returnGeometry: false,
          token: store.state.esriCred.token,
        };
        url.search = new URLSearchParams(params).toString();
        let axioRequest = axios.get(url);
        axioRequests.push(axioRequest);
      });
      axios.all(axioRequests).then(
        axios.spread((...responses) => {
          responses.forEach((response, i) => {
            editObjects[i].popupEdit.forEach((pEdit) => {
              response.data.fields.forEach((field) => {
                if (pEdit.fieldName === field.name) {
                  pEdit.fieldType = field.type;
                  pEdit.domain = field.domain;
                }
              });
            });
            console.log(response);
          });

          //Now need to query related data to get values
          let featureRequests = [];
          let queryFeatures = [];
          editObjects.forEach((request) => {
            let url = new URL(request.url + "/query");
            let params = {
              where: "1=1",
              outFields: ["*"],
              f: "json",
              returnGeometry: false,
              token: store.state.esriCred.token,
            };
            url.search = new URLSearchParams(params).toString();
            let axioRequest = axios.get(url);
            featureRequests.push(axioRequest);
          });
          axios.all(featureRequests).then(
            axios.spread((...responses1) => {
              responses1.forEach((response1, i) => {
                let editFeatures = [];
                let prevI = 0;
                let pGlobalIds = [];
                switch (i) {
                  case 0:
                    editFeatures = response1.data.features.filter((obj) => {
                      return obj.attributes.ParentGUID === globalId;
                    });

                    editObjects[i].features = editFeatures;
                    break;
                  default:
                    prevI = i - 1;
                    pGlobalIds = [];
                    editObjects[prevI].features.forEach((pFeature) => {
                      //handle manys
                      pGlobalIds.push(pFeature.attributes.GlobalID);
                    });
                    editFeatures = response1.data.features.filter((obj) => {
                      return pGlobalIds.includes(obj.attributes.ParentGUID);
                    });
                    editObjects[i].features = editFeatures;
                    break;
                }
              });
              let editObject = {};
              editObject.formInfos = editObjects;

              //Now build hierarchy
              let featureTrees = [];
              let featureTree = {};
              let children = [];
              let nodeName = "";
              //index 0 =  TA
              //work through each TA and follow the heirarchy

              let tas = responses1[0].data.features.filter((obj) => {
                return obj.attributes.ParentGUID === globalId;
              });
              tas.forEach((feature, i) => {
                console.log(feature);
                nodeName =
                  "TA: " + feature.attributes.Type_of_Technical_Assistance;
                featureTree = {
                  id: feature.attributes[editObjects[0].objectIdField],
                  name: nodeName,
                  companyId: globalId,
                  layerId: editObjects[0].layerId,
                  title: editObjects[0].title,
                  createBtn: true,
                  editBtn: true,
                  validateBtn: true,
                  feature: feature,
                  createTitle: "Create new TA Provider",
                  class: "grand-parent",
                };
                children = [];
                let taps = responses1[1].data.features.filter((obj) => {
                  return (
                    obj.attributes.ParentGUID ===
                    feature.attributes[editObjects[0].globalIdField]
                  );
                });
                taps.forEach((tapFeature) => {
                  nodeName =
                    "TA Provider: " +
                    tapFeature.attributes.Consulting_Firm_Name;
                  children.push({
                    id: tapFeature.attributes[editObjects[1].objectIdField],
                    title: editObjects[1].title,
                    name: nodeName,
                    globalId:
                      tapFeature.attributes[editObjects[1].globalIdField],
                    layerId: editObjects[1].layerId,
                    feature: tapFeature,
                    createBtn: true,
                    editBtn: true,
                    validateBtn: false,
                    createTitle: "Create new TA Provider Consultant",
                    class: "parent",
                  });
                });
                if (children.length > 0) {
                  children.forEach((child) => {
                    let grandChildren = [];
                    let tapcs = responses1[2].data.features.filter((obj) => {
                      return (
                        obj.attributes.ParentGUID ===
                        child.feature.attributes[editObjects[1].globalIdField]
                      );
                    });
                    tapcs.forEach((tapc) => {
                      nodeName =
                        "Consultant: " + tapc.attributes.Consultant_Name;
                      grandChildren.push({
                        id: tapc.attributes[editObjects[2].objectIdField],
                        title: editObjects[2].title,
                        name: nodeName,
                        globalId: tapc.attributes[editObjects[2].globalIdField],
                        layerId: editObjects[2].layerId,
                        feature: tapc,
                        createBtn: false,
                        editBtn: true,
                        validateBtn: false,
                        createTitle: "Create new TA Provider Consultant",
                        class: "child",
                      });
                    });

                    child.children = grandChildren;
                  });
                }
                featureTree.children = children;
                //now get
                featureTrees.push(featureTree);
              });

              editObject.treeView = featureTrees;

              _this.$root.$emit("loadEditForms", editObject);
            })
          );
        })
      );
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