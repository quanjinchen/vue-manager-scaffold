<template>
  <AppDialog
    v-model="visible"
    :modal-props="modalProps"
    :footer-props="footerProps"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="dataInfo.rules"
      label-position="top"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <AppInput
              v-model="formData.username"
              v-trim
              placeholder="请输入用户名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" prop="fullName">
            <AppInput
              v-model="formData.fullName"
              v-trim
              placeholder="请输入姓名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <AppInput
              v-model="formData.phone"
              v-trim
              placeholder="请输入手机号"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <AppInput
              v-model="formData.email"
              v-trim
              placeholder="请输入邮箱"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <AppSelect
              v-model="formData.status"
              :list="dataInfo.statusOptions"
              :select-props="{ placeholder: '请选择状态' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <AppInput
              v-model="formData.remark"
              placeholder="请输入备注"
              :input-props="{ type: 'textarea', rows: 3 }"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts" name="UserFormDialog">
import { computed, reactive, ref, watch, toRefs } from "vue";
import type { FormInstance } from "element-plus";
import { messageAlert, useVModel } from "@vue-scaffold/utils";
import { requests } from "@/api/requests";
import type { UserRecord } from "@/types/domain";

const props = defineProps<{
  modelValue: boolean;
  selectItem?: UserRecord | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [boolean];
  success: [];
}>();

const formRef = ref<FormInstance>();
const visible = useVModel(props, emit as any);

const modalProps = computed(() => ({
  title: `${dataInfo.isEdit ? "编辑" : "新增"}用户`,
  width: 720,
}));

const footerProps = computed(() => ({
  buttons: [
    { text: "取消", close: true, buttonProps: {} },
    {
      text: submitLoading.value ? "保存中..." : "保存",
      close: false,
      buttonProps: { type: "primary", loading: submitLoading.value },
      click: () => dataInfo.handleSubmit(),
    },
  ],
}));

watch(visible, (value) => {
  !value && dataInfo.initForm();
  value && dataInfo.getDetail();
});

// 数据信息
const dataInfo: any = reactive({
  // 表单数据
  formData: {
    username: "",
    fullName: "",
    phone: "",
    email: "",
    status: "active",
    remark: "",
  },
  // 表单验证规则
  rules: {
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    fullName: [{ required: true, message: "请输入姓名", trigger: "blur" }],
    phone: [{ required: true, message: "请输入手机号", trigger: "blur" }],
    email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  },
  submitLoading: false,
  // 是否编辑模式
  get isEdit() {
    return Boolean(props.selectItem?.id);
  },

  // 状态选项
  statusOptions: [
    { id: "active", name: "启用" },
    { id: "disabled", name: "停用" },
  ],

  // 初始化表单
  initForm() {
    if (!formRef.value) return;
    setTimeout(() => {
      formRef.value?.resetFields();
    }, 500);
  },
  getDetail() {
    if (props.selectItem?.id) {
      this.formData = {
        ...props.selectItem,
      };
    }
  },
  get params() {
    return { ...dataInfo.formData };
  },
  // 提交表单
  async handleSubmit() {
    await formRef.value?.validate();
    this.submitLoading = true;
    try {
      await requests.users[this.isEdit ? "update" : "create"](this.params);
      messageAlert({ message: `操作成功` });
      visible.value = false;
      emit("success");
    } finally {
      this.submitLoading = false;
    }
  },
});

const { submitLoading, formData } = toRefs(dataInfo);

// 暴露
defineExpose({ dataInfo });
</script>
