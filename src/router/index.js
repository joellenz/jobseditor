import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/editor",
    name: "Editor",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Editor.vue"),
  },
  // {
  //   path: "/cop/:paref?",
  //   name: "COP",
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/COP.vue"),
  // },
  {
    path: "/grants/:id?",
    name: "GRANTS",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Grants.vue"),
  },
  {
    path: "/atf/:id?",
    name: "ATF",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/ATF.vue"),
  },
  {
    path: "/wfd/:id?",
    name: "WFD",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/WFD.vue"),
  },
  {
    path: "/ta/:comId?",
    name: "TA",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/TA.vue"),
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
