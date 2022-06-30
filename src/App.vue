<template>
  <v-app>
    <Header />
    <Footer />
    <router-view :key="$route.path"></router-view>
  </v-app>
</template>

<script>
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import Portal from "@arcgis/core/portal/Portal";
import PortalItem from "@arcgis/core/portal/PortalItem";
import axios from "axios";

import Header from "@/components/MainUI/Header.vue";
import Footer from "@/components/MainUI/Footer.vue";
export default {
  name: "App",
  components: { Header, Footer },
  data: () => ({
    //
  }),
  created() {
    if (!this.esriCred) {
      this.esriLogin();
    } else {
      //this.setTheme();
    }
  },
  methods: {
    esriLogin() {
      //alert("Login");
      let vStore = this.$store;
      const main = this;
      const appId = "MJB8m8sDLBtbTa6C";
      const portalUrl = "https://tunisiajobs.maps.arcgis.com";
      const appItemId = "8f4e5903b05d4207aac9df06ee5a5486";

      const info = new OAuthInfo({
        appId: appId,
        portalUrl: portalUrl,
        popup: false,
      });
      const esriId = IdentityManager;
      esriId.registerOAuthInfos([info]);
      console.log(esriId);

      const portal = new Portal({
        url: portalUrl,
        authMode: "immediate",
      });

      portal.load().then(function (results) {
        console.log(results);
        const appItem = new PortalItem({
          id: appItemId,
          portal: portal,
        });
        appItem.load().then(
          function (results) {
            console.log(results);
            let esriCred = esriId.credentials[0];
            //Get User Info
            let url = new URL(
              "https://services9.arcgis.com/sdlGgCbKFs6IzpbE/ArcGIS/rest/services/User_IDs/FeatureServer/0/query"
            );
            let params = {};
            console.log(esriCred);
            params = {
              where: "ArcUserName = '" + esriCred.userId + "'",
              outFields: "*",
              f: "json",
              returnGeometry: false,
              token: esriCred.token,
            };
            console.log(url);
            url.search = new URLSearchParams(params).toString();
            let axioRequest = axios.get(url);
            axioRequest.then((response) => {
              console.log(response);
              vStore.dispatch("setEsriCred", esriCred);
              let userInfos = [];
              response.data.features.forEach((userInfo) => {
                userInfos.push(userInfo);
              });
              console.log("USERINFOS", userInfos);
              vStore.dispatch("setEsriCred", esriCred);
              vStore.dispatch("setUserInfos", userInfos);

              //main.setTheme();
            });
          },
          function () {
            alert("You are not authorized for this application");
          }
        );
      });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.max-main-height-col {
  height: calc(100vh - 100px);
  max-height: calc(100vh - 90px);
  border: #42b983;
}

.editor-max-main-height-col {
  height: calc(100vh - 400px);
  max-height: calc(100vh - 400px);
  border: #42b983;
  overflow-x: hidden;
  overflow-y: auto;
}

.prop-table {
  width: 100%;
}

.prop-alias {
  font-weight: bold;
  width: 40%;
  vertical-align: baseline;
}

.prop-value {
  align-content: left;
  width: 60%;
  vertical-align: baseline;
}
</style>
