import axios from "axios";
import store from "../../store";
import database from "@/assets/config/database.json";
export default {
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
            callback(response.data.features)
        })
    },
    updateFeatures(dataInfo, features, callback) {
        var url = new URL(dataInfo.url + "/updateFeatures");
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
            callback(editResponse);
        });
    }
}