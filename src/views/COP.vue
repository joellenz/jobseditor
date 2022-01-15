<template>
  <div>
    <v-row>
      <v-col md="6">
        <h1>COP PA Validation</h1>
        <template v-if="this.paref">
          <div>
            <h2>{{ paref }} Information</h2>
          </div>
        </template>
        <template v-if="!this.paref">
          <div>
            <h2>TL Validated PAs</h2>
          </div>
        </template>
      </v-col>
      <v-col md="6"
        ><div v-if="layerInfos !== null" class="max-main-height-col">
          <Map :layersInfo="layerInfos" />
        </div>
        ></v-col
      >
    </v-row>
  </div>
</template>
<script>
import Map from "@/components/Maps/Map.vue";
import axios from "axios";
export default {
  name: "COP",
  components: { Map },
  data: () => ({
    paref: null,
    paObjectId: null,
    layerInfos: null,
  }),
  beforeCreate() {},
  created() {
    console.log("created");
    if (this.$store.state.esriCred !== null) {
      //   //alert("Login is needed");
      // } else {
      this.loadPage();
    }
    //}
  },
  beforeRouteUpdate(to, from, next) {
    // Call the API query method when the URL changes
    this.loadPage(to.params.paref);
    next();
  },
  methods: {
    loadPage(paref) {
      //alert(this.$route.params.paref);
      this.paref = this.$route.params.paref;
      if (this.paref) {
        let stringObjectId = this.paref.split("-")[1];
        this.paObjectId = parseInt(stringObjectId);
        //apply the filter to select the company and PA
        //console.log(this.layerInfos);
      }
      //run axios
      let url = new URL(
        "https://services9.arcgis.com/sdlGgCbKFs6IzpbE/ArcGIS/rest/services/tunisiajobs_c1_prd/FeatureServer/4/query"
      );
      let params = {};
      params = {
        where: "TLG_APPROVED = 'Yes' and COP_SIgnature_validated = 'No'",
        outFields: "*",
        f: "json",
        returnGeometry: false,
        token: this.esriCred.token,
      };

      url.search = new URLSearchParams(params).toString();
      let axioRequest = axios.get(url);
      axioRequest.then((response) => {
        //console.log(response);
        //now get companies from the results and
        let objectIds = [];
        response.data.features.forEach((feature) => {
          let objId = feature.attributes["PAREF"].split("-")[1];
          objectIds.push(parseInt(objId));
        });
        //console.log(objectIds);
        let companyCOPFilter = "";
        let companyInReviewFilter =
          "firmStatus = 'In Review' and PAREF like 'PA-%'";
        let paFilter = "1=1";

        companyCOPFilter =
          "firmStatus = 'In Review' and objectid in (" +
          objectIds.toString() +
          ")";
        this.layerInfos = {
          info: {
            name: "COPINFO",
            selectedPA: this.paref,

            layers: [
              {
                name: "CompaniesReadyForCOP",
                title: "Companies with PAs Validated by TL",
                url: "https://services9.arcgis.com/sdlGgCbKFs6IzpbE/ArcGIS/rest/services/tunisiajobs_c1_prd/FeatureServer/0",
                filter: companyCOPFilter,
                featureFilter: "objectid = " + this.paObjectId,
                type: "layer",
                symbol: {
                  size: 16,
                  color: "#33cc33",
                },
              },
              {
                name: "CompaniesInReview",
                title: "Companies In Review with PA",
                url: "https://services9.arcgis.com/sdlGgCbKFs6IzpbE/ArcGIS/rest/services/tunisiajobs_c1_prd/FeatureServer/0",
                filter: companyInReviewFilter,
                featureFilter: null,
                type: "layer",
                symbol: {
                  size: 8,
                  color: "#149ECE",
                },
              },
              {
                name: "Partnership_Agreement",
                url: "https://services9.arcgis.com/sdlGgCbKFs6IzpbE/ArcGIS/rest/services/tunisiajobs_c1_prd/FeatureServer/4",
                filter: paFilter,
                type: "table",
              },
            ],
          },
        };
      });
    },
    loadAllCOP() {
      //update filters to select companies/PAs in review that are waiting for Team Lead
    },
  },
  computed: {
    esriCred() {
      return this.$store.state.esriCred;
    },
  },
  watch: {
    esriCred() {
      this.loadPage();
    },
    layerInfos() {},
  },
  mounted() {},
};
</script>