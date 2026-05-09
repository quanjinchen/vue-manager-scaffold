<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `${dataInfo.isEdit ? '编辑' : '新增'}用户`, width: 720 }"
    :footer-props="{
      buttons: [
        { text: '取消', close: true, buttonProps: {} },
        { text: submitLoading ? '保存中...' : '保存', close: false, buttonProps: { type: 'primary', loading: submitLoading }, click: dataInfo.handleSubmit }
      ]
    }"
  >
    <el-form ref="formRef" :model="dataInfo.form" :rules="dataInfo.rules" label-position="top">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <AppInput v-model="dataInfo.form.username" v-trim placeholder="请输入用户名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" prop="fullName">
            <AppInput v-model="dataInfo.form.fullName" v-trim placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <AppInput v-model="dataInfo.form.phone" v-trim placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <AppInput v-model="dataInfo.form.email" v-trim placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属组织" prop="orgIds">
            <AppSelectV2
              v-model="dataInfo.form.orgIds"
              :list="dataInfo.organizationOptions.map(item => ({ id: item.id, name: item.orgName }))"
              :select-v2-props="{ multiple: true, collapseTags: true, placeholder: '请选择所属组织' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <AppSelect v-model="dataInfo.form.status" :list="dataInfo.statusOptions" :select-props="{ placeholder: '请选择状态' }" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <AppInput v-model="dataInfo.form.remark" placeholder="请输入备注" :input-props="{ type: 'textarea', rows: 3 }" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts" name="UserFormDialog">
  import { computed, reactive, ref, watch, toRefs } from 'vue';
  import type { FormInstance } from 'element-plus';
  import { messageAlert } from '@vue-scaffold/utils';
  import { requests } from '@/api/requests';
  import type { OrganizationRecord, UserRecord } from '@/types/domain';

  const props = defineProps<{
    modelValue: boolean;
    record?: UserRecord | null;
    organizations: OrganizationRecord[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [boolean];
    success: [];
  }>();

  const formRef = ref<FormInstance>();

  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  });

  // 数据信息
  const dataInfo: any = reactive({
    // 表单数据
    form: {
      userName: '',
      fullName: '',
      phoneNum: '',
      email: '',
      orgIds: [] as string[],
      orgNames: [] as string[],
      status: 'active',
      remark: ''
    },
    submitLoading: false,

    // 是否编辑模式
    get isEdit() {
      return Boolean(props.record?.id);
    },

    // 组织选项（扁平化）
    get organizationOptions() {
      const walk = (items: OrganizationRecord[]): OrganizationRecord[] =>
        items.flatMap(item => [item, ...walk(item.children ?? [])]);
      return walk(props.organizations ?? []);
    },

    // 状态选项
    statusOptions: [
      { id: 'active', name: '启用' },
      { id: 'disabled', name: '停用' }
    ],

    // 表单验证规则
    rules: {
      userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      fullName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      phoneNum: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
      email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
    },

    // 初始化表单
    initForm(record?: UserRecord | null) {
      this.form.userName = record?.userName ?? '';
      this.form.fullName = record?.fullName ?? '';
      this.form.phoneNum = record?.phoneNum ?? '';
      this.form.email = record?.email ?? '';
      this.form.orgIds = record?.orgIds ? [...record.orgIds] : [];
      this.form.orgNames = record?.orgNames ? [...record.orgNames] : [];
      this.form.status = record?.status ?? 'active';
      this.form.remark = record?.remark ?? '';
    },

    // 更新组织名称
    updateOrgNames() {
      this.form.orgNames = this.organizationOptions
        .filter((item: OrganizationRecord) => this.form.orgIds.includes(item.id))
        .map((item: OrganizationRecord) => item.orgName);
    },

    // 提交表单
    async handleSubmit() {
      await formRef.value?.validate();
      this.submitLoading = true;
      try {
        const requestBody = {
          id: props.record?.id ? Number(props.record.id) : undefined,
          username: this.form.userName,
          nickname: this.form.fullName,
          phone: this.form.phoneNum,
          email: this.form.email,
          orgId: this.form.orgIds[0] ? Number(this.form.orgIds[0]) : undefined,
          status: this.form.status === 'active' ? 1 : 0
        };

        if (this.isEdit) {
          await requests.users.update(requestBody);
          messageAlert({ message: '用户更新成功' });
        } else {
          await requests.users.save({
            ...requestBody,
            password: '123456'
          });
          messageAlert({ message: '用户创建成功' });
        }

        visible.value = false;
        emit('success');
      } finally {
        this.submitLoading = false;
      }
    }
  });

  const { submitLoading } = toRefs(dataInfo);

  // 监听 record 变化，初始化表单
  watch(
    () => props.record,
    value => {
      dataInfo.initForm(value);
    },
    { immediate: true }
  );

  // 监听组织 ID 变化，更新组织名称
  watch(
    () => dataInfo.form.orgIds,
    () => {
      dataInfo.updateOrgNames();
    },
    { deep: true }
  );

  // 暴露
  defineExpose({ dataInfo });
</script>

