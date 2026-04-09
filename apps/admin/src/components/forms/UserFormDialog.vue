<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `${isEdit ? 'Edit' : 'Create'} User`, width: 720 }"
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
          <el-form-item label="Username" prop="userName">
            <AppInput v-model="form.userName" v-trim />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Full Name" prop="fullName">
            <AppInput v-model="form.fullName" v-trim />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Phone" prop="phoneNum">
            <AppInput v-model="form.phoneNum" v-trim />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Email" prop="email">
            <AppInput v-model="form.email" v-trim />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Organization" prop="orgIds">
            <AppSelectV2
              v-model="form.orgIds"
              :list="organizationOptions.map(item => ({ id: item.id, name: item.orgName }))"
              :select-v2-props="{ multiple: true, collapseTags: true, placeholder: 'Select organizations' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Status" prop="status">
            <AppSelect v-model="form.status" :list="statusOptions" />
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
    { id: 'active', name: 'Active' },
    { id: 'disabled', name: 'Disabled' }
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
    userName: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
    fullName: [{ required: true, message: 'Please enter full name', trigger: 'blur' }],
    phoneNum: [{ required: true, message: 'Please enter phone', trigger: 'blur' }],
    email: [{ required: true, message: 'Please enter email', trigger: 'blur' }]
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
      emit('submit', { ...form }, props.record?.id);
      visible.value = false;
    } finally {
      submitLoading.value = false;
    }
  }
</script>
