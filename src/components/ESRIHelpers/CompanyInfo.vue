<template>
  <div>
    <v-row justify="center">
      <v-col md="6">
        <h3>Company Information</h3>
        <template v-if="selectedCompany">
          <table class="prop-table">
            <tr v-for="(info, i) in companyInfos" :key="i">
              <td align="right" class="prop-alias">{{ info.alias }}:</td>
              <td align="left" class="prop-value">
                {{ info.value }}
              </td>
            </tr>
          </table>
        </template>
      </v-col>
      <v-col md="6">
        <h3>Company Attachments</h3>
        <Attachments
          v-if="objectid"
          :url="attachmentUrl"
          :objectid="objectid"
        />
      </v-col>
    </v-row>
  </div>
</template>
<script>
import Attachments from "@/components/ESRIHelpers/Attachments.vue";
import queryHelper from "@/assets/scripts/QueryHelper.js";
import commonHelper from "@/assets/scripts/CommonHelper.js";
//Config
import database from "@/assets/config/database.json";
import attributeConfig from "@/assets/config/attributeConfig.json";

export default {
  name: "CompanyInfo",
  components: { Attachments },
  props: {
    objectid: {
      typeof: Number,
    },
  },
  data: () => ({
    panel: 0,
    selectedCompany: null,
    attachmentUrl: null,
  }),
  created() {
    let companyDataInfos = database.datasources.find((obj) => {
      return obj.layerId === "Companies";
    });
    let configFields = attributeConfig.layerIds.find((obj) => {
      return obj.layerId === "Companies";
    });
    this.attachmentUrl = companyDataInfos.url;
    queryHelper.getCompanyInfoById(
      companyDataInfos,
      this.objectid,
      ["*"],
      (response) => {
        queryHelper.getLayerInfos(companyDataInfos, (infos) => {
          let feature = response;
          this.companyInfos = [];
          //let tempInfos = [];

          configFields.popups.forEach((cField) => {
            if (cField.display) {
              infos.data.fields.forEach((field) => {
                if (cField.name === field.name) {
                  //check for domains
                  if (field.domain) {
                    //gotta get domain value
                    let dValue = feature.attributes[field.name];
                    let codeValue = field.domain.codedValues.find((obj) => {
                      return obj.code === dValue;
                    });
                    if (codeValue) {
                      this.companyInfos.push({
                        name: field.name,
                        alias: cField.alias,
                        value: codeValue.name,
                      });
                    } else {
                      this.companyInfos.push({
                        name: field.name,
                        alias: cField.alias,
                        value: dValue,
                      });
                    }
                  } else {
                    if (field.type === "esriFieldTypeDate") {
                      this.companyInfos.push({
                        name: field.name,
                        alias: cField.alias,
                        value: commonHelper.formatDate(
                          feature.attributes[field.name]
                        ),
                      });
                    } else {
                      this.companyInfos.push({
                        name: field.name,
                        alias: cField.alias,
                        value: feature.attributes[field.name],
                      });
                    }
                  }
                }
              });
            }
          });
          this.selectedCompany = response;
        });
      }
    );
  },
  watch: {
    companyInfos() {},
  },
  computed: {},
};
</script>
<style>
</style>