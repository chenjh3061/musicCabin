/**
 * 本地存储统一管理
 * 所有存储 key 集中于此，方便备份/恢复和维护
 */

// ===================== 存储 Key 常量 =====================
export const STORAGE_KEYS = {
  TODO:            'todoList',          // 待办事项
  ITEMS:           'itemsData',         // 物品管理
  COUNTDOWN:       'countdownData',     // 倒数日/纪念日
  DAILY_CHECKIN:   'dailyCheckinData',  // 每日打卡
  WAGE_CAL:        'wageCalData',       // 工资计算
  MEAL_OPTIONS:    'mealOptions',       // 随机午餐菜单（纯文本）
  REMINDER:        'reminderSettings'   // 提醒设置
}

// 需要纳入备份/恢复的所有 key（按顺序）
export const BACKUP_KEYS = [
  STORAGE_KEYS.TODO,
  STORAGE_KEYS.ITEMS,
  STORAGE_KEYS.COUNTDOWN,
  STORAGE_KEYS.DAILY_CHECKIN,
  STORAGE_KEYS.WAGE_CAL,
  STORAGE_KEYS.MEAL_OPTIONS,
  STORAGE_KEYS.REMINDER
]

// ===================== 通用读写 =====================

/**
 * 读取本地存储（自动解析 JSON，出错返回 defaultVal）
 * @param {string} key
 * @param {*} defaultVal 默认值
 */
export function getStorage(key, defaultVal = null) {
  try {
    const val = uni.getStorageSync(key)
    return val !== '' && val !== null && val !== undefined ? val : defaultVal
  } catch (e) {
    console.warn(`[storage] getStorage "${key}" 失败`, e)
    return defaultVal
  }
}

/**
 * 写入本地存储
 * @param {string} key
 * @param {*} value
 */
export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
    return true
  } catch (e) {
    console.warn(`[storage] setStorage "${key}" 失败`, e)
    return false
  }
}

/**
 * 删除某个 key
 * @param {string} key
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (e) {
    return false
  }
}

// ===================== 模块化读写 =====================

/** 读取待办列表 */
export function getTodos() {
  const d = getStorage(STORAGE_KEYS.TODO, { todos: [] })
  return Array.isArray(d?.todos) ? d.todos : []
}

/** 保存待办列表 */
export function saveTodos(todos) {
  return setStorage(STORAGE_KEYS.TODO, { todos })
}

/** 读取物品列表 */
export function getItems() {
  const d = getStorage(STORAGE_KEYS.ITEMS, { items: [] })
  return Array.isArray(d?.items) ? d.items : []
}

/** 保存物品列表 */
export function saveItems(items) {
  return setStorage(STORAGE_KEYS.ITEMS, { items })
}

/** 读取倒数日/纪念日 */
export function getCountdownEvents() {
  const d = getStorage(STORAGE_KEYS.COUNTDOWN, { events: [] })
  return Array.isArray(d?.events) ? d.events : []
}

/** 保存倒数日/纪念日 */
export function saveCountdownEvents(events) {
  return setStorage(STORAGE_KEYS.COUNTDOWN, { events })
}

/** 读取每日打卡任务 */
export function getCheckinTasks() {
  const d = getStorage(STORAGE_KEYS.DAILY_CHECKIN, { tasks: [] })
  return Array.isArray(d?.tasks) ? d.tasks : []
}

/** 保存每日打卡任务 */
export function saveCheckinTasks(tasks) {
  return setStorage(STORAGE_KEYS.DAILY_CHECKIN, { tasks })
}

/** 读取工资计算数据 */
export function getWageCal() {
  return getStorage(STORAGE_KEYS.WAGE_CAL, {
    totalMonths: 120,
    targetAvg: 12000,
    monthRecords: []
  })
}

/** 保存工资计算数据 */
export function saveWageCal(data) {
  return setStorage(STORAGE_KEYS.WAGE_CAL, data)
}

/** 读取随机午餐菜单（纯文本，每行一项） */
export function getMealOptions() {
  return getStorage(STORAGE_KEYS.MEAL_OPTIONS, '兰州拉面\n沙县小吃\n麦当劳\n肯德基\n食堂盖饭\n自选快餐')
}

/** 保存随机午餐菜单 */
export function saveMealOptions(text) {
  return setStorage(STORAGE_KEYS.MEAL_OPTIONS, text)
}

/** 读取提醒设置 */
export function getReminderSettings() {
  return getStorage(STORAGE_KEYS.REMINDER, {
    dailyReminder: false,
    expiryReminder: false,
    countdownReminder: false
  })
}

/** 保存提醒设置 */
export function saveReminderSettings(settings) {
  return setStorage(STORAGE_KEYS.REMINDER, settings)
}

// ===================== 备份 & 恢复 =====================

/** 当前备份格式版本 */
export const BACKUP_VERSION = '1.0'

/**
 * 导出所有数据为一个 JSON 对象
 * @returns {{ version, exportedAt, data }}
 */
export function exportAllData() {
  const data = {}
  for (const key of BACKUP_KEYS) {
    data[key] = getStorage(key, null)
  }
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    appName: '个人工具箱',
    data
  }
}

/**
 * 从备份对象恢复所有数据
 * @param {object} backup exportAllData 产生的对象
 * @returns {{ success: boolean, message: string, restored: string[] }}
 */
export function importAllData(backup) {
  if (!backup || typeof backup !== 'object') {
    return { success: false, message: '无效的备份格式', restored: [] }
  }

  // 兼容旧格式（直接是 data map，没有 version 包装）
  const dataMap = backup.data || backup
  if (typeof dataMap !== 'object') {
    return { success: false, message: '无法解析数据内容', restored: [] }
  }

  const restored = []
  for (const key of BACKUP_KEYS) {
    if (dataMap[key] !== undefined && dataMap[key] !== null) {
      setStorage(key, dataMap[key])
      restored.push(key)
    }
  }

  if (restored.length === 0) {
    return { success: false, message: '备份文件中没有可恢复的数据', restored: [] }
  }

  return {
    success: true,
    message: `成功恢复 ${restored.length} 个数据模块`,
    restored
  }
}

/**
 * 清除全部数据
 */
export function clearAllData() {
  for (const key of BACKUP_KEYS) {
    removeStorage(key)
  }
}

/**
 * 统计各模块数据条数，用于设置页展示
 * @returns {Array<{ key, label, count }>}
 */
export function getDataStats() {
  return [
    { key: STORAGE_KEYS.TODO,          label: '待办事项', count: getTodos().length },
    { key: STORAGE_KEYS.ITEMS,         label: '物品管理', count: getItems().length },
    { key: STORAGE_KEYS.COUNTDOWN,     label: '倒数日',   count: getCountdownEvents().length },
    { key: STORAGE_KEYS.DAILY_CHECKIN, label: '每日打卡', count: getCheckinTasks().length },
    { key: STORAGE_KEYS.WAGE_CAL,      label: '工资月份', count: (getWageCal().monthRecords || []).length },
    { key: STORAGE_KEYS.MEAL_OPTIONS,  label: '午餐选项', count: (getMealOptions() || '').split('\n').filter(s => s.trim()).length }
  ]
}
