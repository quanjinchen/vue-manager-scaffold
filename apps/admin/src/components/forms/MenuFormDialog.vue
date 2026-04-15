<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `${isEdit ? '编辑' : '新增'}菜单`, width: 680 }"
    :footer-props="{
      buttons: [
        { text: '取消', close: true, buttonProps: {} },
        { text: submitLoading ? '保存中...' : '保存', close: false, buttonProps: { type: 'primary', loading: submitLoading }, click: handleSubmit }
      ]
    }"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="上级菜单" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          style="width: 100%"
          :data="menuTree"
          node-key="id"
          :props="{ label: 'menuName', children: 'children' }"
          placeholder="请选择上级菜单"
          clearable
          check-strictly
          default-expand-all
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="菜单类型" prop="menuType">
            <AppSelect v-model="form.menuType" :list="menuTypeOptions" :select-props="{ placeholder: '请选择菜单类型' }" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图标" prop="icon">
            <AppInput v-model="form.icon" placeholder="请输入 Element Plus 图标名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单名称" prop="menuName">
            <AppInput v-model="form.menuName" v-trim placeholder="请输入菜单名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="orderNum">
            <AppInputNumber v-model="form.orderNum" :input-number-props="{ min: 1, max: 9999, style: 'width: 100%', placeholder: '请输入排序' }" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="路径" prop="path">
            <AppInput v-model="form.path" v-trim placeholder="请输入路径" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权限编码" prop="menuCode">
            <AppInput v-model="form.menuCode" v-trim placeholder="请输入权限编码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否启用" prop="enabled">
            <AppSwitch v-model="form.enabled" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <AppInput v-model="form.remark" placeholder="请输入备注" :input-props="{ type: 'textarea', rows: 3 }" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts" name="MenuFormDialog">
  import { computed, reactive, ref, watch } from 'vue';
  import type { FormInstance } from 'element-plus';
  import { menuTypeOptions } from '@vue-scaffold/constants';
import type { MenuRecord } from '@/types/domain';

  const props = defineProps<{
    modelValue: boolean;
    record?: MenuRecord | null;
    menus: MenuRecord[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [boolean];
    submit: [payload: Omit<MenuRecord, 'id' | 'children'>, id?: string];
  }>();

  const formRef = ref<FormInstance>();
  const submitLoading = ref(false);

  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  });

  const isEdit = computed(() => Boolean(props.record?.id));
  const menuTree = computed(() => props.menus ?? []);

  const form = reactive<Omit<MenuRecord, 'id' | 'children'>>({
    parentId: null,
    menuType: 2,
    menuName: '',
    icon: '',
    path: '',
    menuCode: '',
    orderNum: 1,
    enabled: true,
    remark: ''
  });

  const rules = {
    menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
    menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    path: [{ required: true, message: '请输入路径', trigger: 'blur' }],
    menuCode: [{ required: true, message: '请输入权限编码', trigger: 'blur' }]
  };

  watch(
    () => props.record,
    value => {
      form.parentId = value?.parentId ?? null;
      form.menuType = value?.menuType ?? 2;
      form.menuName = value?.menuName ?? '';
      form.icon = value?.icon ?? '';
      form.path = value?.path ?? '';
      form.menuCode = value?.menuCode ?? '';
      form.orderNum = value?.orderNum ?? 1;
      form.enabled = value?.enabled ?? true;
      form.remark = value?.remark ?? '';
    },
    { immediate: true }
  );

  async function handleSubmit() {
    await formRef.value?.validate();
    submitLoading.value = true;
    try {
      await emit('submit', { ...form }, props.record?.id);
      visible.value = false;
    } finally {
      submitLoading.value = false;
    }
  }
</script>
