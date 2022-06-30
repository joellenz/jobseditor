<template>
  <div>
    <Confirmation
      v-model="showDialog"
      :title="confirmTitle"
      :confirmMessage="confirmMessage"
    />
    <v-row>
      <v-col md="6">
        <h1>Technical Assistance</h1>
        <template v-if="!comId">
          <div>
            <h2>Signed, Parent Companies</h2>
            <template v-if="tableData">
              <v-card>
                <v-data-table
                  :headers="tableData.headers"
                  :items="tableData.data"
                  :item-key="tableData.key"
                  class="elevation-1 details-table"
                  :search="search"
                >
                  >
                  <template v-slot:top>
                    <v-toolbar flat>
                      <v-toolbar-title>{{ tableData.title }}</v-toolbar-title>
                      <v-spacer></v-spacer>
                      <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                      ></v-text-field>
                    </v-toolbar>
                  </template>
                  <template v-slot:item.action="{ item }">
                    <v-icon small @click="editCompanyTA(item)">
                      mdi-pencil
                    </v-icon>
                  </template>
                </v-data-table>
              </v-card>
            </template>
          </div>
        </template>
        <template v-else>
          <v-tabs grow v-model="tab">
            <v-tab>Technical Assistance</v-tab>
            <v-tab>Company Information</v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item>
              <br />
              <TAInfo
                ref="taInfo"
                :companyId="comId"
                :editInfos="editForms"
                :userInfo="taUserRole"
              />
            </v-tab-item>
            <v-tab-item>
              <br />
              <CompanyInfo :objectid="comId" />
            </v-tab-item>
          </v-tabs-items>
        </template>
      </v-col>
      <v-col md="6"
        ><div v-if="layerInfos !== null" class="max-main-height-col">
          <WebMap ref="taMap" :mapId="webMapId" :layersInfo="layerInfos" />
        </div>
        ></v-col
      >
    </v-row>
  </div>
</template>
<script>
//import Map from "@/components/Maps/Map.vue";
import WebMap from "@/components/Maps/WebMap.vue";
import CompanyInfo from "@/components/ESRIHelpers/CompanyInfo.vue";
import TAInfo from "@/components/ESRIHelpers/TAInfo.vue";
// import PAInfo from "@/components/ESRIHelpers/PAInfo.vue";
import queryHelper from "@/assets/scripts/QueryHelper.js";

import confirmation from "@/components/Dialogs/Confirmation.vue";
//Config
import emailConfig from "@/assets/config/email.json";
import database from "@/assets/config/database.json";
import tableDefs from "@/assets/config/tables.json";
import Confirmation from "../components/Dialogs/Confirmation.vue";
export default {
  name: "TA",
  components: { WebMap, CompanyInfo, TAInfo, Confirmation },
  data: () => ({
    webMapId: "316c5a9477bc4d7283f76addc75e66aa",
    taGroups: [
      { group: "TAC", userRole: "creator", userGroup: "TAC Team Member" },
      {
        group: "MEL Specialist",
        userRole: "validator",
        userGroup: "MEL Team Member",
      },
      {
        group: "TAC1",
        userRole: "validator",
        userGroup: "MEL Team Member",
      },
    ],

    taUserRole: null,
    layerInfos: null,
    editForms: null,
    comId: null,
    tableData: null,
    companyInfo: null,
    tab: 0,
    showDialog: false,
    confirmTitle: "Dialog Title",
    confirmMessage: {},
    search: "",
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
    this.loadPage(to.params.comId);
    next();
  },
  methods: {
    loadPage(comId) {
      //Get User Info to determine if they have access to this page and to what access level
      if (comId) {
        if (comId.startsWith("PA-")) {
          comId = comId.replace("PA-", "");
        }
      }
      console.log(this.$store.state.userInfos);
      this.$store.state.userInfos.forEach((userInfo) => {
        console.log("USERINFO", userInfo);
        let userGroup = this.taGroups.find((obj) => {
          return obj.group === userInfo.attributes.UserGroup;
        });
        if (userGroup) {
          console.log("USERROLE", userGroup.userRole);
          this.taUserRole = userGroup;
        }
      });

      let _this = this;
      this.comId = this.$route.params.comId;
      if (this.comId) {
        if (this.comId.startsWith("PA-")) {
          this.comId = this.comId.replace("PA-", "");
        }
      }
      let companyDataInfos = database.datasources.find((obj) => {
        return obj.layerId === "Companies";
      });
      let taDataInfos = database.datasources.find((obj) => {
        return obj.layerId === "TechnichalAssistance";
      });
      taDataInfos.isEditable = true;
      let tapDataInfos = database.datasources.find((obj) => {
        return obj.layerId === "Technical_Assistance_Provider";
      });
      tapDataInfos.isEditable = true;
      let tapcDataInfos = database.datasources.find((obj) => {
        return obj.layerId === "Consultant";
      });
      tapcDataInfos.isEditable = true;
      //alert(this.$route.params.paref);

      let fFilter = null;
      if (this.comId) {
        fFilter = "objectid = " + this.comId;
      }
      //represents layers/tables in the webmap
      companyDataInfos.filter = fFilter;
      companyDataInfos.isEditable = false;
      this.layerInfos = [
        companyDataInfos,
        taDataInfos,
        tapDataInfos,
        tapcDataInfos,
      ];

      if (this.comId) {
        queryHelper.getCompanyInfoById(
          companyDataInfos,
          this.comId,
          ["*"],
          (response) => {
            console.log("Company", response);
            _this.companyInfo = response;
          }
        );
      } else {
        queryHelper.getSignedParentCompanies(
          { url: companyDataInfos.url },
          (response) => {
            _this.loadTableData(companyDataInfos, response);
          }
        );
      }

      //console.log("LAYERINFOS", this.layerInfos);
    },
    loadTableData(dataInfo, data) {
      console.log(tableDefs);
      console.log(dataInfo);
      let tabInfo = tableDefs.tables.find((obj) => {
        return obj.layerId === dataInfo.layerId;
      });
      console.log("TABLEINFO", tabInfo);
      console.log("Companies", data);
      let retHeaders = [];
      tabInfo.headers.forEach((header) => {
        retHeaders.push({
          text: header.alias,
          value: header.name,
          sortable: true,
          align: "start",
        });
      });

      let tableFeatures = [];
      data.forEach((feature) => {
        let dataRow = {};
        tabInfo.headers.forEach((header) => {
          let tval = feature.attributes[header.name];
          if ("format" in header) {
            if (header.format.prefix) {
              tval = header.format.prefix + this.numberWithCommas(tval, 0);
            }
          }
          if ("modify" in header) {
            let newResult = false;
            header.modify.columns.forEach((col) => {
              let v = feature.attributes[col.column];
              if (v === col.value) {
                newResult = true;
              } else {
                newResult = false;
              }
            });
            if (newResult) {
              tval = header.modify.result;
            }
          }

          dataRow[header.name] = tval;
        });
        tableFeatures.push(dataRow);
      });
      this.tableData = {
        objectId: tabInfo.objectid,
        data: tableFeatures,
        headers: retHeaders,
        key: tabInfo.key,
        title: tabInfo.title,
      };
    },
    editCompanyTA(item) {
      console.log("EDITITEM", item);
      this.companyInfo = item;
      this.$router.push({
        name: "TA",
        params: { comId: "PA-" + item.objectid },
      });
    },
    loadEditForms(editObject) {
      console.log("EDITOBJECTS", editObject);
      this.editForms = editObject;
    },
    updateFeature(editObject, action) {
      //this.$refs.taMap.updateFeature(editObject);
      let _this = this;
      queryHelper.updateFeatures(
        editObject,
        [editObject.editFeature],
        action,
        (response) => {
          console.log("EDITRESPONSE", response);
          //callback(response);

          // _this.$refs.taInfo.loadTA(1);
          //this.loadPage(this.comId);
          //_this.tab = 1;
          //send Email if Technical Assitance

          let emailInfos = null;
          //console.log(emailConfig);
          if (editObject.layerId === "TechnichalAssistance") {
            emailInfos = emailConfig.emails.find((obj) => {
              return obj.action === "TA_NEW";
            });
            let companyDataInfos = database.datasources.find((obj) => {
              return obj.layerId === "Companies";
            });
            queryHelper.getCompanyInfoById(
              companyDataInfos,
              this.comId,
              ["*"],
              (response) => {
                console.log("Company", response);

                //_this.companyInfo = response;
                //Update Body
                if (this.taUserRole.userRole === "creator") {
                  //check for BA Validated
                  // emailInfos.userIdQuery =
                  //   "UserGroup = 'MEL Director' or UserGroup = 'MEL Specialist'";
                  emailInfos.userIdQuery = "UserGroup = 'TAC'";
                  emailInfos.body = `****TESTING****A new TA for the ${response.attributes.firmName} has been created. Please review the TA using the following link: https://arcgis.tunisiajobs.org/QA/JOBSEditor/ta/PA-${this.comId}`;
                }
                console.log("EMAILEDITOBJECT", editObject);
                let sendTheEmail = true;
                if (this.taUserRole.userRole === "validator") {
                  if (editObject.editFeature.MEL_validation === "Yes") {
                    emailInfos.userIdQuery = "UserGroup = 'TAC'";
                    emailInfos.body = `****TESTING****The TA for Company: ${response.attributes.firmName} has been validated by the MEL Team. Please review the TA using the following link: https://arcgis.tunisiajobs.org/QA/JOBSEditor/ta/PA-${this.comId}`;
                  } else if (editObject.editFeature.MEL_validation === "No") {
                    emailInfos.userIdQuery = "UserGroup = 'TAC'";
                    emailInfos.body = `****TESTING****The TA for Company: ${response.attributes.firmName} is NOT validated by the MEL Team. Please review MEL Team Comments for the TA using the following link: https://arcgis.tunisiajobs.org/QA/JOBSEditor/ta/PA-${this.comId}`;
                  } else {
                    //don't send email
                    sendTheEmail = false;
                  }
                }

                console.log("EMAILINFOS", emailInfos);
                if (sendTheEmail) {
                  queryHelper.sendEmail(emailInfos, (emailResponse) => {
                    this.$router.go();
                  });
                }
              }
            );
          }

          //this.$router.go();
        }
      );
    },
    deleteFeatures(editObject) {
      let _this = this;
      let objectId = editObject.feature.attributes[editObject.objectIdField];
      queryHelper.deleteFeatures(editObject, objectId, (response) => {
        console.log("DELETERESPONSE", response);
        //callback(response);
        //_this.tab = 1;
        // _this.$refs.taInfo.loadTA(1);
        //this.loadPage(this.comId);
        this.$router.go();
      });
    },
    confirmEdits() {
      this.confirmTitle = "Apply Validation";
      this.confirmMessage.message =
        "Confirm that you wish to modify the validation of " + this.comId;
      this.showDialog = true;
    },
    applyValidation(doEdits) {
      if (!doEdits) {
        return;
      }
      let companyDataInfos = database.datasources.find((obj) => {
        return obj.layerId === "Companies";
      });
      let taDataInfos = database.datasources.find((obj) => {
        return obj.layerId === "Partnership_Agreement";
      });
      if (!this.validatedGroup) {
        alert("PA validation required");
        return;
      }

      let emailInfos = null;
      //console.log(emailConfig);
      if (this.validatedGroup === "Yes") {
        emailInfos = emailConfig.emails.find((obj) => {
          return obj.action === "COP_VALIDATION_YES";
        });
      } else {
        emailInfos = emailConfig.emails.find((obj) => {
          return obj.action === "COP_VALIDATION_NO";
        });
      }

      let copObject = {};
      copObject.validated = this.validatedGroup;
      copObject.companyObjectId = this.coObjectid;
      copObject.paObjectId = this.paObjectid;
      copObject.comments = this.copComments;
      copObject.createdBy = this.paCreatedBy;
      copObject.paref = this.paref;
      const thisApp = this;
      console.log("Edit Object", copObject);
      //Query Company for Firm Name and created by

      copObject.firmName = this.firmName;
      thisApp.applyCompanyEdits(companyDataInfos, copObject, (editResponse) => {
        console.log("Edit Response", editResponse);
        if (editResponse.success) {
          thisApp.actionResults.push({
            message: "Company updates completed successfully",
          });
          thisApp.$router.go();
          thisApp.applyPAEdits(taDataInfos, copObject, (paEditResponse) => {
            if (paEditResponse.success) {
              thisApp.sendEmail(emailInfos, (emailResponse) => {
                //only send emails once the PA is Updated
              });
            } else {
              thisApp.actionResults.push(
                { message: "Partnership Agreement updates failed" },
                { message: editResponse.message }
              );
            }
          });
        } else {
          thisApp.actionResults.push(
            { message: "Company updates failed" },
            { message: editResponse.message }
          );
        }
      });
    },
    applyCompanyEdits(companyDataInfos, copObject, callback) {
      console.log("Edit Object", copObject);
      let coFeatures = [];
      if (copObject.validated === "Yes") {
        coFeatures = [
          {
            attributes: {
              objectid: copObject.companyObjectId,
              firmStatus: "Signed",
            },
          },
        ];
      } else {
        coFeatures = [
          {
            attributes: {
              objectid: copObject.companyObjectId,
              firmStatus: "In Review",
            },
          },
        ];
      }
      queryHelper.updateFeatures(companyDataInfos, coFeatures, (response) => {
        callback(response);
      });
    },
    applyPAEdits(copObject, callback) {
      //if Yes
      //change firm status to signed
      //Required Company Info
      //Object ID, change firmStatus i f validated = "Yes",
      //required PA
      //objectid, Created By User, comments, validated, signature date if validated = "Yes", TLG_APPROVED = "" if validated = "No"
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
    webMapId() {},
    layerInfos() {},
    headerFields() {},
    actionResults() {},
  },
  beforeDestroy() {
    this.$root.$off("updateFeature");
  },
  mounted() {
    this.$root.$on("doEdits", (doEdits) => {
      return this.applyValidation(doEdits);
    });
    this.$root.$on("loadEditForms", (editObject) => {
      return this.loadEditForms(editObject);
    });
    this.$root.$on("updateFeature", (editObject, action) => {
      return this.updateFeature(editObject, action);
    });
    this.$root.$on("deleteFeatures", (editObject) => {
      return this.deleteFeatures(editObject);
    });
  },
};
</script>
<style>
.max-height-tab-conents {
  height: calc(100vh - 220px);
  max-height: calc(100vh - 230px);
  border: #42b983;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>