<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `${isEdit ? '编辑' : '新增'}组织`, width: 640 }"
    :footer-props="{
      buttons: [
        { text: '取消', close: true, buttonProps: {} },
        { text: submitLoading ? '保存中...' : '保存', close: false, buttonProps: { type: 'primary', loading: submitLoading }, click: handleSubmit }
      ]
    }"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="上级组织" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          style="width: 100%"
          :data="organizationTree"
          node-key="id"
          :props="{ label: 'orgName', children: 'children' }"
          placeholder="请选择上级组织"
          clearable
          check-strictly
          default-expand-all
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="组织名称" prop="orgName">
            <AppInput v-model="form.orgName" v-trim placeholder="请输入组织名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组织简称" prop="shortName">
            <AppInput v-model="form.shortName" v-trim placeholder="请输入组织简称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="orderNum">
            <AppInputNumber v-model="form.orderNum" :input-number-props="{ min: 1, max: 9999, style: 'width: 100%', placeholder: '请输入排序' }" />
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

<script setup lang="ts" name="OrganizationFormDialog">
  import { computed, reactive, ref, watch } from 'vue';
  import type { FormInstance } from 'element-plus';
import type { OrganizationRecord } from '@/types/domain';

  const props = defineProps<{
    modelValue: boolean;
    record?: OrganizationRecord | null;
    organizations: OrganizationRecord[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [boolean];
    submit: [payload: Omit<OrganizationRecord, 'id' | 'children'>, id?: string];
  }>();

  const formRef = ref<FormInstance>();
  const submitLoading = ref(false);

  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  });

  const isEdit = computed(() => Boolean(props.record?.id));
  const organizationTree = computed(() => props.organizations ?? []);

  const form = reactive<Omit<OrganizationRecord, 'id' | 'children'>>({
    parentId: null,
    orgName: '',
    shortName: '',
    orderNum: 1,
    remark: ''
  });

  const rules = {
    orgName: [{ required: true, message: '请输入组织名称', trigger: 'blur' }],
    orderNum: [{ required: true, message: '请输入排序值', trigger: 'change' }]
  };

  watch(
    () => props.record,
    value => {
      form.parentId = value?.parentId ?? null;
      form.orgName = value?.orgName ?? '';
      form.shortName = value?.shortName ?? '';
      form.orderNum = value?.orderNum ?? 1;
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
