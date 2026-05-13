<template>
  <main class="Login-root">
    <div class="Login-left">
      <LoginHeroPanel />
    </div>

    <div class="Login-right">
      <section class="container">
        <div class="panel">
          <div class="thead">
            <p class="eyebrow">IAM Manager</p>
            <h3>账号密码登录</h3>
          </div>

          <Account
            ref="accountRef"
            :btn-loading="dataInfo.btnLoading"
            @on-login="dataInfo.handleLogin"
          />
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts" name="Login">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { messageAlert } from "@vue-scaffold/utils";
import { $apis } from "@/api/requests";
import { ensureAccessRoutes } from "@/router";
import { useAuthStore, useMenuStore } from "@/stores";
import Account from "@/views/login/components/Account.vue";
import LoginHeroPanel from "@/views/login/components/LoginHeroPanel.vue";
import { writeStorage } from "@vue-scaffold/utils";
import { STORAGE_KEYS } from "@vue-scaffold/constants";

const DEFAULT_REDIRECT_PATH = "/";
const KNOWN_LOGIN_ERROR_CODES = [250001, 23012, 10005, 10008, 7005];

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const menuStore = useMenuStore();
const accountRef = ref<InstanceType<typeof Account>>();

const dataInfo = reactive({
  btnLoading: false,
  init() {
    accountRef.value?.dataInfo.init();
  },
  resetVerifyCode() {
    accountRef.value?.dataInfo.resetCodeValue();
  },
  shouldHandleLoginError(code?: number) {
    return Boolean(code) && !KNOWN_LOGIN_ERROR_CODES.includes(code as number);
  },
  async handleLogin({
    params,
  }: {
    loginType: "PSW";
    params: Record<string, string>;
  }) {
    dataInfo.btnLoading = true;
    try {
      const loginResult = await $apis.login.accountLogin(params);
      const token = String(loginResult?.token ?? "");
      const userInfo = await $apis.login.getLoginInfo({});
      const menus = userInfo.menus || [];
      const permissions = userInfo.permissionCodes || [];
      writeStorage(STORAGE_KEYS.token, token);

      authStore.applyAccess({
        ...userInfo,
        permissions,
      });
      menuStore.setPermissionData(menus);
      menuStore.setIsAddRoutes(false);
      ensureAccessRoutes();
      messageAlert({
        message: `欢迎使用${import.meta.env.VITE_APP_TITLE || "vue-scaffold"}！`,
      });
      router.replace(String(route.query.redirect ?? DEFAULT_REDIRECT_PATH));
    } catch (error: any) {
      const code = error?.response?.data?.code;
      const errorMessage =
        error?.response?.data?.msg || error?.response?.data?.message;

      if (dataInfo.shouldHandleLoginError(code)) {
        messageAlert({
          type: "error",
          message: errorMessage || "未知错误，请联系管理员",
        });
      }

      dataInfo.resetVerifyCode();
    } finally {
      dataInfo.btnLoading = false;
    }
  },
});

onMounted(() => {
  dataInfo.init();
});
</script>

<style scoped lang="scss">
.Login-root {
  min-height: 100vh;
  display: flex;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.Login-left {
  flex: 0 0 60%;
  position: relative;

  @media (max-width: 768px) {
    min-height: 300px;
    flex: none;
  }
}

.Login-right {
  flex: 0 0 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #ffffff;

  @media (max-width: 768px) {
    flex: 1;
    padding: 24px;
  }
}

.container {
  width: 100%;
  max-width: 440px;
}

.panel {
  padding: 0;
  background: transparent;
  box-shadow: none;
}

.thead {
  margin-bottom: 20px;
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8b5cf6;
  margin: 0 0 8px;
}

h3 {
  margin: 0 0 12px;
  font-size: 30px;
  line-height: 1.1;
  color: #1a202c;

  @media (max-width: 768px) {
    font-size: 24px;
  }
}

.description {
  margin: 0;
  color: #556176;
}
</style>
