
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

    }
}