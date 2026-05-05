<template>
  <view class="page">
    <!-- 顶部问候区 -->
    <view class="header">
      <view class="header-left">
        <text class="greeting">{{ greeting }}</text>
        <text class="date-text">{{ todayStr }}</text>
      </view>
      <view class="header-right">
        <text class="app-title">工具箱</text>
      </view>
    </view>

    <!-- 全局搜索条 -->
    <view class="search-bar">
      <input 
        class="search-input" 
        v-model="keyword" 
        placeholder="搜索提醒、物品、纪念日、打卡..." 
        confirm-type="search"
        @confirm="doSearch"
      />
      <view class="search-icon" @click="doSearch">🔍</view>
      <view class="search-clear" v-if="keyword" @click="clearSearch">✖️</view>
    </view>

    <!-- 搜索结果区域（仅当有搜索词时显示） -->
    <view class="search-result" v-if="keyword && searchResults.length">
      <view class="result-title">搜索结果：</view>
      <view class="result-list">
        <view v-for="(item, idx) in searchResults" :key="idx" class="result-item" @click="goToDetail(item)">
          <view class="result-type" :style="{ background: item.typeColor }">{{ item.typeName }}</view>
          <view class="result-content">
            <text class="result-name">{{ item.name }}</text>
            <text class="result-info">{{ item.info }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="search-empty" v-if="keyword && !searchResults.length">
      <text>没有找到相关内容</text>
    </view>

    <!-- 今日概览卡片（保持不变） -->
    <view class="overview-card">
      <view class="overview-item" @click="navTo('/pages/todo/todo')">
        <text class="ov-num" :style="{ color: '#e74c3c' }">{{ todoCounts.pending }}</text>
        <text class="ov-label">待完成</text>
      </view>
      <view class="ov-divider"></view>
      <view class="overview-item" @click="navTo('/pages/calendar/calendar')">
        <text class="ov-num" :style="{ color: '#f39c12' }">{{ todayEventCount }}</text>
        <text class="ov-label">今日事件</text>
      </view>
      <view class="ov-divider"></view>
      <view class="overview-item" @click="navTo('/pages/items/items?tab=expiry')">
        <text class="ov-num" :style="{ color: '#e67e22' }">{{ expiryCount }}</text>
        <text class="ov-label">即将过期</text>
      </view>
    </view>

    <!-- 工具入口网格（保持不变，可新增工资计算入口） -->
    <view class="section-title">常用工具</view>
    <view class="tool-grid">
      <view
        v-for="tool in tools"
        :key="tool.id"
        class="tool-item"
        @click="navTo(tool.path)"
      >
        <view class="tool-icon-wrap" :style="{ background: tool.bg }">
          <text class="tool-icon">{{ tool.icon }}</text>
        </view>
        <text class="tool-name">{{ tool.name }}</text>
        <text class="tool-desc">{{ tool.desc }}</text>
      </view>
    </view>

    <!-- 今日待办快速预览（保持不变） -->
    <view class="section-card" v-if="pendingTodos.length > 0">
      <view class="section-header">
        <text class="section-title-inline">待办提醒</text>
        <text class="section-more" @click="navTo('/pages/todo/todo')">查看全部 ›</text>
      </view>
      <view
        v-for="todo in pendingTodos.slice(0, 3)"
        :key="todo._id"
        class="quick-todo-item"
      >
        <view
          class="priority-dot"
          :style="{ background: priorityColor(todo.priority) }"
        ></view>
        <text class="quick-todo-text">{{ todo.title }}</text>
        <text class="quick-todo-date" v-if="todo.dueDate">{{ formatD(todo.dueDate) }}</text>
      </view>
    </view>

    <!-- 即将过期物品提醒（保持不变） -->
    <view class="section-card" v-if="urgentItems.length > 0">
      <view class="section-header">
        <text class="section-title-inline">过期提醒</text>
        <text class="section-more" @click="navTo('/pages/items/items?tab=expiry')">查看全部 ›</text>
      </view>
      <view
        v-for="item in urgentItems.slice(0, 3)"
        :key="item._id"
        class="expiry-item"
      >
        <text class="expiry-name">{{ item.name }}</text>
        <text
          class="expiry-tag"
          :style="{ color: getExpiry(item.expiryDate).color }"
        >{{ getExpiry(item.expiryDate).label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { formatDate, getExpiryStatus, PRIORITY_MAP, daysFromNow } from '../../utils/helper.js'

// ---------- 问候语 ----------
const now = new Date()
const hour = now.getHours()
const greeting = computed(() => {
  if (hour < 6) return '夜深了，注意休息 🌙'
  if (hour < 12) return '早上好，新的一天开始了 ☀️'
  if (hour < 14) return '中午好，记得休息一下 🍽️'
  if (hour < 18) return '下午好，继续加油 💪'
  return '晚上好，今天辛苦了 🌆'
})
const todayStr = formatDate(null, 'YYYY年MM月DD日')

// ---------- 工具列表（增加设置入口） ----------
const tools = [
  { id: 'todo', name: '待办事项', desc: '任务管理', icon: '✅', bg: '#eaf4fe', path: '/pages/todo/todo' },
  { id: 'calendar', name: '日历提醒', desc: '事件安排', icon: '📅', bg: '#fef6e4', path: '/pages/calendar/calendar' },
  { id: 'items', name: '物品管理', desc: '过期提醒', icon: '📦', bg: '#e8faf0', path: '/pages/items/items' },
  { id: 'dailycheckin', name: '每日打卡', desc: '习惯追踪', icon: '✅', bg: '#eaf4fe', path: '/pages/dailyCheckin/dailyCheckin' },
  { id: 'countdown', name: '倒数日', desc: '纪念日提醒', icon: '📅', bg: '#fef6e4', path: '/pages/countDown/countDown' },
  { id: 'random', name: '随机决定', desc: '抽签 / 午餐', icon: '🎲', bg: '#e8faf0', path: '/pages/randomDecision/randomDecision' },
  { id: 'wagecal', name: '工资计算', desc: '目标薪资规划', icon: '💰', bg: '#ffedea', path: '/pages/wagecal/wageCal' },
  { id: 'setting', name: '设置', desc: '备份 / 提醒', icon: '⚙️', bg: '#e0e7ff', path: '/pages/settings/settings' }
]

// ---------- 数据 ----------
const allTodos = ref([])
const allEvents = ref([])      // 纪念日
const allItems = ref([])       // 物品过期
const allTasks = ref([])       // 打卡任务

const pendingTodos = computed(() => allTodos.value.filter(t => !t.done))
const todoCounts = computed(() => ({
  pending: pendingTodos.value.length
}))
const todayStr8 = formatDate(null, 'YYYY-MM-DD')
const todayEventCount = computed(() => {
  let cnt = 0
  // 待办中今天截止的
  cnt += allTodos.value.filter(t => t.dueDate && t.dueDate.startsWith(todayStr8)).length
  // 今日到期的物品
  cnt += allItems.value.filter(i => i.expiryDate === todayStr8).length
  // 今日纪念日
  cnt += allEvents.value.filter(e => e.date === todayStr8).length
  return cnt
})
const urgentItems = computed(() =>
  allItems.value
    .filter(i => i.expiryDate && daysFromNow(i.expiryDate) <= 7 && daysFromNow(i.expiryDate) >= 0)
    .sort((a, b) => a.expiryDate - b.expiryDate)
)
const expiryCount = computed(() => urgentItems.value.length)

const priorityColor = (p) => (PRIORITY_MAP[p] || PRIORITY_MAP.medium).color
const formatD = (ts) => formatDate(ts, 'MM-DD')
const getExpiry = (ts) => getExpiryStatus(ts)

// ---------- 搜索 ----------
const keyword = ref('')
const searchResults = ref([])

function loadAllData() {
  // 从本地存储加载各模块数据
  const todoStore = uni.getStorageSync('todoList')
  allTodos.value = todoStore?.todos || []
  const eventStore = uni.getStorageSync('countdownData')
  allEvents.value = eventStore?.events || []
  const itemStore = uni.getStorageSync('itemsData')
  allItems.value = itemStore?.items || []
  const taskStore = uni.getStorageSync('dailyCheckinData')
  allTasks.value = taskStore?.tasks || []
}

function doSearch() {
  if (!keyword.value.trim()) {
    searchResults.value = []
    return
  }
  const kw = keyword.value.trim().toLowerCase()
  const results = []

  // 搜索待办事项
  allTodos.value.forEach(t => {
    if (t.title?.toLowerCase().includes(kw)) {
      results.push({
        typeName: '待办',
        typeColor: '#e74c3c',
        name: t.title,
        info: t.dueDate ? `截止 ${t.dueDate}` : '无截止日期',
        path: '/pages/todo/todo',
        id: t._id
      })
    }
  })
  // 搜索物品
  allItems.value.forEach(i => {
    if (i.name?.toLowerCase().includes(kw)) {
      results.push({
        typeName: '物品',
        typeColor: '#e67e22',
        name: i.name,
        info: `过期 ${i.expiryDate || '未设置'}`,
        path: '/pages/items/items?tab=expiry',
        id: i._id
      })
    }
  })
  // 搜索纪念日
  allEvents.value.forEach(e => {
    if (e.name?.toLowerCase().includes(kw)) {
      results.push({
        typeName: '纪念日',
        typeColor: '#f39c12',
        name: e.name,
        info: `日期 ${e.date}`,
        path: '/pages/countdown/countdown',
        id: e.id
      })
    }
  })
  // 搜索打卡任务
  allTasks.value.forEach(t => {
    if (t.name?.toLowerCase().includes(kw)) {
      results.push({
        typeName: '打卡',
        typeColor: '#2ecc71',
        name: t.name,
        info: t.remindTime ? `提醒 ${t.remindTime}` : '无提醒',
        path: '/pages/dailycheckin/dailyCheckin',
        id: t.id
      })
    }
  })

  searchResults.value = results
}

function clearSearch() {
  keyword.value = ''
  searchResults.value = []
}

function goToDetail(item) {
  // 跳转到对应页面，如果页面需要定位具体项，可以传递参数
  uni.navigateTo({ url: item.path })
}

// ---------- 加载数据 & 生命周期 ----------
onShow(() => {
  loadAllData()
})

// 导航
function navTo(path) {
  uni.switchTab({ url: path, fail: () => uni.navigateTo({ url: path }) })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f2f6fc;
  padding-bottom: 120rpx;
}
/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 60rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #4A90D9 0%, #357abf 100%);
}
.greeting {
  display: block;
  font-size: 38rpx;
  font-weight: 600;
  color: #fff;
}
.date-text {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 6rpx;
}
.app-title {
  font-size: 28rpx;
  color: rgba(255,255,255,0.7);
}
/* 搜索条 */
.search-bar {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 48rpx;
  padding: 12rpx 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.search-input {
  flex: 1;
  font-size: 28rpx;
  padding: 12rpx 0;
}
.search-icon, .search-clear {
  font-size: 36rpx;
  padding: 0 8rpx;
  color: #8a9bb0;
}
/* 搜索结果 */
.search-result {
  margin: 0 24rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  max-height: 500rpx;
  overflow-y: auto;
}
.result-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16rpx;
}
.result-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f4f8;
}
.result-type {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 28rpx;
  color: white;
}
.result-content {
  flex: 1;
}
.result-name {
  font-size: 28rpx;
  font-weight: 500;
  display: block;
}
.result-info {
  font-size: 22rpx;
  color: #8a9bb0;
}
.search-empty {
  text-align: center;
  margin: 20rpx;
  color: #8a9bb0;
}
/* 以下复用原有样式（概览卡、工具网格等保持不变） */
.overview-card {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  margin: 0 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(74,144,217,0.15);
  padding: 32rpx 0;
}
.overview-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ov-num {
  font-size: 52rpx;
  font-weight: 700;
  line-height: 1;
}
.ov-label {
  font-size: 24rpx;
  color: #8a9bb0;
  margin-top: 8rpx;
}
.ov-divider {
  width: 1rpx;
  background: #eef2f7;
  margin: 8rpx 0;
}
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #8a9bb0;
  padding: 32rpx 32rpx 16rpx;
}
.tool-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  padding: 0 24rpx;
}
.tool-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.tool-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}
.tool-icon {
  font-size: 40rpx;
}
.tool-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #2c3e50;
}
.tool-desc {
  font-size: 20rpx;
  color: #aab;
  margin-top: 4rpx;
}
.section-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 20rpx 24rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18rpx;
}
.section-title-inline {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c3e50;
}
.section-more {
  font-size: 24rpx;
  color: #4A90D9;
}
.quick-todo-item {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f0f4f8;
}
.priority-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}
.quick-todo-text {
  flex: 1;
  font-size: 28rpx;
  color: #2c3e50;
}
.quick-todo-date {
  font-size: 22rpx;
  color: #aab;
}
.expiry-item {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f0f4f8;
}
.expiry-name {
  font-size: 28rpx;
}
</style>