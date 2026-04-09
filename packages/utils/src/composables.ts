import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const caches = ref<string[]>([]);

export function useCommon() {
  const instance = getCurrentInstance();
  const proxy = instance?.proxy;
  const router = useRouter();
  const route = useRoute();
  return {
    instance,
    proxy,
    router,
    route
  };
}

export function useVModel<T extends Record<string, any>>(props: T, emit: (event: string, value: unknown) => void, modelValue = 'modelValue') {
  return computed({
    get() {
      return props[modelValue];
    },
    set(value) {
      emit(`update:${modelValue}`, value);
    }
  });
}

export function useClock() {
  const now = ref(new Date());
  const timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
  onBeforeUnmount(() => window.clearInterval(timer));
  return { now };
}

export function useDecodedQuery() {
  const route = useRoute();
  return computed(() => {
    return Object.fromEntries(
      Object.entries(route.query).map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, value.map(item => decodeURIComponent(String(item)))];
        }
        return [key, value ? decodeURIComponent(String(value)) : value];
      })
    );
  });
}

export function useWindowResize() {
  const width = ref(0);
  const height = ref(0);

  function update() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }

  onMounted(() => {
    update();
    window.addEventListener('resize', update);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', update);
  });

  return {
    width,
    height
  };
}

export function useRouteCache() {
  function addCache(componentName: string | string[]) {
    if (Array.isArray(componentName)) {
      componentName.forEach(addCache);
      return;
    }
    if (!componentName || caches.value.includes(componentName)) {
      return;
    }
    caches.value.push(componentName);
  }

  function removeCache(componentName: string) {
    const index = caches.value.indexOf(componentName);
    if (index >= 0) {
      caches.value.splice(index, 1);
      return true;
    }
    return false;
  }

  async function refreshCache(componentName: string) {
    if (removeCache(componentName)) {
      await nextTick();
      addCache(componentName);
    }
  }

  return {
    caches,
    addCache,
    removeCache,
    refreshCache
  };
}
