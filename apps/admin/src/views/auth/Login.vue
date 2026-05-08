<template>
  <section class="Login">
    <div class="Login-left">
      <canvas ref="canvasRef" class="particle-canvas"></canvas>
      <div class="Login-left-content">
        <h1 class="brand-title">管理后台模板</h1>
        <p class="brand-subtitle">基于 Vue 3 + TypeScript 构建的现代化管理系统</p>
      </div>
    </div>

    <div class="Login-right">
      <div class="Login-card surface-card">
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
    </div>
  </section>
</template>

<script setup lang="ts" name="Login">
  import { onMounted, onUnmounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore, useMenuStore } from '@/stores';
  import { messageAlert } from '@vue-scaffold/utils';
  import { ensureAccessRoutes } from '@/router';
  import { loginByPassword } from '@/services/auth';

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const menuStore = useMenuStore();
  const loading = ref(false);
  const canvasRef = ref<HTMLCanvasElement>();

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
      const accessPayload = await loginByPassword({
        account: form.account,
        password: form.password
      });
      authStore.applyAccess(accessPayload);
      menuStore.setPermissionData(accessPayload.menuList ?? []);
      menuStore.setIsAddRoutes(false);
      ensureAccessRoutes();
      router.replace(String(route.query.redirect ?? '/'));
    } finally {
      loading.value = false;
    }
  }

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }

  let animationId: number;
  let particles: Particle[] = [];
  let mouseX = 0;
  let mouseY = 0;

  function initParticles() {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
    particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
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

    particles.forEach((particle, i) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

      const dx = mouseX - particle.x;
      const dy = mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 120) {
        particle.x -= dx * 0.01;
        particle.y -= dy * 0.01;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 65, 192, 0.6)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(0, 65, 192, ${0.2 * (1 - distance / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    animationId = requestAnimationFrame(animate);
  }

  function handleMouseMove(e: MouseEvent) {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  function handleResize() {
    initParticles();
  }

  onMounted(() => {
    initParticles();
    window.addEventListener('resize', handleResize);
    canvasRef.value?.addEventListener('mousemove', handleMouseMove);
  });

  onUnmounted(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', handleResize);
    canvasRef.value?.removeEventListener('mousemove', handleMouseMove);
  });
</script>

<style scoped lang="scss">
  .Login {
    min-height: 100vh;
    display: flex;
    overflow: hidden;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .Login-left {
    flex: 1;
    position: relative;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    @media (max-width: 768px) {
      min-height: 200px;
      flex: none;
    }
  }

  .particle-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .Login-left-content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: white;
    padding: 40px;

    @media (max-width: 768px) {
      padding: 20px;
    }
  }

  .brand-title {
    font-size: 48px;
    font-weight: 700;
    margin: 0 0 16px;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);

    @media (max-width: 768px) {
      font-size: 32px;
    }
  }

  .brand-subtitle {
    font-size: 18px;
    opacity: 0.9;
    margin: 0;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
      font-size: 14px;
    }
  }

  .Login-right {
    flex: 0 0 500px;
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

  .Login-card {
    width: 100%;
    max-width: 440px;
    padding: 0;
    background: transparent;
    box-shadow: none;
  }

  .eyebrow {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #667eea;
    margin: 0 0 8px;
  }

  h1 {
    margin: 8px 0 12px;
    font-size: 32px;
    line-height: 1.1;
    color: #1a202c;

    @media (max-width: 768px) {
      font-size: 24px;
    }
  }

  .description {
    margin-bottom: 32px;
    color: #556176;
    line-height: 1.6;
  }

  .login-button {
    width: 100%;
    margin-top: 8px;
  }
</style>
