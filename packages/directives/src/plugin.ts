import type { App } from 'vue';
import { installDirectives } from './index';
import * as utils from '@vue-scaffold/utils';

export function createDirectivesPlugin() {
  return {
    install(app: App) {
      installDirectives(app);
      app.config.globalProperties.$utils = utils;
    }
  };
}
