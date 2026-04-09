import { ElMessage, ElMessageBox } from 'element-plus';

export function messageAlert(options: Record<string, any> = {}) {
  ElMessage({
    type: 'success',
    message: 'Done',
    duration: 2000,
    showClose: false,
    ...options
  });
}

export function messageConfirm(message = 'Are you sure?', title = 'Confirm', options = {}) {
  return ElMessageBox.confirm(message, title, {
    type: 'warning',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    ...options
  });
}

