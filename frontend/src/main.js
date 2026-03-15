import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.config.productionTip = false

// 🔥 設定 axios 全域配置
axios.defaults.withCredentials = true;

// 🔥 請求攔截器：自動添加Authorization header（無痕模式fallback）
axios.interceptors.request.use((config) => {
  // 如果有fallback token，就加到Authorization header
  const fallbackToken = sessionStorage.getItem('auth-fallback-token');
  if (fallbackToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${fallbackToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

Vue.use(VueAxios, axios)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
