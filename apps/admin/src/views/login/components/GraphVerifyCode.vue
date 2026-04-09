<template>
  <div class="GraphVerifyCode-root">
    <AppInput v-model="dataInfo.verifyCode" placeholder="请输入验证码" />
    <div class="code-img" @click="dataInfo.init()">
      <AppImage :src="dataInfo.detail.img" />
    </div>
  </div>
</template>

<script setup lang="ts" name="GraphVerifyCode">
  import { reactive } from 'vue';
import { requests } from '@/api/requests';

  type CaptchaDetail = {
    img?: string;
    uuid?: string;
  };

  const dataInfo = reactive({
    verifyCode: '',
    uuid: '',
    detail: {} as CaptchaDetail,
    async init() {
      this.verifyCode = '';
      const data = await requests.login.getCaptcha.request({}, {
        customOptions: {
          alertError: false,
          needLogin: false
        }
      });
      this.detail = data || {};
      this.uuid = data?.uuid || '';
    }
  });

  defineExpose({ dataInfo });
</script>

<style scoped lang="scss">
  .GraphVerifyCode-root {
    width: 100%;
    height: 44px;
    display: flex;
    gap: 16px;
  }

  .GraphVerifyCode-root :deep(.AppInput-root) {
    height: 44px;
  }

  .code-img {
    width: 112px;
    height: 44px;
    border-radius: var(--el-border-radius-base);
    overflow: hidden;
    flex: none;
    cursor: pointer;
    background: #f3f5f8;
  }
</style>
