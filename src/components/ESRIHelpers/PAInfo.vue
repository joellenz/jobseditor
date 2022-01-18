<template>
  <div>
    <v-row justify="center">
      <v-expansion-panels v-model="panel" accordion>
        <v-expansion-panel>
          <v-expansion-panel-header
            >Partnership Agreement Attachments</v-expansion-panel-header
          >
          <v-expansion-panel-content>
            <Attachments
              v-if="objectid"
              :url="attachmentUrl"
              :objectid="objectid"
            />
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-for="(group, g) in paGroups" :key="g">
          <v-expansion-panel-header>{{ group.title }}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <table class="prop-table">
              <tr v-for="(info, i) in group.columns" :key="i">
                <td align="right" class="prop-alias">{{ info.alias }}:</td>
                <td align="left" class="prop-value">
                  {{ info.value }}
                </td>
              </tr>
            </table>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
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
  name: "PAInfo",
  components: { Attachments },
  props: {
    paref: {
      typeof: String,
    },
  },
  data: () => ({
    panel: 0,
    objectid: null,
    selectedPA: null,
    attachmentUrl: null,
    paInfos: [],
    paGroups: [],
  }),
  created() {
    let paDataInfos = database.datasources.find((obj) => {
      return obj.layerId === "Partnership_Agreement";
    });
    let configFields = attributeConfig.layerIds.find((obj) => {
      return obj.layerId === "Partnership_Agreement";
    });
    this.attachmentUrl = paDataInfos.url;
    queryHelper.getPAInfoById(paDataInfos, this.paref, ["*"], (response) => {
      queryHelper.getLayerInfos(paDataInfos, (infos) => {
        let feature = response;
        let paInfos = [];

        configFields.groups.forEach((group) => {
          let groupInfo = { title: group.title };
          let paInfos = [];
          group.columns.forEach((cField) => {
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
                      paInfos.push({
                        name: field.name,
                        alias: field.alias,
                        value: codeValue.name,
                      });
                    } else {
                      paInfos.push({
                        name: field.name,
                        alias: field.alias,
                        value: dValue,
                      });
                    }
                  } else {
                    if (field.type === "esriFieldTypeDate") {
                      paInfos.push({
                        name: field.name,
                        alias: field.alias,
                        value: commonHelper.formatDate(
                          feature.attributes[field.name]
                        ),
                      });
                    } else {
                      paInfos.push({
                        name: field.name,
                        alias: field.alias,
                        value: feature.attributes[field.name],
                      });
                    }
                  }
                }
              });
            }
          });
          groupInfo.columns = paInfos;
          this.paGroups.push(groupInfo);
        });
        console.log("PA Groupings", this.paGroups);
        this.selectedPA = response;
        this.objectid = this.selectedPA.attributes["objectid"];
      });
    });
  },
  computed: {},
};
</script>
<style>
</style>