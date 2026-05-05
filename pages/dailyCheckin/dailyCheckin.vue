<template>
  <view class="page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-left">
        <text class="greeting">每日打卡</text>
        <text class="date-text">{{ todayStr }}</text>
      </view>
      <view class="header-right">
        <text class="app-title">习惯追踪</text>
      </view>
    </view>

    <!-- 连续天数卡片 -->
    <view class="card stats">
      <view class="stat-item">
        <text class="stat-num">{{ longestStreak }}</text>
        <text class="stat-label">最长连续</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ currentStreak }}</text>
        <text class="stat-label">当前连续</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ totalDays }}</text>
        <text class="stat-label">总打卡天数</text>
      </view>
    </view>

    <!-- 任务列表 -->
    <view class="card">
      <view class="card-title">
        📋 我的习惯
        <text class="add-btn" @click="addTask">+ 添加</text>
      </view>
      <view v-for="task in tasks" :key="task.id" class="task-item">
        <view class="task-info">
          <text class="task-name">{{ task.name }}</text>
          <text class="task-remind" v-if="task.remindTime">⏰ {{ task.remindTime }}</text>
        </view>
        <view class="task-status" @click="toggleTask(task)">
          <text class="check-icon">{{ task.checkedToday ? '✅' : '⚪' }}</text>
        </view>
      </view>
      <view v-if="tasks.length === 0" class="empty-tip">
        暂无习惯，点击 + 添加吧
      </view>
    </view>

    <!-- 日历热力图（简洁版） -->
    <view class="card">
      <view class="card-title">📅 打卡日历</view>
      <view class="calendar-grid">
        <view v-for="day in last30Days" :key="day.date" class="cal-day" :class="{ active: day.checked }">
          <text class="cal-day-num">{{ day.day }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// ---------- 数据 ----------
const tasks = ref([])        // { id, name, remindTime, history: { YYYY-MM-DD: true } }
const todayStr = ref('')
const longestStreak = ref(0)
const currentStreak = ref(0)
const totalDays = ref(0)

// 今日日期 YYYY-MM-DD
function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
}

// 加载/保存数据
function loadData() {
  const stored = uni.getStorageSync('dailyCheckinData')
  if (stored) {
    tasks.value = stored.tasks || []
  } else {
    // 演示数据
    tasks.value = [
      { id: '1', name: '晨跑', remindTime: '07:00', history: {} },
      { id: '2', name: '阅读30分钟', remindTime: '21:00', history: {} }
    ]
    saveData()
  }
  // 初始化今日打卡状态
  ensureTodayHistory()
  updateStats()
}

function saveData() {
  uni.setStorageSync('dailyCheckinData', { tasks: tasks.value })
}

// 确保每个任务都有今日的记录字段
function ensureTodayHistory() {
  const today = getToday()
  let changed = false
  tasks.value.forEach(t => {
    if (!t.history) t.history = {}
    if (t.history[today] === undefined) {
      t.history[today] = false
      changed = true
    }
  })
  if (changed) {
    saveData()
    updateStats()
  }
}

// 切换打卡状态
function toggleTask(task) {
  const today = getToday()
  task.history[today] = !task.history[today]
  saveData()
  updateStats()
}

// 计算连续天数、总打卡天数等
function updateStats() {
  const today = getToday()
  const allHistoryDates = []
  tasks.value.forEach(task => {
    Object.keys(task.history).forEach(date => {
      if (task.history[date]) allHistoryDates.push(date)
    })
  })
  // 去重并排序
  const uniqueDates = [...new Set(allHistoryDates)].sort()
  totalDays.value = uniqueDates.length

  // 计算当前连续（从今天开始往前推，每天都有至少一个任务打卡）
  let streak = 0
  let cur = new Date()
  while (true) {
    const dateStr = `${cur.getFullYear()}-${(cur.getMonth()+1).toString().padStart(2,'0')}-${cur.getDate().toString().padStart(2,'0')}`
    let hasChecked = false
    for (let task of tasks.value) {
      if (task.history[dateStr] === true) { hasChecked = true; break }
    }
    if (hasChecked) {
      streak++
      cur.setDate(cur.getDate() - 1)
    } else {
      break
    }
  }
  currentStreak.value = streak

  // 最长连续（遍历所有日期）
  let maxStreak = 0
  let temp = 0
  let sortedDates = uniqueDates.sort()
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) { temp = 1; continue }
    const prev = new Date(sortedDates[i-1])
    const curr = new Date(sortedDates[i])
    const diffDays = (curr - prev) / (1000*3600*24)
    if (diffDays === 1) {
      temp++
    } else {
      maxStreak = Math.max(maxStreak, temp)
      temp = 1
    }
  }
  maxStreak = Math.max(maxStreak, temp)
  longestStreak.value = maxStreak
}

// 最近30天日历数据
const last30Days = computed(() => {
  const days = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
    let checked = false
    for (let task of tasks.value) {
      if (task.history[dateStr] === true) { checked = true; break }
    }
    days.push({
      day: d.getDate(),
      date: dateStr,
      checked
    })
  }
  return days
})

// 添加新任务
function addTask() {
  uni.showModal({
    title: '新建习惯',
    editable: true,
    placeholderText: '习惯名称，例如：喝水2L',
    success(res) {
      if (res.confirm && res.content) {
        const newId = Date.now().toString()
        tasks.value.push({
          id: newId,
          name: res.content,
          remindTime: '',
          history: {}
        })
        ensureTodayHistory()
        saveData()
        updateStats()
      }
    }
  })
}

onMounted(() => {
  todayStr.value = getToday()
  loadData()
})
</script>

<style scoped>
/* 复用之前的全局样式，追加局部样式 */
.page { min-height: 100vh; background: #f2f6fc; padding-bottom: 80rpx; }
.header { display: flex; justify-content: space-between; align-items: flex-end; padding: 60rpx 32rpx 24rpx; background: linear-gradient(135deg, #4A90D9 0%, #357abf 100%); }
.greeting { font-size: 38rpx; font-weight: 600; color: #fff; }
.date-text { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 6rpx; }
.app-title { font-size: 28rpx; color: rgba(255,255,255,0.7); }
.card { background: #fff; border-radius: 24rpx; margin: 20rpx 24rpx; padding: 32rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04); }
.card-title { font-size: 30rpx; font-weight: 600; color: #2c3e50; margin-bottom: 24rpx; display: flex; justify-content: space-between; align-items: center; }
.add-btn { font-size: 26rpx; color: #4A90D9; background: #eaf4fe; padding: 8rpx 20rpx; border-radius: 28rpx; }
.stats { display: flex; align-items: center; justify-content: space-around; padding: 24rpx 0; }
.stat-item { flex: 1; text-align: center; }
.stat-num { display: block; font-size: 44rpx; font-weight: 700; color: #2c3e50; }
.stat-label { font-size: 24rpx; color: #8a9bb0; margin-top: 8rpx; }
.stat-divider { width: 1rpx; height: 60rpx; background: #eef2f7; }
.task-item { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 0; border-bottom: 1rpx solid #f0f4f8; }
.task-name { font-size: 30rpx; color: #2c3e50; }
.task-remind { font-size: 24rpx; color: #8a9bb0; margin-left: 16rpx; }
.check-icon { font-size: 44rpx; }
.empty-tip { text-align: center; color: #aab5c2; padding: 40rpx 0; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12rpx; }
.cal-day { background: #f5f7fa; border-radius: 12rpx; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; }
.cal-day.active { background: #4A90D9; }
.cal-day.active .cal-day-num { color: #fff; }
.cal-day-num { font-size: 26rpx; color: #2c3e50; }
</style>