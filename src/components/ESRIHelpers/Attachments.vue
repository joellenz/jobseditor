<template>
  <div>
    <h3>Documents</h3>
    <table class="prop-table">
      <tr v-for="(info, i) in attachments" :key="i">
        <!-- <td class="prop-alias">{{ info.name }}</td> -->
        <td v-if="!info.isImage" class="prop-value">
          <a :href="info.attachURL" target="_blank">{{ info.name }}</a>
        </td>
      </tr>
    </table>
    <h3>Photos/Images</h3>
    <table class="prop-table">
      <tr v-for="(info, i) in attachments" :key="i">
        <td v-if="info.isImage" class="prop-value">
          <a :href="info.attachURL" target="_blank"
            ><img class="attach-photo" :src="info.attachURL"
          /></a>
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
import queryHelper from "@/assets/scripts/QueryHelper.js";
export default {
  name: "Attachments",
  props: {
    url: {
      typeof: String,
    },
    objectid: {
      typeof: Number,
    },
  },
  data: () => ({
    attachments: [],
  }),
  created() {
    console.log("Attacment URL", this.url + "/queryAttachments");
    queryHelper.getAttachments(this.url, [this.objectid], (response) => {
      console.log("attachments", response);
      let attGroups = response.data.attachmentGroups;
      attGroups.forEach((group) => {
        group.attachmentInfos.forEach((info) => {
          info.attachURL =
            this.url +
            "/" +
            this.objectid +
            "/attachments/" +
            info.id +
            "?token=" +
            this.esriCred.token;
          if (
            info.contentType === "image/jpeg" ||
            info.contentType == "image/png"
          ) {
            info.isImage = true;
          }
          this.attachments.push(info);
        });
      });
    });
  },
  computed: {
    esriCred() {
      return this.$store.state.esriCred;
    },
  },
};
</script>
<style>
.attach-photo {
  max-width: 100%;
}
</style>