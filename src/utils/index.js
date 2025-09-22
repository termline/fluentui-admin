// 示例：常用工具函数
export function formatDate(date) {
  return new Date(date).toLocaleString();
}

export function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}
// 可扩展更多工具函数
