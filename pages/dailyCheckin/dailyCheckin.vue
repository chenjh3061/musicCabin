<template>
  <view class="page">
    <view class="music-hero">
      <text class="hero-icon">🎵</text>
      <text class="hero-title">每日练习</text>
      <text class="hero-sub">习惯 · 坚持 · 成长</text>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card">
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

    <!-- 习惯列表 -->
    <view class="music-card">
      <view class="card-header">
        <text class="card-title">📋 我的习惯</text>
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
        还没有习惯，点击 + 添加吧
      </view>
    </view>

    <!-- 打卡热力图（最近30天） -->
    <view class="music-card">
      <view class="card-title">📅 最近30天打卡</view>
      <view class="heatmap-grid">
        <view v-for="day in last30Days" :key="day.date" class="heatmap-day" :class="{ active: day.checked }">
          <text class="heatmap-num">{{ day.day }}</text>
        </view>
      </view>
      <view class="heatmap-legend">
        <view class="legend-dot"></view>
        <text class="legend-text">已打卡</text>
      </view>
    </view>

    <view class="music-footer">♫ 每天进步一点点 ♫</view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// ---------- 数据 ----------
const tasks = ref([])        // { id, name, remindTime, history: { YYYY-MM-DD: bool } }
const longestStreak = ref(0)
const currentStreak = ref(0)
const totalDays = ref(0)

// 获取今日 YYYY-MM-DD
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
      { id: '1', name: '晨间冥想', remindTime: '07:00', history: {} },
      { id: '2', name: '练琴30分钟', remindTime: '20:00', history: {} }
    ]
    saveData()
  }
  ensureTodayHistory()
  updateStats()
}

function saveData() {
  uni.setStorageSync('dailyCheckinData', { tasks: tasks.value })
}

// 确保每个任务都有今日记录
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

// 计算连续天数、总打卡天数
function updateStats() {
  const today = getToday()
  const allHistoryDates = []
  tasks.value.forEach(task => {
    Object.keys(task.history).forEach(date => {
      if (task.history[date]) allHistoryDates.push(date)
    })
  })
  const uniqueDates = [...new Set(allHistoryDates)].sort()
  totalDays.value = uniqueDates.length

  // 当前连续（从今天开始往前推，每天都有至少一个打卡）
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

  // 最长连续
  let maxStreak = 0
  let temp = 0
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) { temp = 1; continue }
    const prev = new Date(uniqueDates[i-1])
    const curr = new Date(uniqueDates[i])
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

// 最近30天打卡数据（用于热力图）
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

// 添加任务
function addTask() {
  uni.showModal({
    title: '新建习惯',
    editable: true,
    placeholderText: '习惯名称，例如：阅读30分钟',
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
  loadData()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #F0F4FA;
  padding-bottom: 40rpx;
}

.hero-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 12rpx;
}
.hero-title {
  font-size: 44rpx;
  font-weight: 600;
  letter-spacing: 4rpx;
}
.hero-sub {
  font-size: 24rpx;
  opacity: 0.9;
  margin-top: 8rpx;
}

.stats-card {
  background: white;
  border-radius: 48rpx;
  margin: 24rpx;
  padding: 32rpx 0;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.02);
}
.stat-item {
  text-align: center;
  flex: 1;
}
.stat-num {
  font-size: 52rpx;
  font-weight: 700;
  color: #5D9BEC;
}
.stat-label {
  font-size: 24rpx;
  color: #7F8C8D;
  margin-top: 12rpx;
  display: block;
}
.stat-divider {
  width: 1rpx;
  background: #E4E9F2;
  height: 60rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}
.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2C3E50;
}
.add-btn {
  font-size: 26rpx;
  color: #5D9BEC;
  background: #E8F0FE;
  padding: 8rpx 24rpx;
  border-radius: 60rpx;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #E4E9F2;
}
.task-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #2C3E50;
}
.task-remind {
  font-size: 24rpx;
  color: #95A5A6;
  margin-left: 16rpx;
}
.check-icon {
  font-size: 48rpx;
}
.empty-tip {
  text-align: center;
  color: #95A5A6;
  padding: 60rpx 0;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 12rpx;
  margin-top: 20rpx;
}
.heatmap-day {
  background: #F0F4FA;
  border-radius: 12rpx;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.heatmap-day.active {
  background: #5D9BEC;
}
.heatmap-day.active .heatmap-num {
  color: white;
}
.heatmap-num {
  font-size: 24rpx;
  color: #7F8C8D;
}
.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20rpx;
}
.legend-dot {
  width: 20rpx;
  height: 20rpx;
  background: #5D9BEC;
  border-radius: 4rpx;
  margin-right: 8rpx;
}
.legend-text {
  font-size: 24rpx;
  color: #7F8C8D;
}
</style>