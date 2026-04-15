<template>
  <section class="AdminLayout">
    <aside class="AdminLayout-sidebar" :style="{ width: appStore.sidebarWidth }">
      <div class="AdminLayout-logo">
        <strong>{{ appStore.sidebarCollapsed ? '管理台' : '后台管理系统' }}</strong>
      </div>

      <AppMenu :list="menuStore.menuTree" :collapsed="appStore.sidebarCollapsed" class="AdminLayout-menu" />
    </aside>

    <main class="AdminLayout-main">
      <header class="AdminLayout-header">
        <div class="left">
          <AppButton :button-props="{ text: true }" @click="appStore.toggleSidebar()">
            {{ appStore.sidebarCollapsed ? '展开菜单' : '收起菜单' }}
          </AppButton>
        </div>

        <div class="right">
          <span class="welcome">你好，{{ authStore.profile.name || '未登录用户' }}</span>
          <AppButton @click="logout">退出登录</AppButton>
        </div>
      </header>

      <section class="AdminLayout-content">
        <AppBreadcrumb />
        <router-view />
      </section>
    </main>
  </section>
</template>

<script setup lang="ts" name="AdminLayout">
import { useRouter } from 'vue-router';
import { messageConfirm } from '@vue-scaffold/utils';
import { useAppStore, useAuthStore, useMenuStore } from '@/stores';

  const router = useRouter();
  const authStore = useAuthStore();
  const appStore = useAppStore();
  const menuStore = useMenuStore();

  async function logout() {
    await messageConfirm('确认退出当前登录状态吗？', '退出确认', {
      confirmButtonText: '退出',
      cancelButtonText: '取消'
    });
    await authStore.logout();
    router.replace('/login');
  }
</script>

<style scoped lang="scss">
  .AdminLayout {
    min-height: 100vh;
    display: grid;
    grid-template-columns: auto 1fr;
    background: #eef3f9;
  }

  .AdminLayout-sidebar {
    background: #101828;
    color: #fff;
    transition: width 0.2s ease;
    overflow: hidden;
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

  .AdminLayout-main {
    min-width: 0;
  }

  .AdminLayout-header {
    height: 64px;
    background: rgba(255, 255, 255, 0.92);
    border-bottom: 1px solid #d8e0ec;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .AdminLayout-content {
    padding: 24px;
    display: grid;
    gap: 12px;
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
