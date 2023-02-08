import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import "./style.css";
import App from "@prescore/web/src/App.vue";
import Login from "@prescore/web/src/views/Login.vue";
import Dashboard from "@prescore/web/src/views/Dashboard.vue";
import Exam from "@prescore/web/src/views/Exam.vue";

const routes = [
  { path: "/", component: Login },
  { path: "/dashboard", component: Dashboard },
  { path: "/exam/:examId", component: Exam, props: true },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);

app.use(router);

app.mount("#app");
