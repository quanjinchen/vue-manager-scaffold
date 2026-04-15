import { ElMessage, ElMessageBox } from 'element-plus';

export function messageAlert(options: Record<string, any> = {}) {
  ElMessage({
    type: 'success',
    message: '操作成功',
    duration: 2000,
    showClose: false,
    ...options
  });
}

export function messageConfirm(message = '确认执行当前操作吗？', title = '操作确认', options = {}) {
  return ElMessageBox.confirm(message, title, {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    ...options
  });
}

