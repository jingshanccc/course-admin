/**
 * 验证是否为外部路径
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}