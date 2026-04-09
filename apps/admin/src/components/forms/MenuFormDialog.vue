<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `${isEdit ? 'Edit' : 'Create'} Menu`, width: 680 }"
    :footer-props="{
      buttons: [
        { text: 'Cancel', close: true, buttonProps: {} },
        { text: submitLoading ? 'Saving...' : 'Save', close: false, buttonProps: { type: 'primary', loading: submitLoading }, click: handleSubmit }
      ]
    }"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Parent Menu" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          style="width: 100%"
          :data="menuTree"
          node-key="id"
          :props="{ label: 'menuName', children: 'children' }"
          clearable
          check-strictly
          default-expand-all
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Menu Type" prop="menuType">
            <AppSelect v-model="form.menuType" :list="menuTypeOptions" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Icon" prop="icon">
            <AppInput v-model="form.icon" placeholder="Element Plus icon name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Menu Name" prop="menuName">
            <AppInput v-model="form.menuName" v-trim />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Order" prop="orderNum">
            <AppInputNumber v-model="form.orderNum" :input-number-props="{ min: 1, max: 9999, style: 'width: 100%' }" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Path" prop="path">
            <AppInput v-model="form.path" v-trim />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Permission Code" prop="menuCode">
            <AppInput v-model="form.menuCode" v-trim />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Enabled" prop="enabled">
            <AppSwitch v-model="form.enabled" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="Remark" prop="remark">
            <AppInput v-model="form.remark" :input-props="{ type: 'textarea', rows: 3 }" />
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
    menuType: [{ required: true, message: 'Please select menu type', trigger: 'change' }],
    menuName: [{ required: true, message: 'Please enter menu name', trigger: 'blur' }],
    path: [{ required: true, message: 'Please enter path', trigger: 'blur' }],
    menuCode: [{ required: true, message: 'Please enter permission code', trigger: 'blur' }]
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
      emit('submit', { ...form }, props.record?.id);
      visible.value = false;
    } finally {
      submitLoading.value = false;
    }
  }
</script>
