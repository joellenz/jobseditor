<template>
  <div>
    <h1>Tunisa JOBS - Editing Applications</h1>
    <router-link v-bind:to="'cop'">COP</router-link><br />
    <router-link v-bind:to="'grants'">Grants</router-link><br />
    <router-link v-bind:to="'atf'">ATF</router-link><br />
    <router-link v-bind:to="'wfd'">WFD</router-link><br />
    <router-link v-bind:to="'ta'">TA</router-link><br />
  </div>
</template>

<script>
//import HelloWorld from "../components/HelloWorld";

export default {
  name: "Home",

  components: {},
};
</script>
