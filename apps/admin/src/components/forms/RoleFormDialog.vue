<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `${isEdit ? '编辑' : '新增'}角色`, width: 640 }"
    :footer-props="{
      buttons: [
        { text: '取消', close: true, buttonProps: {} },
        { text: submitLoading ? '保存中...' : '保存', close: false, buttonProps: { type: 'primary', loading: submitLoading }, click: handleSubmit }
      ]
    }"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="角色名称" prop="roleName">
            <AppInput v-model="form.roleName" v-trim placeholder="请输入角色名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色编码" prop="roleCode">
            <AppInput v-model="form.roleCode" v-trim placeholder="请输入角色编码" :input-props="{ disabled: isEdit && form.systemDefault }" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否默认角色" prop="systemDefault">
            <AppSwitch v-model="form.systemDefault" />
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

  const form = reactive<Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt' | 'userNum' | 'userGroupNum'>>({
    roleCode: '',
    roleName: '',
    systemDefault: false,
    remark: ''
  });

  const rules = {
    roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
  };

  watch(
    () => props.record,
    value => {
      form.roleCode = value?.roleCode ?? '';
      form.roleName = value?.roleName ?? '';
      form.systemDefault = value?.systemDefault ?? false;
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
