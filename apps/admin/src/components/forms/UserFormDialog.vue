<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `${isEdit ? '编辑' : '新增'}用户`, width: 720 }"
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
          <el-form-item label="用户名" prop="userName">
            <AppInput v-model="form.userName" v-trim placeholder="请输入用户名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" prop="fullName">
            <AppInput v-model="form.fullName" v-trim placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phoneNum">
            <AppInput v-model="form.phoneNum" v-trim placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <AppInput v-model="form.email" v-trim placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属组织" prop="orgIds">
            <AppSelectV2
              v-model="form.orgIds"
              :list="organizationOptions.map(item => ({ id: item.id, name: item.orgName }))"
              :select-v2-props="{ multiple: true, collapseTags: true, placeholder: '请选择所属组织' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <AppSelect v-model="form.status" :list="statusOptions" :select-props="{ placeholder: '请选择状态' }" />
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

<script setup lang="ts" name="UserFormDialog">
  import { computed, reactive, ref, watch } from 'vue';
  import type { FormInstance } from 'element-plus';
import type { OrganizationRecord, UserRecord } from '@/types/domain';

  const props = defineProps<{
    modelValue: boolean;
    record?: UserRecord | null;
    organizations: OrganizationRecord[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [boolean];
    submit: [payload: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>, id?: string];
  }>();

  const formRef = ref<FormInstance>();
  const submitLoading = ref(false);

  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  });

  const isEdit = computed(() => Boolean(props.record?.id));

  const organizationOptions = computed(() => {
    const walk = (items: OrganizationRecord[]): OrganizationRecord[] =>
      items.flatMap(item => [item, ...walk(item.children ?? [])]);
    return walk(props.organizations ?? []);
  });

  const statusOptions = [
    { id: 'active', name: '启用' },
    { id: 'disabled', name: '停用' }
  ];

  const form = reactive<Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>>({
    userName: '',
    fullName: '',
    phoneNum: '',
    email: '',
    orgIds: [],
    orgNames: [],
    status: 'active',
    remark: ''
  });

  const rules = {
    userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    fullName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phoneNum: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
  };

  watch(
    () => props.record,
    value => {
      form.userName = value?.userName ?? '';
      form.fullName = value?.fullName ?? '';
      form.phoneNum = value?.phoneNum ?? '';
      form.email = value?.email ?? '';
      form.orgIds = value?.orgIds ? [...value.orgIds] : [];
      form.orgNames = value?.orgNames ? [...value.orgNames] : [];
      form.status = value?.status ?? 'active';
      form.remark = value?.remark ?? '';
    },
    { immediate: true }
  );

  watch(
    () => form.orgIds,
    value => {
      form.orgNames = organizationOptions.value
        .filter(item => value.includes(item.id))
        .map(item => item.orgName);
    },
    { deep: true }
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
