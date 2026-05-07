<template>
  <view class="music-home">
    <!-- 顶部音乐问候区 -->
    <view class="hero-section">
      <view class="hero-bg"></view>
      <view class="hero-content">
        <view class="greeting-box">
          <text class="greeting">{{ greeting }}</text>
          <text class="song-quote">🎵 生活如歌，缓慢而温柔</text>
        </view>
        <view class="date-box">
          <text class="date-text">{{ todayStr }}</text>
        </view>
      </view>
      <!-- 声波动画装饰 -->
      <view class="wave">
        <view class="wave-bar" v-for="n in 5" :key="n" :style="{ animationDelay: n*0.1+'s' }"></view>
      </view>
    </view>

    <!-- 搜索条 -->
    <view class="search-wrapper">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          v-model="keyword" 
          placeholder="搜索待办、物品、纪念日..." 
          confirm-type="search"
          @confirm="doSearch"
          placeholder-class="search-placeholder"
        />
        <view class="search-clear" v-if="keyword" @click="clearSearch">✖️</view>
      </view>
    </view>

    <!-- 搜索结果下拉卡片 -->
    <view class="search-result-card" v-if="keyword && searchResults.length">
      <view class="result-title">🔎 搜索结果</view>
      <view class="result-list">
        <view v-for="(item, idx) in searchResults" :key="idx" class="result-item" @click="goToDetail(item)">
          <view class="result-type" :style="{ background: item.typeColor }">{{ item.typeName }}</view>
          <view class="result-info">
            <text class="result-name">{{ item.name }}</text>
            <text class="result-desc">{{ item.info }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="search-empty" v-if="keyword && !searchResults.length">
      <text>🎧 没有找到相关记录，试试其他关键词~</text>
    </view>

    <!-- 今日活力卡片（数据概览） -->
    <view class="stats-card">
      <view class="stat-item" @click="navTo('/pages/todo/todo')">
        <text class="stat-num" style="color: #E9A6A6;">{{ todoCounts.pending }}</text>
        <text class="stat-label">待办</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="navTo('/pages/calendar/calendar')">
        <text class="stat-num" style="color: #C8A2C8;">{{ todayEventCount }}</text>
        <text class="stat-label">今日事件</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="navTo('/pages/items/items?tab=expiry')">
        <text class="stat-num" style="color: #E2B87A;">{{ expiryCount }}</text>
        <text class="stat-label">即将过期</text>
      </view>
    </view>

    <!-- 工具网格 -->
    <view class="section-title">✨ 灵感工具集</view>
    <view class="tool-grid">
      <view v-for="tool in tools" :key="tool.id" class="tool-card" @click="navTo(tool.path)">
        <view class="tool-icon" :style="{ background: tool.bg }">
          <text>{{ tool.icon }}</text>
        </view>
        <text class="tool-name">{{ tool.name }}</text>
        <text class="tool-desc">{{ tool.desc }}</text>
      </view>
    </view>

    <!-- 今日待办轻提示 -->
    <view class="music-card" v-if="pendingTodos.length">
      <view class="card-header">
        <text class="card-title">🎼 今日待办</text>
        <text class="card-more" @click="navTo('/pages/todo/todo')">全部 ›</text>
      </view>
      <view v-for="todo in pendingTodos.slice(0, 3)" :key="todo._id" class="todo-item">
        <view class="todo-dot" :style="{ background: priorityColor(todo.priority) }"></view>
        <text class="todo-text">{{ todo.title }}</text>
        <text class="todo-date" v-if="todo.dueDate">{{ formatD(todo.dueDate) }}</text>
      </view>
    </view>

    <!-- 即将过期小贴士 -->
    <view class="music-card" v-if="urgentItems.length">
      <view class="card-header">
        <text class="card-title">⏳ 临期物品</text>
        <text class="card-more" @click="navTo('/pages/items/items?tab=expiry')">全部 ›</text>
      </view>
      <view v-for="item in urgentItems.slice(0, 3)" :key="item._id" class="expiry-item">
        <text class="expiry-name">{{ item.name }}</text>
        <text class="expiry-tag" :style="{ color: getExpiry(item.expiryDate).color }">
          {{ getExpiry(item.expiryDate).label }}
        </text>
      </view>
    </view>

    <!-- 底部装饰音符 -->
    <view class="footer-note">♪ 让生活像一首慢歌 ♪</view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { formatDate, getExpiryStatus, PRIORITY_MAP, daysFromNow } from '../../utils/helper.js'
import { globalSearch } from '../../utils/dataManager.js'

// 问候语 & 日期
const hour = new Date().getHours()
const greeting = computed(() => {
  if (hour < 6) return '夜深静听，一曲安眠 🌙'
  if (hour < 12) return '晨光温柔，旋律苏醒 ☀️'
  if (hour < 14) return '午间小憩，听首轻音乐 🍃'
  if (hour < 18) return '午后时光，唱片旋转 📀'
  return '夜幕降临，灵魂爵士 🎷'
})
const todayStr = formatDate(null, 'YYYY年MM月DD日')

// 工具列表（风格图标）
const tools = [
  { id: 'todo', name: '待办', desc: '温柔清单', icon: '📝', bg: '#E3F2FC', path: '/pages/todo/todo' },
  { id: 'calendar', name: '日历', desc: '音律日程', icon: '📅', bg: '#DFF4F4', path: '/pages/calendar/calendar' },
  { id: 'items', name: '物品', desc: '过期关怀', icon: '🎁', bg: '#E3EEF9', path: '/pages/items/items' },
  { id: 'dailycheckin', name: '习惯', desc: '每日练习', icon: '🎵', bg: '#DFFAF0', path: '/pages/dailyCheckin/dailyCheckin' },
  { id: 'countdown', name: '纪念日', desc: '期待的日子', icon: '🎂', bg: '#D9EEFA', path: '/pages/countDown/countDown' },
  { id: 'random', name: '随机', desc: '今天吃什么', icon: '🍜', bg: '#E0F5F5', path: '/pages/randomDecision/randomDecision' },
  { id: 'wagecal', name: '薪资', desc: '理想音符', icon: '💰', bg: '#DFF0FB', path: '/pages/wagecal/wageCal' },
  { id: 'unit', name: '换算', desc: '度量韵律', icon: '📏', bg: '#DDF3F0', path: '/pages/unitConvertor/unitConvertor' },
   { id: 'idong', name: '爱动', desc: '度量韵律', icon: '❤', bg: '#DDF3F0', path: '/pages/idong/idong' },
  { id: 'setting', name: '设置', desc: '调音台', icon: '⚙️', bg: '#E3EFFA', path: '/pages/settings/settings' }
]

// 数据与搜索（与之前逻辑一致，但使用统一 dataManager）
const allTodos = ref([])
const allEvents = ref([])
const allItems = ref([])
const allTasks = ref([])
const pendingTodos = computed(() => allTodos.value.filter(t => !t.done))
const todoCounts = computed(() => ({ pending: pendingTodos.value.length }))
const todayStr8 = formatDate(null, 'YYYY-MM-DD')
const todayEventCount = computed(() => {
  let cnt = 0
  cnt += allTodos.value.filter(t => t.dueDate === todayStr8).length
  cnt += allItems.value.filter(i => i.expiryDate === todayStr8).length
  cnt += allEvents.value.filter(e => e.date === todayStr8).length
  return cnt
})
const urgentItems = computed(() => 
  allItems.value.filter(i => i.expiryDate && daysFromNow(i.expiryDate) <= 7 && daysFromNow(i.expiryDate) >= 0)
)
const expiryCount = computed(() => urgentItems.value.length)
const priorityColor = (p) => (PRIORITY_MAP[p] || PRIORITY_MAP.medium).color
const formatD = (ts) => formatDate(ts, 'MM-DD')
const getExpiry = (ts) => getExpiryStatus(ts)

function loadAllData() {
  const todoStore = uni.getStorageSync('todoList')
  allTodos.value = todoStore?.todos || []
  const eventStore = uni.getStorageSync('countdownData')
  allEvents.value = eventStore?.events || []
  const itemStore = uni.getStorageSync('itemsData')
  allItems.value = itemStore?.items || []
  const taskStore = uni.getStorageSync('dailyCheckinData')
  allTasks.value = taskStore?.tasks || []
}

// 搜索功能
const keyword = ref('')
const searchResults = ref([])
async function doSearch() {
  if (!keyword.value.trim()) { searchResults.value = []; return }
  const kw = keyword.value.trim()
  const results = await globalSearch(kw)
  searchResults.value = results
}
function clearSearch() { keyword.value = ''; searchResults.value = [] }
function goToDetail(item) { uni.navigateTo({ url: item.path }) }
function navTo(path) { uni.switchTab({ url: path, fail: () => uni.navigateTo({ url: path }) }) }

onShow(() => { loadAllData() })
</script>

<style scoped>
@import '/styles/music-theme.scss';

/* ---- 页面容器 ---- */
.music-home { padding-bottom: 120rpx; background: #EDF4FB; min-height: 100vh; }

/* ---- Hero 顶部区 ---- */
.hero-section {
  position: relative;
  background: linear-gradient(145deg, #3A7FD5 0%, #29ACAB 100%);
  padding: 80rpx 32rpx 72rpx;
  border-radius: 0 0 64rpx 64rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(42, 100, 180, 0.18);
}
.hero-section::before {
  content: '';
  position: absolute;
  top: -60rpx; right: -60rpx;
  width: 300rpx; height: 300rpx;
  background: rgba(255,255,255,0.06);
  border-radius: 50%;
}
.hero-content { position: relative; z-index: 2; }
.greeting-box .greeting { font-size: 42rpx; font-weight: 700; color: #fff; letter-spacing: 1rpx; display: block; }
.song-quote { font-size: 24rpx; color: rgba(255,255,255,0.78); margin-top: 10rpx; display: block; }
.date-text {
  display: inline-block;
  font-size: 26rpx; color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.18);
  padding: 8rpx 28rpx; border-radius: 60rpx;
  backdrop-filter: blur(8px);
  margin-top: 16rpx;
  border: 1rpx solid rgba(255,255,255,0.25);
}
/* 声波动效 */
.wave { position: absolute; bottom: 24rpx; right: 36rpx; display: flex; gap: 8rpx; align-items: flex-end; }
.wave-bar {
  width: 6rpx; height: 28rpx;
  background: rgba(255,255,255,0.4); border-radius: 6rpx;
  animation: wave 1.3s infinite ease-in-out;
}
@keyframes wave { 0%,100% { height: 12rpx; } 50% { height: 40rpx; } }
.wave-bar:nth-child(1) { animation-delay: 0s; }
.wave-bar:nth-child(2) { animation-delay: 0.13s; }
.wave-bar:nth-child(3) { animation-delay: 0.26s; }
.wave-bar:nth-child(4) { animation-delay: 0.13s; }
.wave-bar:nth-child(5) { animation-delay: 0s; }

/* ---- 搜索框 ---- */
.search-wrapper { margin: -36rpx 24rpx 0; position: relative; z-index: 10; }
.search-box {
  background: rgba(255,255,255,0.96); backdrop-filter: blur(20px);
  border-radius: 60rpx; padding: 18rpx 28rpx;
  display: flex; align-items: center; gap: 16rpx;
  box-shadow: 0 6rpx 24rpx rgba(74,144,217,0.12);
  border: 1rpx solid #D6E9F7;
}
.search-icon { font-size: 36rpx; color: #8FAEC8; }
.search-input { flex: 1; font-size: 28rpx; color: #1E3A5C; }
.search-clear { font-size: 32rpx; color: #8FAEC8; }

/* ---- 搜索结果 ---- */
.search-result-card {
  background: #fff; border-radius: 24rpx;
  margin: 12rpx 24rpx; padding: 20rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(74,144,217,0.10);
  border: 1rpx solid #D6E9F7;
}
.result-title { font-size: 24rpx; color: #8FAEC8; margin-bottom: 12rpx; }
.result-item { display: flex; align-items: center; padding: 14rpx 0; border-bottom: 1rpx solid #EEF4FA; gap: 16rpx; }
.result-type { font-size: 20rpx; color: #fff; padding: 4rpx 14rpx; border-radius: 20rpx; font-weight: 600; flex-shrink: 0; }
.result-name { font-size: 28rpx; color: #1E3A5C; display: block; }
.result-desc { font-size: 22rpx; color: #8FAEC8; display: block; }
.search-empty { text-align: center; padding: 24rpx; font-size: 26rpx; color: #8FAEC8; }

/* ---- 数据概览 ---- */
.stats-card {
  background: rgba(255,255,255,0.93); backdrop-filter: blur(20px);
  border-radius: 40rpx; margin: 20rpx 24rpx; padding: 28rpx 0;
  display: flex; justify-content: space-around;
  box-shadow: 0 6rpx 24rpx rgba(74,144,217,0.10);
  border: 1rpx solid #D6E9F7;
}
.stat-item { text-align: center; flex: 1; }
.stat-num { font-size: 52rpx; font-weight: 700; display: block; }
.stat-label { font-size: 22rpx; color: #8FAEC8; margin-top: 6rpx; display: block; }
.stat-divider { width: 1rpx; background: #D6E9F7; height: 56rpx; align-self: center; }

/* ---- 工具网格 ---- */
.section-title {
  padding: 28rpx 32rpx 14rpx;
  font-size: 30rpx; font-weight: 700; color: #1E3A5C;
  letter-spacing: 1rpx;
}
.tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18rpx; padding: 0 24rpx; }
.tool-card {
  background: rgba(255,255,255,0.95);
  border-radius: 32rpx; padding: 28rpx 14rpx 22rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(74,144,217,0.07);
  border: 1rpx solid #E3F2FC;
  transition: all 0.15s;
  display: flex; flex-direction: column; align-items: center;
}
.tool-card:active { transform: scale(0.96); box-shadow: none; }
.tool-icon {
  width: 88rpx; height: 88rpx; border-radius: 44rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 46rpx; margin-bottom: 18rpx;
}
.tool-name { font-size: 26rpx; font-weight: 600; color: #1E3A5C; }
.tool-desc { font-size: 20rpx; color: #8FAEC8; margin-top: 4rpx; }

/* ---- 今日待办/临期物品卡片 ---- */
.music-card {
  background: rgba(255,255,255,0.93); backdrop-filter: blur(20px);
  border-radius: 40rpx; margin: 16rpx 24rpx; padding: 24rpx 28rpx;
  box-shadow: 0 6rpx 24rpx rgba(74,144,217,0.10);
  border: 1rpx solid #D6E9F7;
}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18rpx; }
.card-title { font-size: 30rpx; font-weight: 600; color: #2F72C0; }
.card-more { font-size: 24rpx; color: #6EB3F0; background: #E3F2FC; padding: 4rpx 18rpx; border-radius: 30rpx; }
.todo-item, .expiry-item {
  display: flex; align-items: center;
  padding: 16rpx 0; border-bottom: 1rpx solid #EEF4FA;
}
.todo-dot { width: 12rpx; height: 12rpx; border-radius: 12rpx; margin-right: 20rpx; flex-shrink: 0; }
.todo-text { flex: 1; font-size: 28rpx; color: #1E3A5C; }
.todo-date { font-size: 22rpx; color: #8FAEC8; }
.expiry-name { flex: 1; font-size: 28rpx; color: #1E3A5C; }
.expiry-tag { font-size: 22rpx; font-weight: 600; }

/* ---- 底部装饰 ---- */
.footer-note { text-align: center; font-size: 24rpx; color: #B8D4EC; margin: 40rpx 0; letter-spacing: 3rpx; }
</style>