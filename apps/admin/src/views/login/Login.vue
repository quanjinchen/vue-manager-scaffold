<template>
  <main class="Login-root">
    <div class="Login-left">
      <div class="face-recognition-animation">
        <!-- 六边形网格背景 -->
        <svg class="hexagon-grid" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexPattern" x="0" y="0" width="15" height="13" patternUnits="userSpaceOnUse">
              <polygon points="7.5,0 13,3.75 13,9.25 7.5,13 2,9.25 2,3.75" fill="none" stroke="rgba(59, 130, 246, 0.12)" stroke-width="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#hexPattern)"/>
        </svg>

        <!-- 3D 人脸网格 -->
        <svg class="face-mesh" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
          <!-- 脸部网格线 -->
          <g class="mesh-lines" stroke="#3b82f6" stroke-width="1.5" fill="none" opacity="0.5">
            <!-- 横向网格 -->
            <path d="M 40 60 Q 100 55 160 60" class="mesh-line"/>
            <path d="M 35 80 Q 100 75 165 80" class="mesh-line"/>
            <path d="M 30 100 Q 100 95 170 100" class="mesh-line"/>
            <path d="M 30 120 Q 100 115 170 120" class="mesh-line"/>
            <path d="M 35 140 Q 100 135 165 140" class="mesh-line"/>
            <path d="M 40 160 Q 100 155 160 160" class="mesh-line"/>
            <path d="M 50 180 Q 100 175 150 180" class="mesh-line"/>

            <!-- 纵向网格 -->
            <path d="M 100 40 L 100 200" class="mesh-line"/>
            <path d="M 70 50 Q 70 120 75 190" class="mesh-line"/>
            <path d="M 130 50 Q 130 120 125 190" class="mesh-line"/>
            <path d="M 50 70 Q 45 120 55 180" class="mesh-line"/>
            <path d="M 150 70 Q 155 120 145 180" class="mesh-line"/>
          </g>

          <!-- 关键特征点 -->
          <g class="feature-points">
            <circle cx="75" cy="100" r="3" fill="#3b82f6" class="point"/>
            <circle cx="125" cy="100" r="3" fill="#3b82f6" class="point"/>
            <circle cx="100" cy="120" r="3" fill="#3b82f6" class="point"/>
            <circle cx="85" cy="150" r="3" fill="#3b82f6" class="point"/>
            <circle cx="115" cy="150" r="3" fill="#3b82f6" class="point"/>
            <circle cx="100" cy="80" r="3" fill="#3b82f6" class="point"/>
            <circle cx="60" cy="110" r="3" fill="#3b82f6" class="point"/>
            <circle cx="140" cy="110" r="3" fill="#3b82f6" class="point"/>
          </g>
        </svg>

        <!-- 扫描框 -->
        <svg class="scan-frame" viewBox="0 0 320 400" xmlns="http://www.w3.org/2000/svg">
          <!-- 四角装饰 -->
          <g stroke="#3b82f6" stroke-width="2.5" fill="none" class="corner-frame">
            <path d="M 60 60 L 100 60 M 60 60 L 60 100"/>
            <path d="M 260 60 L 220 60 M 260 60 L 260 100"/>
            <path d="M 60 340 L 100 340 M 60 340 L 60 300"/>
            <path d="M 260 340 L 220 340 M 260 340 L 260 300"/>
          </g>

          <!-- 扫描线 -->
          <line x1="60" y1="200" x2="260" y2="200" stroke="#3b82f6" stroke-width="2" opacity="0.8" class="scan-line-horizontal"/>
        </svg>

        <!-- 粒子背景 -->
        <canvas ref="canvasRef" class="particle-canvas"></canvas>
      </div>

      <div class="Login-left-content">
        <h1 class="brand-title">小型认证平台</h1>
        <p class="brand-subtitle">AI 人脸识别 · 安全认证</p>
      </div>
    </div>

    <div class="Login-right">
      <section class="container">
        <div class="panel">
          <div class="thead">
            <p class="eyebrow">IAM Manager</p>
            <h3>账号密码登录</h3>
          </div>

          <Account ref="accountRef" :btn-loading="dataInfo.btnLoading" @on-login="dataInfo.handleLogin" />
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts" name="Login">
  import { onMounted, onUnmounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { AccessMenuItem } from '@vue-scaffold/types';
  import { messageAlert } from '@vue-scaffold/utils';
  import { $apis } from '@/api/requests';
  import { ensureAccessRoutes } from '@/router';
  import { useAuthStore, useMenuStore } from '@/stores';
  import Account from '@/views/login/components/Account.vue';

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const menuStore = useMenuStore();
  const accountRef = ref<InstanceType<typeof Account>>();
  const canvasRef = ref<HTMLCanvasElement>();

  type LoginInfoResponse = {
    data?: Record<string, any>;
    id?: string | number;
    adminId?: string | number;
    userId?: string | number;
    username?: string;
    userName?: string;
    fullName?: string;
    email?: string;
    menuList?: Record<string, any>[];
    permissions?: string[];
    menus?: Record<string, any>[];
    userInfo?: Record<string, any>;
    profile?: {
      id?: string;
      name?: string;
      email?: string;
    };
  };

  function unwrapLoginInfo(loginInfo: LoginInfoResponse) {
    if (loginInfo && typeof loginInfo === 'object' && loginInfo.data && typeof loginInfo.data === 'object') {
      return loginInfo.data as Record<string, any>;
    }
    return loginInfo as Record<string, any>;
  }

  function collectPermissions(menuList: Record<string, any>[] = [], initialPermissions: string[] = []) {
    const permissions = new Set<string>();
    initialPermissions.forEach(item => {
      if (item) {
        permissions.add(String(item));
      }
    });

    const loop = (list: Record<string, any>[]) => {
      list.forEach(item => {
        if (item.permissionCode ?? item.menuCode) {
          permissions.add(String(item.permissionCode ?? item.menuCode));
        }
        if (Array.isArray(item.children) && item.children.length) {
          loop(item.children);
        }
      });
    };

    loop(menuList);
    return [...permissions];
  }

  function mapMenuType(menuType?: string | number) {
    switch (String(menuType ?? '').toUpperCase()) {
      case 'M':
      case 'CATALOG':
        return 1 as const;
      case 'C':
      case 'MENU':
        return 2 as const;
      case 'B':
      case 'BUTTON':
        return 4 as const;
      default:
        return Number(menuType) === 1 || Number(menuType) === 2 || Number(menuType) === 3 || Number(menuType) === 4
          ? Number(menuType) as 1 | 2 | 3 | 4
          : 2 as const;
    }
  }

  function mapMenuList(menuList: Record<string, any>[] = []): AccessMenuItem[] {
    return menuList
      .filter(item => item && (item.path || (Array.isArray(item.children) && item.children.length)))
      .map(item => ({
        name: String(item.menuName ?? item.name ?? ''),
        path: String(item.path ?? ''),
        menuType: mapMenuType(item.menuType),
        icon: item.icon ? String(item.icon) : undefined,
        permissions: item.permissionCode ?? item.menuCode ? String(item.permissionCode ?? item.menuCode) : undefined,
        children: Array.isArray(item.children) ? mapMenuList(item.children) : undefined
      }));
  }

  async function loginByPassword(params: Record<string, string>) {
    const loginResult = await $apis.login.accountLogin(params, {
      alertError: false,
      needLogin: false
    });

    const token = String(loginResult?.token ?? '');
    if (!token) {
      throw new Error('登录响应缺少 token');
    }

    const loginInfo = await $apis.login.getLoginInfo({}, {
      axiosOptions: {
        headers: {
          Authorization: token
        }
      },
      alertError: false
    });

    const rawLoginInfo = unwrapLoginInfo((loginInfo || {}) as LoginInfoResponse);
    const userInfo = rawLoginInfo.userInfo ?? rawLoginInfo;
    const rawMenus = Array.isArray(rawLoginInfo.menus)
      ? rawLoginInfo.menus
      : Array.isArray(userInfo.menus)
        ? userInfo.menus
        : Array.isArray(userInfo.menuList)
          ? userInfo.menuList
          : [];
    const permissions = rawLoginInfo.permissions?.length
      ? rawLoginInfo.permissions
      : collectPermissions(rawMenus);

    return {
      token,
      profile: {
        id: String(rawLoginInfo.profile?.id ?? userInfo.adminId ?? userInfo.userId ?? userInfo.id ?? '1'),
        name: String(rawLoginInfo.profile?.name ?? userInfo.fullName ?? userInfo.username ?? userInfo.userName ?? params.account),
        email: String(rawLoginInfo.profile?.email ?? userInfo.email ?? '')
      },
      permissions,
      menuList: mapMenuList(rawMenus)
    };
  }

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

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }

  let animationId: number;
  let particles: Particle[] = [];

  function initParticles() {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particleCount = 30;
    particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1
      });
    }

    animate();
  }

  function animate() {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.fill();
    });

    animationId = requestAnimationFrame(animate);
  }

  function handleResize() {
    initParticles();
  }

  onMounted(() => {
    dataInfo.init();
    initParticles();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', handleResize);
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
    background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    @media (max-width: 768px) {
      min-height: 300px;
      flex: none;
    }
  }

  .face-recognition-animation {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .particle-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .hexagon-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .face-mesh {
    position: absolute;
    width: 280px;
    height: 340px;
    z-index: 3;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .mesh-line {
      animation: meshPulse 3s ease-in-out infinite;
    }

    .point {
      animation: pointGlow 2s ease-in-out infinite;
    }
  }

  .scan-frame {
    position: absolute;
    width: 400px;
    height: 480px;
    z-index: 4;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .corner-frame {
      animation: framePulse 2s ease-in-out infinite;
    }

    .scan-line-horizontal {
      animation: scanHorizontal 4s linear infinite;
    }
  }

  .Login-left-content {
    position: absolute;
    bottom: 60px;
    z-index: 5;
    text-align: center;
    padding: 20px;

    @media (max-width: 768px) {
      bottom: 30px;
    }
  }

  .brand-title {
    font-size: 42px;
    font-weight: 700;
    margin: 0 0 8px;
    color: #1e40af;

    @media (max-width: 768px) {
      font-size: 28px;
    }
  }

  .brand-subtitle {
    font-size: 16px;
    color: #3b82f6;
    margin: 0;
    font-weight: 500;
    letter-spacing: 0.05em;

    @media (max-width: 768px) {
      font-size: 14px;
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

  @keyframes meshPulse {
    0%, 100% {
      stroke-opacity: 0.3;
    }
    50% {
      stroke-opacity: 0.7;
    }
  }

  @keyframes pointGlow {
    0%, 100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.3);
    }
  }

  @keyframes framePulse {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.9;
    }
  }

  @keyframes scanHorizontal {
    0% {
      transform: translateY(-140px);
      opacity: 0;
    }
    10% {
      opacity: 0.8;
    }
    90% {
      opacity: 0.8;
    }
    100% {
      transform: translateY(140px);
      opacity: 0;
    }
  }
</style>
