<template>
  <main class="Login-root">
    <section class="container">
      <div class="panel surface-card">
        <div class="thead">
          <p class="eyebrow">IAM Manager</p>
          <h3>账号密码登录</h3>
        </div>

        <Account ref="accountRef" :btn-loading="dataInfo.btnLoading" @on-login="dataInfo.handleLogin" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts" name="Login">
  import { onMounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { messageAlert } from '@vue-scaffold/utils';
  import { ensureAccessRoutes } from '@/router';
  import { useAuthStore, useMenuStore } from '@/stores';
  import { loginByPassword } from '@/services/auth';
  import Account from '@/views/login/components/Account.vue';

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const menuStore = useMenuStore();
  const accountRef = ref<InstanceType<typeof Account>>();

  const dataInfo = reactive({
    btnLoading: false,
    async handleLogin({ params }: { loginType: 'PSW'; params: Record<string, string> }) {
      dataInfo.btnLoading = true;
      try {
        const accessPayload = await loginByPassword(params);
        authStore.applyAccess(accessPayload);
        menuStore.setPermissionData(accessPayload.menuList ?? []);
        menuStore.setIsAddRoutes(false);
        ensureAccessRoutes();
        messageAlert({ message: `欢迎使用${import.meta.env.VITE_APP_TITLE || 'vue-scaffold'}！` });
        router.replace(String(route.query.redirect ?? '/'));
      } catch (error: any) {
        const code = error?.response?.data?.code;
        const message = error?.response?.data?.msg || error?.response?.data?.message;
        if (code && ![250001, 23012, 10005, 10008, 7005].includes(code)) {
          messageAlert({ type: 'error', message: message || '未知错误，请联系管理员' });
        }
        accountRef.value?.dataInfo.resetCodeValue();
      } finally {
        dataInfo.btnLoading = false;
      }
    },
    init() {
      accountRef.value?.dataInfo.init();
    }
  });

  onMounted(() => {
    dataInfo.init();
  });
</script>

<style scoped lang="scss">
  .Login-root {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      radial-gradient(circle at top left, rgba(0, 65, 192, 0.18), transparent 28%),
      radial-gradient(circle at bottom right, rgba(14, 159, 110, 0.16), transparent 24%),
      linear-gradient(135deg, #eef4ff 0%, #f6fbf8 100%);
  }

  .container {
    width: min(460px, 100%);
  }

  .panel {
    padding: 36px;
  }

  .thead {
    margin-bottom: 20px;
  }

  .eyebrow {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #0041c0;
    margin: 0 0 8px;
  }

  h3 {
    margin: 0 0 12px;
    font-size: 30px;
    line-height: 1.1;
  }

  .description {
    margin: 0;
    color: #556176;
  }
</style>
