
export default {
    formatDate(value) {
        let formattedValue = "";
        if (value) {
            let dateVal = "/Date(" + value + ")/";
            let date = new Date(parseFloat(dateVal.substr(6)));
            formattedValue = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
        }
        return formattedValue;
    },
    formatTND(value) {

    },
    formatUSD(value) {

    },
    sendEmail() {
        var email_body = `email body`;
        // console.log(email_body);
        // var data = {
        //     "email_config": {
        //         "user_name": created_by,
        //         "Body": email_body
        //     }
        // }
        var urlWS = "https://arcgis.tunisiajobs.org/jobsapi/api/email/SendEmail";
        // var promise = request.post(urlWS, {
        //     data: JSON.stringify(data),
        //     method: 'POST',
        //     handleAs: 'json',
        //     headers: {
        //         "X-Requested-With": null,
        //         "Content-Type": "application/json;charset=UTF-8"
        //     }
        // }
        // ).then(
        //     lang.hitch(this, function (response) {
        //         console.log(response);

        //     }),
        //     lang.hitch(this, function (error) {
        //         console.log("---error", error);
        //     })
        // );
    }
}