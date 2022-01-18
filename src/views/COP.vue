<template>
  <div>
    <Confirmation
      v-model="showDialog"
      :title="confirmTitle"
      :confirmMessage="confirmMessage"
    />
    <v-row>
      <v-col md="6">
        <h1>COP PA Validation</h1>
        <template v-if="this.paref">
          <div>
            <h2>{{ firmName }} - {{ paref }} - {{ firmStatus }}</h2>
          </div>
          <v-tabs v-model="tab" grow>
            <v-tab style="color: #1e3468" class="text-caption">
              Company Information
            </v-tab>
            <v-tab style="color: #1e3468" class="text-caption">
              PA Information
            </v-tab>
            <v-tab style="color: #1e3468" class="text-caption">
              PA Validation
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item>
              <div class="max-height-tab-conents">
                <CompanyInfo :objectid="coObjectid" />
              </div>
            </v-tab-item>
            <v-tab-item>
              <div class="max-height-tab-conents">
                <PAInfo :paref="paref" />
              </div>
            </v-tab-item>

            <v-tab-item
              ><div class="max-height-tab-conents">
                <v-row>
                  <v-col md="6" offset="3" justify>
                    <v-card
                      elevation="4"
                      style="margin-top: 25px; padding: 10px"
                    >
                      <v-row>
                        <v-col md="4"> PA Validated: </v-col>
                        <v-col md="8">
                          <v-radio-group v-model="validatedGroup" row>
                            <v-radio label="Yes" value="Yes"></v-radio>
                            <v-radio label="No" value="No"></v-radio>
                          </v-radio-group>
                        </v-col>
                      </v-row>

                      <v-textarea
                        name="input-7-1"
                        filled
                        label="Please enter comments here"
                        auto-grow
                        value=""
                        v-model="copComments"
                      ></v-textarea>

                      <v-btn primary @click="confirmEdits()">Apply</v-btn>
                      <template v-if="actionResults">
                        {{ actionResults.message }}
                      </template>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-tab-item>
          </v-tabs-items>
        </template>
        <template v-if="!this.paref">
          <div>
            <h2>TL Validated PAs</h2>
            <template v-if="editFeatures.length > 0">
              <v-row no-gutters v-for="(feature, f) in editFeatures" :key="f">
                <v-col v-for="(col, c) in headerFields" :key="c">
                  <v-card>
                    <v-btn
                      depressed
                      color="primary"
                      @click="loadPAREF(feature.attributes[col.name])"
                    >
                      {{ feature.attributes[col.name] }}
                    </v-btn>
                  </v-card>
                </v-col>
              </v-row>
            </template>
            <template v-if="editFeatures.length === 0">
              <h3>There are no Validated PAs to review!</h3>
            </template>
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
import CompanyInfo from "@/components/ESRIHelpers/CompanyInfo.vue";
import PAInfo from "@/components/ESRIHelpers/PAInfo.vue";
import queryHelper from "@/assets/scripts/QueryHelper.js";

import confirmation from "@/components/Dialogs/Confirmation.vue";
//Config
import emailConfig from "@/assets/config/email.json";
import database from "@/assets/config/database.json";
import Confirmation from "../components/Dialogs/Confirmation.vue";
export default {
  name: "COP",
  components: { Map, CompanyInfo, PAInfo, Confirmation },
  data: () => ({
    showDialog: false,
    confirmTitle: "Dialog Title",
    confirmMessage: {},
    column: null,
    row: null,
    tab: null,
    paref: null,
    firmName: null,
    firmStatus: null,
    paObjectid: null,
    coObjectid: null,
    paCreatedBy: null,
    layerInfos: null,
    editFeatures: [],
    headerFields: [],
    validatedGroup: null,
    copComments: "",
    actionResults: [],
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
      this.paref = this.$route.params.paref;
      let companyDataInfos = database.datasources.find((obj) => {
        return obj.layerId === "Companies";
      });
      let paDataInfos = database.datasources.find((obj) => {
        return obj.layerId === "Partnership_Agreement";
      });
      //alert(this.$route.params.paref);

      let paWhere = "";
      if (this.paref) {
        let stringObjectId = this.paref.split("-")[1];
        this.coObjectid = parseInt(stringObjectId);
        //apply the filter to select the company and PA
        //console.log(this.layerInfos);
        paWhere =
          "PAREF = '" +
          this.paref +
          "' and TLG_APPROVED = 'Yes' and COP_SIgnature_validated = 'No' and Field9 <> 1";
        //Get
        queryHelper.getCompanyInfoById(
          companyDataInfos,
          this.coObjectid,
          ["firmName", "firmStatus"],
          (response) => {
            if (response.attributes.firmStatus === "Signed") {
              this.validatedGroup = "Yes";
            } else {
              this.validatedGroup = "No";
            }
            this.firmStatus = response.attributes.firmStatus;
            this.firmName = response.attributes.firmName;
            //alert(response.attributes.firmName);
            //if (response.attributes.firmStatus === "Signed") {
            //Get PA Info

            //}
          }
        );
        queryHelper.getPAInfoById(
          paDataInfos,
          this.paref,
          ["PA_signatureDate", "TL_Comments", "BA_Comments", "COP_Comments"],
          (response) => {
            this.paWorkFlow = {
              baComments: response.attributes.BA_Comments,
              tlComments: response.attributes.TL_Comments,
              copComments: response.attributes.COP_Comments,
              copSignDate: response.attributes.PA_signatureDate,
            };
            if (this.paWorkFlow.copComments) {
              this.copComments = this.paWorkFlow.copComments;
            }
            console.log("PA Workflow", this.paWorkFlow);
          }
        );
      } else {
        paWhere =
          "TLG_APPROVED = 'Yes' and COP_SIgnature_validated = 'No' and Field9 <> 1";
      }

      queryHelper.getPaInfos(paDataInfos, paWhere, ["*"], (response) => {
        this.editFeatures = response;
        console.log("Edit Features", this.editFeatures);
        let objectIds = [];
        this.editFeatures.forEach((feature) => {
          let objId = feature.attributes["PAREF"].split("-")[1];
          objectIds.push(parseInt(objId));
          this.paObjectid = feature.attributes.objectid;
          this.paCreatedBy = feature.attributes.Field8;
          if (!this.paCreatedBy) {
            this.paCreatedBy = feature.attributes.Creator;
          }
        });
        let companyCOPFilter = "";
        let companyInReviewFilter =
          "firmStatus = 'In Review' and PAREF like 'PA-%'";
        let paFilter = "1=1";

        companyCOPFilter =
          "firmStatus = 'In Review' and objectid in (" +
          objectIds.toString() +
          ")";
        this.headerFields = [
          {
            name: "PAREF",
            alias: "PA REF",
          },
        ];
        let fFilter =
          this.coObjectid === null ? null : "objectid = " + this.coObjectid;
        this.layerInfos = {
          info: {
            name: "COPINFO",
            selectedPA: this.paref,

            layers: [
              {
                name: "CompaniesReadyForCOP",
                title: "Companies with PAs Validated by TL",
                url: companyDataInfos.url,
                filter: companyCOPFilter,
                featureFilter: fFilter,
                type: "layer",
                symbol: {
                  size: 16,
                  color: "#33cc33",
                },
              },
              {
                name: "CompaniesInReview",
                title: "Companies In Review with PA",
                url: companyDataInfos.url,
                filter: companyInReviewFilter,
                featureFilter: null,
                type: "layer",
                symbol: {
                  size: 8,
                  color: "#149ECE",
                },
                fields: [
                  {
                    name: "firmName",
                    alias: "Company Name",
                    visible: true,
                    editable: false,
                    titleBlock: true,
                    domain: [],
                  },
                ],
              },
              {
                name: "Partnership_Agreement",
                url: paDataInfos.url,
                filter: paFilter,
                type: "table",
              },
            ],
          },
        };
      });
    },
    loadPAREF(paRef) {
      //alert(paRef);
      const path = `/cop/${paRef}`;
      this.$router.push({ name: "COP", params: { paref: paRef } });
    },
    loadAllCOP() {
      //update filters to select companies/PAs in review that are waiting for Team Lead
    },
    confirmEdits() {
      this.confirmTitle = "Apply Validation";
      this.confirmMessage.message =
        "Confirm that you wish to modify the validation of " + this.paref;
      this.showDialog = true;
    },
    applyValidation(doEdits) {
      if (!doEdits) {
        return;
      }
      let companyDataInfos = database.datasources.find((obj) => {
        return obj.layerId === "Companies";
      });
      let paDataInfos = database.datasources.find((obj) => {
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
          thisApp.applyPAEdits(paDataInfos, copObject, (paEditResponse) => {
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
    sendEmail(emailInfos, callback) {
      console.log("Email Infos", emailInfos);
      let retVal = {
        message: "Emails Sent",
      };
      callback(retVal);
      // var data = {
      //   email_config: {
      //     user_name: created_by,
      //     Body: `The PA for the company ${companyName} uploaded by you under the reference ${feature.attributes.PAREF} is signed by COP/DCOP.<br/> Please click this link to upload documents and proceed further https://arcgis.tunisiajobs.org/c1/main/BA`,
      //   },
      // };
      // var urlWS = "https://arcgis.tunisiajobs.org/jobsapi/api/email/SendEmail";
      // var promise = request
      //   .post(urlWS, {
      //     data: JSON.stringify(data),
      //     method: "POST",
      //     handleAs: "json",
      //     headers: {
      //       "X-Requested-With": null,
      //       "Content-Type": "application/json;charset=UTF-8",
      //     },
      //   })
      //   .then(
      //     lang.hitch(this, function (response) {
      //       console.log(response);
      //     }),
      //     lang.hitch(this, function (error) {
      //       console.log("---error", error);
      //     })
      //   );
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
    headerFields() {},
    actionResults() {},
  },
  mounted() {
    this.$root.$on("doEdits", (doEdits) => {
      return this.applyValidation(doEdits);
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