import axios from "axios";
import store from "../../store";
import database from "@/assets/config/database.json";
export default {
    getSignedParentCompanies(dataInfo, callback) {
        dataInfo.where = "firmStatus = 'Signed'";
        dataInfo.fields = ["*"];
        this.doAxiosGet(dataInfo, (response) => {
            callback(response)
        })
    },
    getCompanyInfoById(dataInfo, objectId, fields, callback) {
        dataInfo.where = dataInfo.objectIdField + " = " + objectId;
        dataInfo.fields = fields;
        this.doAxiosGet(dataInfo, (response) => {
            callback(response[0])
        })
    },
    getPAInfoById(dataInfo, PAREF, fields, callback) {
        dataInfo.where = "PAREF = '" + PAREF + "'";
        dataInfo.fields = fields;
        this.doAxiosGet(dataInfo, (response) => {
            callback(response[0])
        })
    },
    getPaInfos(dataInfo, paWhere, fields, callback) {
        dataInfo.where = paWhere;
        dataInfo.fields = fields;
        this.doAxiosGet(dataInfo, (response) => {
            callback(response)
        })
    },
    getLayerInfos(dataInfo, callback) {
        let url = new URL(dataInfo.url);
        let params = {};
        params = {
            f: "json",
            token: store.state.esriCred.token,
        };
        url.search = new URLSearchParams(params).toString();
        let axioRequest2 = axios.get(url);
        axioRequest2.then((infos) => {
            callback(infos)
        })
    },
    getAttachments(url, objectIds, callback) {

        let aurl = new URL(url + "/queryAttachments");
        let params = {};
        params = {
            objectIds: objectIds,
            f: "json",
            token: store.state.esriCred.token,
        };

        aurl.search = new URLSearchParams(params).toString();
        let axioRequest = axios.get(aurl);
        axioRequest.then((response) => {
            callback(response)
        });
    },
    doAxiosGet(data, callback) {
        let url = new URL(
            data.url + "/query"
        );
        let params = {};
        params = {
            where: data.where,
            outFields: data.fields,
            f: "json",
            returnGeometry: false,
            token: store.state.esriCred.token,
        };

        url.search = new URLSearchParams(params).toString();
        let axioRequest = axios.get(url);
        axioRequest.then((response) => {
            console.log(response)
            callback(response.data.features)
        })
    },
    updateFeatures(dataInfo, features, action, callback) {
        let url;
        if (action === "new") {
            url = new URL(dataInfo.url + "/addFeatures");
        } else {
            url = new URL(dataInfo.url + "/updateFeatures");
        }
        var params = {
            f: "json",
            features: JSON.stringify(features),
            token: store.state.esriCred.token,
        };

        url.search = new URLSearchParams(params).toString();
        // console.log(url);
        let editResponse = {}
        axios.post(url).then((response) => {
            console.log("Edit Response", response);
            if (action === "new") {
                if (response.data.addResults[0].success) {
                    editResponse.success = true;

                } else {
                    editResponse.success = false;
                    editResponse.message =
                        "[error code: " +
                        response.data.addResults[0].error.code +
                        "] " +
                        response.data.addResults[0].error.description;
                }
            } else {
                if (response.data.updateResults[0].success) {
                    editResponse.success = true;

                } else {
                    editResponse.success = false;
                    editResponse.message =
                        "[error code: " +
                        response.data.updateResults[0].error.code +
                        "] " +
                        response.data.updateResults[0].error.description;
                }
            }

            callback(editResponse);
        });
    },
    deleteFeatures(dataInfo, objectId, callback) {
        let url;
        url = new URL(dataInfo.url + "/deleteFeatures");
        var params = {
            f: "json",
            objectIds: objectId,
            token: store.state.esriCred.token,
        };

        url.search = new URLSearchParams(params).toString();
        // console.log(url);
        let editResponse = {}
        axios.post(url).then((response) => {
            console.log("delete Response", response);

            if (response.data.deleteResults[0].success) {
                editResponse.success = true;

            } else {
                editResponse.success = false;
                editResponse.message =
                    "[error code: " +
                    response.data.deleteResults[0].error.code +
                    "] " +
                    response.data.deleteResults[0].error.description;
            }

            callback(editResponse);
        });
    },
    sendEmail(emailInfos, callback) {
        console.log("Email Infos", emailInfos);
        let retVal = {
            message: "Emails Sent",
        };
        let urlWS = "https://arcgis.tunisiajobs.org/jobsapi/api/email/SendEmail";


        //Get Users to email
        console.log("USERWHERE", emailInfos.userIdQuery)
        let dataInfos = {
            url: "https://services9.arcgis.com/sdlGgCbKFs6IzpbE/ArcGIS/rest/services/User_IDs/FeatureServer/0",
            where: emailInfos.userIdQuery,
            fields: ["*"]
        }
        this.doAxiosGet(dataInfos, (users) => {
            let axioRequests = []
            console.log(users)
            users.forEach(user => {
                let data = {
                    email_config: {
                        user_name: user.attributes.ArcUserName,
                        Body: emailInfos.body,
                    },
                };
                let aRequest = axios.post(urlWS, data).then((response) => {
                    console.log("Email Response", response);
                    //callback(response);
                });
                axioRequests.push(aRequest)
            })
            axios.all(axioRequests).then(axios.spread((...responses) => {
                callback(retVal);

            }))


        })




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

}