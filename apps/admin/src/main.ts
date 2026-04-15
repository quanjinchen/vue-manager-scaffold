import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import App from '@/App.vue';
import router from '@/router';
import ui from '@vue-scaffold/ui';
import { configureAppRequest, configureHttpHooks } from '@vue-scaffold/api';
import { createDirectivesPlugin, setDirectiveRouterInstance } from '@vue-scaffold/directives';
import { setRouterInstance } from '@/router/router-instance';
import { createWorkspacePinia, useAuthStore } from '@/stores';
import '@vue-scaffold/styles';

const app = createApp(App);
const pinia = createWorkspacePinia();

app.use(pinia);

const authStore = useAuthStore(pinia);

configureHttpHooks({
  getToken: () => authStore.token,
  getBaseURL: () => window.location.origin,
  onUnauthorized: () => {
    authStore.clearAccess();
    router.replace('/login');
  }
});

configureAppRequest({
  hasPermission: permission => authStore.hasPermission(permission)
});

app.use(router);
app.use(ElementPlus);
app.use(createDirectivesPlugin());
app.use(ui);

setRouterInstance(router);
setDirectiveRouterInstance(router);

app.mount('#app');
