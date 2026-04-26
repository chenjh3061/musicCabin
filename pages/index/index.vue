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

    <!-- 今日概览卡片 -->
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

    <!-- 工具入口网格 -->
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

    <!-- 今日待办快速预览 -->
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
        <text class="quick-todo-text" :class="{ done: todo.done }">{{ todo.title }}</text>
        <text class="quick-todo-date" v-if="todo.dueDate">{{ formatD(todo.dueDate) }}</text>
      </view>
    </view>

    <!-- 即将过期物品提醒 -->
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
import { getDocs, COLLECTIONS } from '../../utils/db.js'
import { formatDate, getExpiryStatus, PRIORITY_MAP, daysFromNow } from '../../utils/helper.js'

// ---- 问候语 ----
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

// ---- 工具列表 ----
const tools = [
  { id: 'todo', name: '待办事项', desc: '任务管理', icon: '✅', bg: '#eaf4fe', path: '/pages/todo/todo' },
  { id: 'calendar', name: '日历提醒', desc: '事件安排', icon: '📅', bg: '#fef6e4', path: '/pages/calendar/calendar' },
  { id: 'items', name: '物品管理', desc: '过期提醒', icon: '📦', bg: '#e8faf0', path: '/pages/items/items' },
  { id: 'valuables', name: '贵重物品', desc: '查找位置', icon: '🔍', bg: '#fde9f4', path: '/pages/items/items?tab=valuable' },
  { id: 'wagecal', name: '工资计算', desc: '计算后面要多少钱', icon: '🔍', bg: '#929dfd', path: '/pages/wagecal/wageCal?tab=valuable'}
]

// ---- 数据 ----
const allTodos = ref([])
const allEvents = ref([])
const allItems = ref([])

const pendingTodos = computed(() => allTodos.value.filter(t => !t.done))
const todoCounts = computed(() => ({
  pending: allTodos.value.filter(t => !t.done).length,
  done: allTodos.value.filter(t => t.done).length
}))
const todayStr8 = formatDate(null, 'YYYY-MM-DD')
const todayEventCount = computed(() =>
  allEvents.value.filter(e => e.date && e.date.startsWith(todayStr8)).length
)
const urgentItems = computed(() =>
  allItems.value
    .filter(i => i.expiryDate && daysFromNow(i.expiryDate) <= 7 && daysFromNow(i.expiryDate) >= 0)
    .sort((a, b) => a.expiryDate - b.expiryDate)
)
const expiryCount = computed(() => urgentItems.value.length)

const priorityColor = (p) => (PRIORITY_MAP[p] || PRIORITY_MAP.medium).color
const formatD = (ts) => formatDate(ts, 'MM-DD')
const getExpiry = (ts) => getExpiryStatus(ts)

async function loadData() {
  const [t, e, i] = await Promise.all([
    getDocs(COLLECTIONS.TODO),
    getDocs(COLLECTIONS.EVENT),
    getDocs(COLLECTIONS.ITEM)
  ])
  allTodos.value = t.data || []
  allEvents.value = e.data || []
  allItems.value = i.data || []
}

onShow(() => { loadData() })

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

/* 顶部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 60rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #4A90D9 0%, #357abf 100%);
}
.greeting {
  display: block;
  font-size: 34rpx;
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

/* 概览卡片 */
.overview-card {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  margin: -24rpx 24rpx 0;
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

/* 工具网格 */
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #8a9bb0;
  padding: 32rpx 32rpx 16rpx;
}
.tool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding: 0 24rpx;
}
.tool-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.tool-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18rpx;
}
.tool-icon {
  font-size: 40rpx;
}
.tool-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c3e50;
}
.tool-desc {
  font-size: 22rpx;
  color: #aab;
  margin-top: 4rpx;
}

/* 快速预览卡片 */
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

/* 待办预览 */
.quick-todo-item {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f0f4f8;
}
.quick-todo-item:last-child { border-bottom: none; }
.priority-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;
}
.quick-todo-text {
  flex: 1;
  font-size: 28rpx;
  color: #2c3e50;
}
.quick-todo-text.done {
  text-decoration: line-through;
  color: #aab;
}
.quick-todo-date {
  font-size: 22rpx;
  color: #aab;
}

/* 过期预览 */
.expiry-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f0f4f8;
}
.expiry-item:last-child { border-bottom: none; }
.expiry-name {
  font-size: 28rpx;
  color: #2c3e50;
}
.expiry-tag {
  font-size: 24rpx;
  font-weight: 600;
}
</style>
