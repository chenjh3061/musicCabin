/**
 * 通用工具函数
 */

/**
 * 格式化日期
 * @param {number|string|Date} ts 时间戳或日期
 * @param {string} fmt 格式，默认 'YYYY-MM-DD'
 */
export function formatDate(ts, fmt = 'YYYY-MM-DD') {
  const d = ts ? new Date(ts) : new Date()
  const map = {
    YYYY: d.getFullYear(),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    DD: String(d.getDate()).padStart(2, '0'),
    HH: String(d.getHours()).padStart(2, '0'),
    mm: String(d.getMinutes()).padStart(2, '0'),
    ss: String(d.getSeconds()).padStart(2, '0')
  }
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, m => map[m])
}

/**
 * 计算距今天数（正=未来，负=已过期）
 */
export function daysFromNow(ts) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(ts)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - now) / (1000 * 60 * 60 * 24))
}

/**
 * 根据过期天数返回提醒标签和颜色
 */
export function getExpiryStatus(ts) {
  const days = daysFromNow(ts)
  if (days < 0) return { label: '已过期', color: '#e74c3c', days }
  if (days === 0) return { label: '今天到期', color: '#e74c3c', days }
  if (days <= 3) return { label: `还剩${days}天`, color: '#e67e22', days }
  if (days <= 7) return { label: `还剩${days}天`, color: '#f39c12', days }
  if (days <= 30) return { label: `还剩${days}天`, color: '#27ae60', days }
  return { label: `还剩${days}天`, color: '#7f8c8d', days }
}

/**
 * 获取当月天数
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

/**
 * 获取某月1日是星期几（0=日，1=一...6=六）
 */
export function getFirstDayOfWeek(year, month) {
  return new Date(year, month - 1, 1).getDay()
}

/**
 * 优先级配置
 */
export const PRIORITY_MAP = {
  high: { label: '高', color: '#e74c3c', bg: '#fdecea' },
  medium: { label: '中', color: '#f39c12', bg: '#fef9e7' },
  low: { label: '低', color: '#27ae60', bg: '#eafaf1' }
}

/**
 * 显示 toast
 */
export function showToast(title, icon = 'none') {
  uni.showToast({ title, icon, duration: 2000 })
}

/**
 * 显示确认弹窗
 */
export function showConfirm(content, title = '确认') {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm),
      fail: () => resolve(false)
    })
  })
}
