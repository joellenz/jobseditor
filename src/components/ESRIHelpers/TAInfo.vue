<template>
  <div>
    <h3 v-if="companyInfo !== null">
      {{ companyInfo.attributes.firmName }} - Technical Assitance
    </h3>
    <h4 v-if="userRole === 'creator'">Create and Edit Technical Assitance</h4>
    <h4 v-if="userRole === 'validator'">Validate Technical Assitance</h4>
    <h4 v-if="userRole === 'viewer'">View only role</h4>
    <h5>User Role: {{ userRole }}</h5>
    <br />
    <template>
      <div class="head-btns">
        <v-btn @click="newTA()" class="primary">Create New TA</v-btn>
      </div>
      <br />
      <v-row align-content="start">
        <v-col style="text-align: start" md="6">
          <template v-if="editInfos">
            <v-treeview open-all hoverable :items="editInfos.treeView"
              ><template slot="label" slot-scope="{ item }">
                <template v-if="userRole === 'creator'">
                  <v-toolbar :class="item.class">
                    <v-toolbar-title>{{ item.name }} </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn
                      v-if="item.editBtn"
                      small
                      icon
                      class="primary tree-btn"
                      color="#ffff"
                      @click="openEdit(item)"
                      :title="item.editTitle"
                      ><v-icon x-small color="#fffff">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="item.createBtn"
                      small
                      icon
                      class="primary tree-btn"
                      color="#ffff"
                      @click="createFeature(item)"
                      :title="item.createTitle"
                      ><v-icon x-small color="#fffff">mdi-plus</v-icon>
                    </v-btn>
                  </v-toolbar>
                </template>
                <template v-if="userRole === 'validator'">
                  <v-toolbar>
                    <v-toolbar-title>{{ item.name }} </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn
                      v-if="item.validateBtn"
                      small
                      icon
                      class="primary tree-btn"
                      color="#ffff"
                      @click="openEdit(item)"
                      :title="item.title"
                      ><v-icon x-small color="#fffff">mdi-check</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="!item.validateBtn"
                      small
                      icon
                      class="primary tree-btn"
                      color="#ffff"
                      @click="openView(item)"
                      :title="item.title"
                      ><v-icon x-small color="#fffff"
                        >mdi-eye-arrow-right</v-icon
                      >
                    </v-btn>
                  </v-toolbar>
                </template>
                <template v-if="userRole === 'viewer'">
                  <v-toolbar>
                    <v-toolbar-title>{{ item.name }} </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn
                      v-if="item.editBtn"
                      small
                      icon
                      class="primary tree-btn"
                      color="#ffff"
                      @click="openView(item)"
                      :title="item.title"
                      ><v-icon x-small color="#fffff"
                        >mdi-eye-arrow-right</v-icon
                      >
                    </v-btn>
                  </v-toolbar>
                </template>
              </template></v-treeview
            >
          </template>
          <template v-else>
            <h3>Loading...</h3>
          </template>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col md="6">
          <template v-if="editObject">
            <h3>{{ editObject.title }}</h3>
            <div class="editor-max-main-height-col">
              <template v-if="editObject.popupDisplay.length > 0">
                <h4>Information Fields</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="prop in editObject.popupDisplay"
                      :key="prop.fieldName"
                    >
                      <td class="prop">{{ prop.label }}</td>
                      <td class="prop-value">{{ prop.recValue }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
              <template v-if="editObject.popupEdit.length > 0">
                <h4>Edit Fields</h4>

                <table>
                  <tbody>
                    <tr
                      v-for="prop in editObject.popupEdit"
                      :key="prop.fieldName"
                    >
                      <!-- <td class="prop">{{ prop.label }}</td> -->
                      <td class="prop-value">
                        <template v-if="prop.domain">
                          <v-combobox
                            :id="prop.fieldName"
                            :items="prop.domain.codedValues"
                            :label="prop.fieldName"
                            :value="prop.recValue"
                            :ref="prop.fieldName"
                            item-text="name"
                            item-value="code"
                          ></v-combobox>
                        </template>

                        <template v-else>
                          <v-text-field
                            v-if="
                              prop.fieldType === 'esriFieldTypeString' ||
                              prop.fieldType === 'esriFieldTypeSmallInteger'
                            "
                            :id="prop.fieldName"
                            :label="prop.label"
                            :value="prop.recValue"
                          ></v-text-field>
                          <template
                            v-if="prop.fieldType === 'esriFieldTypeDate'"
                          >
                          </template>
                        </template>
                      </td>
                    </tr>
                    <!-- :return-value.sync="formDate.date" -->
                    <tr v-for="(formDate, f) in editObject.formDates" :key="f">
                      <v-menu
                        v-model="menu[editObject.formDates.indexOf(formDate)]"
                        :close-on-content-click="true"
                        transition="scale-transition"
                        min-width="auto"
                        offset-y
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            v-model="formDate.date"
                            :label="formDate.label"
                            :id="formDate.fieldName"
                            prepend-icon="mdi-calendar"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="formDate.date"
                          @input="
                            menu[editObject.formDates.indexOf(formDate)] = false
                          "
                          no-title
                        >
                          <v-spacer></v-spacer>
                          <!-- <v-btn
                          text
                          color="primary"
                          @click="cancelDate(formDate.fieldName)"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="saveDate(formDate.date, formDate.fieldName)"
                        >
                          OK
                        </v-btn> -->
                        </v-date-picker>
                      </v-menu>
                    </tr>
                  </tbody>
                </table>
              </template>
              <br />
              <v-row>
                <v-col md="12">
                  <v-btn class="primary" @click="cancelEdit()">Cancel</v-btn>
                  <v-btn
                    class="primary"
                    v-if="editFormStatus !== 'new'"
                    @click="deleteFeature()"
                    >Delete</v-btn
                  >
                  <v-btn class="primary" @click="submitEdit()">Submit</v-btn>
                </v-col>
              </v-row>
            </div>
          </template>
          <template v-else
            ><h3>Choose an action in the left panel</h3></template
          >
        </v-col>
      </v-row>
    </template>
  </div>
</template>
<script>
import database from "@/assets/config/database.json";
import queryHelper from "@/assets/scripts/QueryHelper.js";
export default {
  name: "TAInfo",
  props: {
    companyId: { typeof: Number },
    editInfos: { typeof: Object },
    userRole: { typeof: String },
  },
  data: () => ({
    editObject: null,
    selectedDate: null,
    menu: [],
    formDates: [],
    editFormStatus: null,
    companyInfo: null,
  }),
  methods: {
    cancelDate(fieldName) {
      console.log(this.menu);
      console.log(fieldName);
      this.menu = [];
    },
    saveDate(date, fieldName) {
      console.log(this.menu);
      console.log(date);
      console.log(fieldName);
      this.menu = [];
    },
    loadTA(tab) {
      //console.log("EDITINFOS", this.editInfos);
      //need to build edit form(s) for layer infos
      //this.buildeditForm("new", null);
      let companyDataInfos = database.datasources.find((obj) => {
        return obj.layerId === "Companies";
      });
      let _this = this;
      queryHelper.getCompanyInfoById(
        companyDataInfos,
        this.companyId,
        ["*"],
        (response) => {
          console.log("Company", response);
          _this.companyInfo = response;
        }
      );
    },
    cancelEdit() {
      this.editObject = null;
    },

    openView(item) {
      console.log("EDITITEM", item);
      let editI = this.editInfos.formInfos.find((obj) => {
        return obj.layerId === item.layerId;
      });
      editI.feature = item.feature;
      this.buildeditForm("edit", editI);
    },
    openEdit(item) {
      console.log("EDITITEM", item);
      console.log("EDITINFOS", this.editInfos);
      let editI = this.editInfos.formInfos.find((obj) => {
        return obj.layerId === item.layerId;
      });
      editI.feature = item.feature;
      this.buildeditForm("edit", editI);
    },
    createFeature(item) {
      console.log("CREATEFEATURE", item);
      let parentIndex = this.editInfos.formInfos.findIndex((obj) => {
        return obj.layerId === item.layerId;
      });
      let editI = this.editInfos.formInfos[parentIndex + 1];
      editI.features = [];
      editI.feature = {}; //this.editInfos.formInfos[parentIndex + 1].feature;
      editI.ParentGUID = item.feature.attributes.GlobalID;
      this.buildeditForm("new", editI);
    },
    buildeditForm(action, editI) {
      this.editFormStatus = action;
      this.editObject = null;
      console.log("EDITOBJECT", editI);
      let formDates = [];
      let dateIndex = 0;
      editI.popupDisplay.forEach((pitem) => {
        if (action !== "new") {
          let v = editI.feature.attributes[pitem.fieldName];
          if (pitem.fieldType === "esriFieldTypeDate") {
            if (v) {
              v = new Date(v - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .substr(0, 10);
            } else {
              v = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .substr(0, 10);
            }
          }

          pitem.recValue = v;
        } else {
          pitem.recValue = null;
        }
      });
      editI.popupEdit.forEach((pitem) => {
        //new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10)
        if (action !== "new") {
          let v = editI.feature.attributes[pitem.fieldName];
          if (pitem.fieldType === "esriFieldTypeDate") {
            if (v) {
              v = new Date(v - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .substr(0, 10);
            } else {
              v = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .substr(0, 10);
            }
            formDates.push({
              id: dateIndex,
              fieldName: pitem.fieldName,
              label: pitem.label,
              date: v,
            });
            dateIndex += 1;
          }
          pitem.recValue = v;
        } else {
          pitem.recValue = null;
          if (pitem.fieldType === "esriFieldTypeDate") {
            formDates.push({
              id: dateIndex,
              fieldName: pitem.fieldName,
              label: pitem.label,
              date: new Date(
                Date.now() - new Date().getTimezoneOffset() * 60000
              )
                .toISOString()
                .substr(0, 10),
            });
            dateIndex += 1;
          }
        }
      });
      editI.formDates = formDates;
      console.log(formDates);
      this.editObject = editI;
    },
    newTA() {
      //this.editObject = null;
      console.log("EDITINFOS", this.editInfos);
      let editI;

      editI = this.editInfos.formInfos[0];
      editI.feature = {};
      editI.features = [];
      //need to get globalID from Company
      console.log("COMPANYINFO", this.companyInfo);
      editI.ParentGUID = this.companyInfo.attributes.globalid;
      this.buildeditForm("new", editI);
    },
    async submitEdit() {
      console.log("SUBMITUPDATE", this.editObject);
      let editFeature = {};
      let editAttributes = {};
      this.editObject.popupEdit.forEach((editField) => {
        let element = document.getElementById(editField.fieldName);
        let formValue;
        if (element) {
          formValue = element.value;
          if (editField.domain) {
            let codedValue = editField.domain.codedValues.find((obj) => {
              return obj.name === formValue;
            });
            if (!codedValue) {
              //means there is a domain, but the value entered or null doesnot exist
              formValue = null;
            } else {
              formValue = codedValue.code;
            }
          }
          //console.log(editField.fieldName + ": " + element.value);
        } else {
          formValue = null;
          //console.log(editField.fieldName + " was not found");
        }
        editAttributes[editField.fieldName] = formValue;
      });
      editAttributes.ParentGUID = this.editObject.ParentGUID;
      //TODO: Add Config for Defaults like user, mel_validation...
      if (this.editFormStatus !== "new") {
        //add ObjectId
        editAttributes[this.editObject.objectIdField] =
          this.editObject.feature.attributes[this.editObject.objectIdField];
      }
      editFeature.attributes = editAttributes;
      this.editObject.editFeature = editFeature;
      console.log("Feature to Edit", this.editObject);
      let title;
      let message;
      title = `Update ${this.editObject.title}`;
      message = `Confirm that the selected ${this.editObject.title} should be updated.`;

      let res = await this.$dialog.confirm({
        text: message,
        title: title,
        persistent: true,
        waitForResult: true,
        actions: {
          false: "Cancel",
          true: {
            color: "primary",
            text: "Confirm",
            handle: () => {
              return new Promise((resolve) => {
                setTimeout(resolve, 3000);
              });
            },
          },
        },
      });
      console.log("RES", res);
      if (res) {
        console.log("CALLINGUPDATEEMIT");
        this.$root.$emit("updateFeature", this.editObject, this.editFormStatus);
      }
    },
    async deleteFeature() {
      console.log("DELETEFEATURE", this.editObject);
      let title;
      let message;
      title = `Delete ${this.editObject.title}`;
      message = `Confirm that the selected ${this.editObject.title} should be deleted.`;

      let res = await this.$dialog.confirm({
        text: message,
        title: title,
        persistent: true,
        waitForResult: true,
        actions: {
          false: "Cancel",
          true: {
            color: "primary",
            text: "Confirm",
            handle: () => {
              return new Promise((resolve) => {
                setTimeout(resolve, 3000);
              });
            },
          },
        },
      });
      console.log("RES", res);
      if (res) {
        this.$root.$emit("deleteFeatures", this.editObject);
      }
    },
    reloadEditObject(editObject) {},
  },
  computed: {},
  watch: {
    editObject() {},
    formDates() {},
  },
  mounted() {
    this.loadTA();
  },
};
</script>
<style>
table {
  width: 100%;
}

.tree-label {
  padding-left: 10px;
}
.grand-parent {
  background-color: #1b68b3 !important;
  color: #ffff !important;
  border-top-left-radius: 25px !important;
  border-bottom-left-radius: 25px !important;
  margin-top: 15px;
}
.parent {
  background-color: #a8c5e7 !important;
  border-top-left-radius: 25px !important;
  border-bottom-left-radius: 25px !important;
}
.child {
  background-color: #c9c9c9 !important;
  border-top-left-radius: 25px !important;
  border-bottom-left-radius: 25px !important;
}
</style>