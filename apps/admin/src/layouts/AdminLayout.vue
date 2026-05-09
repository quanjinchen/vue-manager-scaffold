<template>
  <div class="AdminLayout-root">
    <el-container class="layout-wrapper">
      <el-header class="AdminLayout-header">
        <div class="left">
          <AppButton
            :button-props="{ text: true }"
            @click="appStore.toggleSidebar()"
          >
            {{ appStore.sidebarCollapsed ? "展开菜单" : "收起菜单" }}
          </AppButton>
        </div>
        <div  class="right">
          <span class="welcome"
            >你好，{{ authStore.profile.name || "未登录用户" }}</span
          >
          <AppButton @click="logout">退出登录</AppButton>
        </div>
      </el-header>
      <el-container class="layout-container">
        <el-aside
          width="200px"
          class="AdminLayout-sidebar"
          :style="{ width: appStore.sidebarWidth }"
        >
          <AppMenu
            :list="menuStore.menuTree"
            :collapsed="appStore.sidebarCollapsed"
            class="AdminLayout-menu"
        /></el-aside>
        <el-main class="AdminLayout-main-wrapper"
          ><main class="AdminLayout-main">
            <section class="AdminLayout-content">
              <AppBreadcrumb />
              <router-view />
            </section></main
        ></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts" name="AdminLayout">
import { useRouter } from "vue-router";
import { messageConfirm } from "@vue-scaffold/utils";
import { useAppStore, useAuthStore, useMenuStore } from "@/stores";

const router = useRouter();
const authStore = useAuthStore();
const appStore = useAppStore();
const menuStore = useMenuStore();

async function logout() {
  await messageConfirm("确认退出当前登录状态吗？", "退出确认", {
    confirmButtonText: "退出",
    cancelButtonText: "取消",
  });
  await authStore.logout();
  router.replace("/login");
}
</script>

<style scoped lang="scss">
.AdminLayout-root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #eef3f9;

  .layout-wrapper {
    height: 100%;
  }

  .animate-enter-from {
    opacity: 0;
  }
  .animate-enter-to {
    opacity: 1;
  }
  .animate-leave-from {
    opacity: 1;
  }
  .animate-leave-to {
    opacity: 0;
  }
  .animate-enter-active,
  .animate-leave-active {
    transition: all 0.25s;
  }

  .layout-container {
    display: flex;
    height: calc(100% - 64px);
    overflow: hidden;
  }
}

.AdminLayout-sidebar {
  background: #101828;
  color: #fff;
  transition: width 0.2s ease;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}

.AdminLayout-logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.AdminLayout-menu {
  border-right: 0;
  background: transparent;
}

.AdminLayout-main-wrapper {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
}

.AdminLayout-main {
  min-width: 0;
  width: 100%;
  height: 100%;
}

.AdminLayout-header {
  height: 64px;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #d8e0ec;
  padding: 0 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.AdminLayout-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  overflow: hidden;
}

.right {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.welcome {
  color: #475467;
}
</style>
