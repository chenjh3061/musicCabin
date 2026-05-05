// 统一读取各模块数据（本地存储）
const STORAGE_KEYS = {
  REMINDERS: 'remindersData',      // { reminders: [] }
  ITEMS: 'itemsData',              // { items: [] }  物品过期
  EVENTS: 'countdownData',         // { events: [] } 纪念日
  CHECKIN: 'dailyCheckinData',     // { tasks: [] }  打卡任务
  LOCATION: 'locationData',        // { items: [] }  物品位置（可选）
  TODO: 'todoData'                 // { todos: [] }  待办（若有）
}

// 获取提醒事项
export function getReminders() {
  const data = uni.getStorageSync(STORAGE_KEYS.REMINDERS) || { reminders: [] }
  return data.reminders || []
}

// 获取物品过期列表
export function getExpiryItems() {
  const data = uni.getStorageSync(STORAGE_KEYS.ITEMS) || { items: [] }
  return (data.items || []).filter(item => item.expiryDate)
}

// 获取纪念日列表
export function getEvents() {
  const data = uni.getStorageSync(STORAGE_KEYS.EVENTS) || { events: [] }
  return data.events || []
}

// 获取打卡任务及每日完成状态
export function getCheckinTasks() {
  const data = uni.getStorageSync(STORAGE_KEYS.CHECKIN) || { tasks: [] }
  return data.tasks || []
}

// 获取物品位置（可选）
export function getLocationItems() {
  const data = uni.getStorageSync(STORAGE_KEYS.LOCATION) || { items: [] }
  return data.items || []
}

// 获取待办（若已有 todo 页面）
export function getTodos() {
  const data = uni.getStorageSync(STORAGE_KEYS.TODO) || { todos: [] }
  return data.todos || []
}

// 获取某一天的所有事件（用于日历聚合）
export function getEventsForDate(dateStr) {
  const reminders = getReminders().filter(r => r.datetime && r.datetime.startsWith(dateStr))
  const expiryItems = getExpiryItems().filter(i => i.expiryDate === dateStr)
  const events = getEvents().filter(e => e.date === dateStr)
  // 打卡任务：今日是否已完成所有任务？计算未完成的任务数
  const tasks = getCheckinTasks()
  let checkinIncomplete = 0
  if (tasks.length > 0) {
    const today = dateStr
    tasks.forEach(task => {
      if (task.history && task.history[today] === false) {
        checkinIncomplete++
      }
    })
  }
  return {
    reminders,
    expiryItems,
    events,
    checkinIncomplete // 未打卡任务数
  }
}

// 全局搜索：在所有模块中搜索关键词
export function globalSearch(keyword) {
  if (!keyword) return []
  const kw = keyword.toLowerCase()
  const results = []

  // 提醒事项
  getReminders().forEach(r => {
    if (r.title && r.title.toLowerCase().includes(kw)) {
      results.push({ type: 'reminder', title: r.title, date: r.datetime, detail: r })
    }
  })
  // 物品过期
  getExpiryItems().forEach(i => {
    if (i.name && i.name.toLowerCase().includes(kw)) {
      results.push({ type: 'expiry', title: i.name, date: i.expiryDate, detail: i })
    }
  })
  // 纪念日
  getEvents().forEach(e => {
    if (e.name && e.name.toLowerCase().includes(kw)) {
      results.push({ type: 'event', title: e.name, date: e.date, detail: e })
    }
  })
  // 打卡任务
  getCheckinTasks().forEach(t => {
    if (t.name && t.name.toLowerCase().includes(kw)) {
      results.push({ type: 'checkin', title: t.name, detail: t })
    }
  })
  // 物品位置
  getLocationItems().forEach(l => {
    if (l.name && l.name.toLowerCase().includes(kw)) {
      results.push({ type: 'location', title: l.name, location: l.location, detail: l })
    }
  })
  return results
}

// 导出所有数据（用于备份）
export function exportAllData() {
  const allData = {
    remindersData: uni.getStorageSync(STORAGE_KEYS.REMINDERS),
    itemsData: uni.getStorageSync(STORAGE_KEYS.ITEMS),
    countdownData: uni.getStorageSync(STORAGE_KEYS.EVENTS),
    dailyCheckinData: uni.getStorageSync(STORAGE_KEYS.CHECKIN),
    locationData: uni.getStorageSync(STORAGE_KEYS.LOCATION),
    todoData: uni.getStorageSync(STORAGE_KEYS.TODO),
    settings: uni.getStorageSync('settings')  // 订阅设置等
  }
  return JSON.stringify(allData, null, 2)
}

// 导入数据（恢复）
export function importAllData(jsonStr) {
  try {
    const data = JSON.parse(jsonStr)
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        uni.setStorageSync(key, data[key])
      }
    })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}