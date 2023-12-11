import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import "./global.css";
import VueApexCharts from 'vue3-apexcharts';

// Register VueApexCharts globally
const app = createApp(App);
app.component("apexchart", VueApexCharts);
app.use(router).mount('#app');

