<template>
  <section class="LoginView">
    <div class="LoginView-card surface-card">
      <p class="eyebrow">管理后台模板</p>
      <h1>快速开始后台项目</h1>
      <p class="description">
        基于账号密码登录能力整理的前端模板页面，便于快速复用和扩展。
      </p>

      <el-form label-position="top" @keyup.enter="login">
        <el-form-item label="账号">
          <AppInput v-model="form.account" v-trim placeholder="请输入账号" />
        </el-form-item>

        <el-form-item label="密码">
          <AppInput v-model="form.password" v-trim :input-props="{ type: 'password', showPassword: true }" placeholder="请输入密码" />
        </el-form-item>
      </el-form>

      <AppButton class="login-button" :button-props="{ type: 'primary', size: 'large', loading }" @click="login">
        {{ loading ? '登录中...' : '进入系统' }}
      </AppButton>
    </div>
  </section>
</template>

<script setup lang="ts" name="LoginView">
  import { reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore, useMenuStore } from '@/stores';
  import { messageAlert } from '@vue-scaffold/utils';
  import { authRepository } from '@/mock/repository';

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const menuStore = useMenuStore();
  const loading = ref(false);

  const form = reactive({
    account: 'demo.admin',
    password: '123456'
  });

  async function login() {
    if (!form.account || !form.password) {
      messageAlert({ type: 'warning', message: '请输入账号和密码' });
      return;
    }
    loading.value = true;
    try {
      const result = await authRepository.login(form.account, form.password);
      authStore.applyAccess({
        token: String(result?.token ?? ''),
        profile: {
          id: '1',
          name: form.account,
          email: `${form.account}@example.com`
        },
        permissions: []
      });
      menuStore.setPermissionData([]);
      menuStore.setIsAddRoutes(false);
      router.replace(String(route.query.redirect ?? '/'));
    } finally {
      loading.value = false;
    }
  }
</script>

<style scoped lang="scss">
  .LoginView {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      radial-gradient(circle at top left, rgba(0, 65, 192, 0.18), transparent 28%),
      radial-gradient(circle at bottom right, rgba(14, 159, 110, 0.16), transparent 24%),
      linear-gradient(135deg, #eef4ff 0%, #f6fbf8 100%);
  }

  .LoginView-card {
    width: min(440px, 100%);
    padding: 36px;
  }

  .eyebrow {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #0041c0;
  }

  h1 {
    margin: 8px 0 12px;
    font-size: 32px;
    line-height: 1.1;
  }

  .description {
    margin-bottom: 24px;
    color: #556176;
  }

  .login-button {
    width: 100%;
  }
</style>
