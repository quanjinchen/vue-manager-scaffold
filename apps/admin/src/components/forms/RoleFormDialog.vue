<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `${isEdit ? 'Edit' : 'Create'} Role`, width: 640 }"
    :footer-props="{
      buttons: [
        { text: 'Cancel', close: true, buttonProps: {} },
        { text: submitLoading ? 'Saving...' : 'Save', close: false, buttonProps: { type: 'primary', loading: submitLoading }, click: handleSubmit }
      ]
    }"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Role Name" prop="roleName">
            <AppInput v-model="form.roleName" v-trim />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Role Code" prop="roleCode">
            <AppInput v-model="form.roleCode" v-trim :input-props="{ disabled: isEdit && form.systemDefault }" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Default Role" prop="systemDefault">
            <AppSwitch v-model="form.systemDefault" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Data Scope Type" prop="dataScopeType">
            <AppSelect v-model="form.dataScopeType" :list="dataScopeOptions" />
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

<script setup lang="ts" name="RoleFormDialog">
  import { computed, reactive, ref, watch } from 'vue';
  import type { FormInstance } from 'element-plus';
  import type { RoleRecord } from '@/types/domain';

  const props = defineProps<{
    modelValue: boolean;
    record?: RoleRecord | null;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [boolean];
    submit: [payload: Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt' | 'userNum' | 'userGroupNum'>, id?: string];
  }>();

  const formRef = ref<FormInstance>();
  const submitLoading = ref(false);

  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  });

  const isEdit = computed(() => Boolean(props.record?.id));

  const dataScopeOptions = [
    { id: '1', name: '全部数据' },
    { id: '5', name: '自定义范围' }
  ];

  const form = reactive<Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt' | 'userNum' | 'userGroupNum'>>({
    roleCode: '',
    roleName: '',
    systemDefault: false,
    dataScopeType: '1',
    remark: ''
  });

  const rules = {
    roleName: [{ required: true, message: 'Please enter role name', trigger: 'blur' }],
    roleCode: [{ required: true, message: 'Please enter role code', trigger: 'blur' }]
  };

  watch(
    () => props.record,
    value => {
      form.roleCode = value?.roleCode ?? '';
      form.roleName = value?.roleName ?? '';
      form.systemDefault = value?.systemDefault ?? false;
      form.dataScopeType = value?.dataScopeType ?? '1';
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
