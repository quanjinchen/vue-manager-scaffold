import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@vue-scaffold/api': resolve(__dirname, '../../packages/api/src/index.ts'),
        '@vue-scaffold/constants': resolve(__dirname, '../../packages/constants/src/index.ts'),
        '@vue-scaffold/directives': resolve(__dirname, '../../packages/directives/src/index.ts'),
        '@vue-scaffold/styles': resolve(__dirname, '../../packages/styles/src/index.scss'),
        '@vue-scaffold/types': resolve(__dirname, '../../packages/types/src/index.ts'),
        '@vue-scaffold/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
        '@vue-scaffold/utils': resolve(__dirname, '../../packages/utils/src/index.ts')
      }
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_SERVER_PORT || 5173),
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
  };
});
