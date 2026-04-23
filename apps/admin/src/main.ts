import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import App from '@/App.vue';
import router from '@/router';
import ui from '@vue-scaffold/ui';
import { createDirectivesPlugin, setDirectiveRouterInstance } from '@vue-scaffold/directives';
import { setRouterInstance } from '@/router/router-instance';
import { createWorkspacePinia } from '@/stores';
import '@vue-scaffold/styles';

const app = createApp(App);
const pinia = createWorkspacePinia();

app.use(pinia);

app.use(router);
app.use(ElementPlus);
app.use(createDirectivesPlugin());
app.use(ui);

setRouterInstance(router);
setDirectiveRouterInstance(router);

app.mount('#app');
