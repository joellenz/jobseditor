<template>
  <div>
    <h1>Tunisa JOBS - Editing Applications</h1>
    <v-row>
      <v-col md="4"></v-col>
      <v-col md="4">
        <!-- <router-link v-bind:to="'cop'" tag="v-btn"
          ><v-btn class="primary" flat value="feed">
            <span>COP - PA Validation</span>
            <v-icon>mdi-check</v-icon>
          </v-btn></router-link
        > -->
        <br />

        <br />
        <router-link v-bind:to="'ta'" tag="v-btn"
          ><v-btn class="primary" flat value="feed">
            <span>TA Editing Application</span>
            <v-icon>mdi-pencil</v-icon>
          </v-btn></router-link
        >
      </v-col>
      <v-col md="4"></v-col>
    </v-row>
    <br />
    <!-- <router-link v-bind:to="'grants'">Grants </router-link><br />
    <router-link v-bind:to="'atf'">ATF</router-link><br />
    <router-link v-bind:to="'wfd'">WFD</router-link><br /> -->
  </div>
</template>

<script>
//import HelloWorld from "../components/HelloWorld";

export default {
  name: "Home",

  components: {},
};
</script>
