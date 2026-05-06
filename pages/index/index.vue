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
  { id: 'todo', name: '待办', desc: '温柔清单', icon: '📝', bg: '#FFF0E6', path: '/pages/todo/todo' },
  { id: 'calendar', name: '日历', desc: '音律日程', icon: '📅', bg: '#F0E9FF', path: '/pages/calendar/calendar' },
  { id: 'items', name: '物品', desc: '过期关怀', icon: '🎁', bg: '#FFEDE6', path: '/pages/items/items' },
  { id: 'dailycheckin', name: '习惯', desc: '每日练习', icon: '🎵', bg: '#E6F4EA', path: '/pages/dailyCheckin/dailyCheckin' },
  { id: 'countdown', name: '纪念日', desc: '期待的日子', icon: '🎂', bg: '#F9E6F0', path: '/pages/countDown/countDown' },
  { id: 'random', name: '随机', desc: '今天吃什么', icon: '🍜', bg: '#FFF0D6', path: '/pages/randomDecision/randomDecision' },
  { id: 'wagecal', name: '薪资', desc: '理想音符', icon: '💰', bg: '#E8F0FF', path: '/pages/wagecal/wageCal' },
  { id: 'unit', name: '换算', desc: '度量韵律', icon: '📏', bg: '#DFF2F0', path: '/pages/unitConvertor/unitConvertor' },
  { id: 'setting', name: '设置', desc: '调音台', icon: '⚙️', bg: '#EEE8FF', path: '/pages/settings/settings' }
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

.music-home { padding-bottom: 100rpx; }
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #EADBC6 0%, #D9CBB8 100%);
  padding: 80rpx 32rpx 60rpx;
  border-radius: 0 0 60rpx 60rpx;
  overflow: hidden;
}
/* 其余样式与之前音乐风格一致，但使用变量 */
.hero-content { position: relative; z-index: 2; }
.greeting-box .greeting { font-size: 44rpx; font-weight: 600; color: #4F3B2C; }
.song-quote { font-size: 24rpx; color: #7A6250; margin-top: 12rpx; }
.date-text { font-size: 28rpx; color: #8F735C; background: rgba(255,245,225,0.6); padding: 8rpx 24rpx; border-radius: 60rpx; backdrop-filter: blur(8px); }
.wave { position: absolute; bottom: 20rpx; left: 32rpx; display: flex; gap: 8rpx; }
.wave-bar { width: 6rpx; height: 30rpx; background: rgba(79,59,44,0.3); border-radius: 6rpx; animation: wave 1.2s infinite ease-in-out; }
@keyframes wave { 0%,100% { height: 16rpx; } 50% { height: 40rpx; } }
.search-wrapper { margin: -32rpx 24rpx 0; position: relative; z-index: 10; }
.search-box { background: $primary-card; backdrop-filter: blur(20px); border-radius: 60rpx; padding: 16rpx 24rpx; display: flex; align-items: center; gap: 16rpx; box-shadow: $card-shadow; }
.search-icon { font-size: 36rpx; color: #B59A82; }
.search-input { flex: 1; font-size: 28rpx; }
.search-clear { font-size: 32rpx; color: #B59A82; }
.stats-card { background: $primary-card; backdrop-filter: blur(20px); border-radius: 40rpx; margin: 24rpx; padding: 28rpx 0; display: flex; justify-content: space-around; box-shadow: $card-shadow; }
.stat-item { text-align: center; flex: 1; }
.stat-num { font-size: 52rpx; font-weight: 700; }
.stat-label { font-size: 24rpx; color: $text-muted; margin-top: 8rpx; display: block; }
.stat-divider { width: 1rpx; background: $border-light; height: 60rpx; }
.section-title { padding: 24rpx 32rpx 12rpx; font-size: 32rpx; font-weight: 600; color: $text-main; }
.tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20rpx; padding: 0 24rpx; }
.tool-card { background: #FFFEF9; border-radius: 32rpx; padding: 28rpx 16rpx; text-align: center; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02); }
.tool-icon { width: 88rpx; height: 88rpx; border-radius: 44rpx; display: inline-flex; align-items: center; justify-content: center; font-size: 48rpx; margin-bottom: 20rpx; }
.tool-name { font-size: 28rpx; font-weight: 500; color: $text-main; }
.tool-desc { font-size: 22rpx; color: #B59A82; }
.music-card { background: $primary-card; backdrop-filter: blur(20px); border-radius: 40rpx; margin: 20rpx 24rpx; padding: 24rpx 28rpx; box-shadow: $card-shadow; }
.card-header { display: flex; justify-content: space-between; margin-bottom: 20rpx; }
.card-title { font-size: 30rpx; font-weight: 600; color: #7A624E; }
.card-more { font-size: 24rpx; color: #C5A992; }
.todo-item, .expiry-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid $border-light; }
.todo-dot { width: 12rpx; height: 12rpx; border-radius: 12rpx; margin-right: 20rpx; }
.todo-text { flex: 1; font-size: 28rpx; color: $text-main; }
.todo-date, .expiry-tag { font-size: 24rpx; color: $text-muted; }
.footer-note { text-align: center; font-size: 24rpx; color: #CBB9AB; margin: 40rpx 0; }
</style>