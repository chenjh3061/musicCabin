<template>
  <view class="calendar-page">
    <!-- 顶部装饰 -->
    <view class="hero-section">
      <text class="hero-icon">🎹</text>
      <text class="hero-title">音乐日历</text>
      <text class="hero-sub">待办 · 物品 · 纪念日</text>
    </view>

    <!-- 月份导航 -->
    <view class="month-nav">
      <view class="nav-btn" @click="changeMonth(-1)">‹</view>
      <text class="month-title">{{ year }}年{{ month }}月</text>
      <view class="nav-btn" @click="changeMonth(1)">›</view>
      <text class="today-btn" @click="goToday">今天</text>
    </view>

    <!-- 星期标题 -->
    <view class="weekday-row">
      <view
        v-for="(w, i) in weekdays"
        :key="i"
        class="weekday-cell"
        :class="{ weekend: i === 0 || i === 6 }"
      >{{ w }}</view>
    </view>

    <!-- 日历网格（42格） -->
    <view class="calendar-grid">
      <view
        v-for="(day, idx) in calDays"
        :key="idx"
        class="day-cell"
        :class="{
          'other-month': !day.curMonth,
          today: day.isToday,
          selected: day.dateStr === selectedDate
        }"
        @click="selectDay(day)"
      >
        <text class="day-num">{{ day.dayNum }}</text>
        <!-- 事件圆点（最多显示3个） -->
        <view class="dot-row">
          <view
            v-for="(ev, ei) in (eventMap[day.dateStr] || []).slice(0, 3)"
            :key="ei"
            class="event-dot"
            :style="{ background: ev.color || '#4A90D9' }"
          ></view>
        </view>
      </view>
    </view>

    <!-- 选中日期的事件列表 -->
    <view class="event-section">
      <view class="event-section-header">
        <text class="event-section-date">{{ selectedDateLabel }}</text>
        <text class="event-add-btn" @click="addEvent">+ 添加事件</text>
      </view>

      <view v-if="selectedEvents.length === 0" class="event-empty">
        <text>🎵 这一天没有安排，安静地休息吧</text>
      </view>

      <view
        v-for="ev in selectedEvents"
        :key="ev._id"
        class="event-item"
        :style="{ borderLeftColor: ev.color || '#4A90D9' }"
        @click="editEvent(ev)"
      >
        <view class="event-left">
          <text class="event-time" v-if="ev.time">{{ ev.time }}</text>
          <text class="event-title">{{ ev.title }}</text>
          <text class="event-desc" v-if="ev.desc">{{ ev.desc }}</text>
        </view>
        <view class="event-actions">
          <text class="event-del" @click.stop="deleteEvent(ev)">×</text>
        </view>
      </view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="fab" @click="addEvent">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getDocs, deleteDoc, COLLECTIONS } from '../../utils/db.js'
import { formatDate, getDaysInMonth, getFirstDayOfWeek, showToast, showConfirm } from '../../utils/helper.js'

// 星期
const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const todayStr = formatDate(null, 'YYYY-MM-DD')
const selectedDate = ref(todayStr)

// 事件列表（从数据库加载）
const allEvents = ref([])

// 按日期分组的事件映射
const eventMap = computed(() => {
  const map = {}
  allEvents.value.forEach(ev => {
    if (ev.date) {
      const d = ev.date.slice(0, 10)
      if (!map[d]) map[d] = []
      map[d].push(ev)
    }
  })
  return map
})

// 选中日期的事件（排序）
const selectedEvents = computed(() => {
  const events = eventMap.value[selectedDate.value] || []
  return [...events].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))
})

// 选中日期的显示文字
const selectedDateLabel = computed(() => {
  const d = new Date(selectedDate.value + 'T00:00:00')
  const labels = ['日', '一', '二', '三', '四', '五', '六']
  return `${formatDate(d, 'MM月DD日')} 周${labels[d.getDay()]}`
})

// 生成日历网格（42格）
const calDays = computed(() => {
  const days = []
  const total = getDaysInMonth(year.value, month.value)
  const firstDay = getFirstDayOfWeek(year.value, month.value)

  // 上月补全
  const prevTotal = getDaysInMonth(year.value, month.value - 1 || 12)
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevTotal - i
    const m = month.value - 1 === 0 ? 12 : month.value - 1
    const y = month.value - 1 === 0 ? year.value - 1 : year.value
    days.push({
      dayNum: d,
      curMonth: false,
      isToday: false,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    })
  }

  // 本月
  for (let d = 1; d <= total; d++) {
    const dateStr = `${year.value}-${String(month.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      dayNum: d,
      curMonth: true,
      isToday: dateStr === todayStr,
      dateStr
    })
  }

  // 下月补全至42格
  const remain = 42 - days.length
  for (let d = 1; d <= remain; d++) {
    const m = month.value + 1 === 13 ? 1 : month.value + 1
    const y = month.value + 1 === 13 ? year.value + 1 : year.value
    days.push({
      dayNum: d,
      curMonth: false,
      isToday: false,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    })
  }

  return days
})

// 加载事件数据
async function loadEvents() {
  const res = await getDocs(COLLECTIONS.EVENT)
  if (res.success) allEvents.value = res.data || []
}

// 月份切换
function changeMonth(delta) {
  let m = month.value + delta
  let y = year.value
  if (m > 12) { m = 1; y++ }
  if (m < 1) { m = 12; y-- }
  year.value = y
  month.value = m
}

// 返回今天
function goToday() {
  const n = new Date()
  year.value = n.getFullYear()
  month.value = n.getMonth() + 1
  selectedDate.value = todayStr
}

// 点击日期
function selectDay(day) {
  selectedDate.value = day.dateStr
  // 如果点击的是非当月日期，自动切换月份
  if (!day.curMonth) {
    const parts = day.dateStr.split('-')
    year.value = parseInt(parts[0])
    month.value = parseInt(parts[1])
  }
}

// 添加事件
function addEvent() {
  uni.navigateTo({
    url: `/pages/calendar/eventEdit?date=${selectedDate.value}`
  })
}

// 编辑事件
function editEvent(ev) {
  uni.navigateTo({
    url: `/pages/calendar/eventEdit?id=${ev._id}&date=${ev.date}`
  })
}

// 删除事件
async function deleteEvent(ev) {
  const ok = await showConfirm(`删除「${ev.title}」？`)
  if (!ok) return
  const res = await deleteDoc(COLLECTIONS.EVENT, ev._id)
  if (res.success) {
    allEvents.value = allEvents.value.filter(e => e._id !== ev._id)
    showToast('已删除')
  } else {
    showToast('删除失败')
  }
}

onShow(() => {
  loadEvents()
})
</script>

<style scoped>
/* ===== 日历页 · 蓝绿音乐风格 ===== */
.calendar-page {
  min-height: 100vh;
  background: #EDF4FB;
  padding-bottom: 140rpx;
}

/* 顶部 Hero */
.hero-section {
  background: linear-gradient(145deg, #3A7FD5 0%, #29ACAB 100%);
  padding: 50rpx 32rpx 44rpx;
  text-align: center;
  border-radius: 0 0 56rpx 56rpx;
  box-shadow: 0 10rpx 36rpx rgba(42,100,180,0.18);
}
.hero-icon { font-size: 60rpx; display: block; margin-bottom: 10rpx; }
.hero-title { font-size: 42rpx; font-weight: 700; color: #fff; letter-spacing: 3rpx; }
.hero-sub { font-size: 24rpx; color: rgba(255,255,255,0.78); margin-top: 8rpx; }

/* 月份导航 */
.month-nav {
  display: flex; align-items: center;
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 60rpx; padding: 16rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(74,144,217,0.08);
  border: 1rpx solid #D6E9F7;
}
.nav-btn { font-size: 52rpx; font-weight: 500; color: #8FAEC8; padding: 0 16rpx; line-height: 1; }
.month-title { flex: 1; text-align: center; font-size: 34rpx; font-weight: 700; color: #1E3A5C; }
.today-btn {
  font-size: 24rpx; color: #4A90D9;
  background: #E3F2FC; padding: 8rpx 24rpx; border-radius: 60rpx;
}

/* 星期行 */
.weekday-row {
  display: grid; grid-template-columns: repeat(7, 1fr);
  background: #fff;
  margin: 8rpx 24rpx; border-radius: 24rpx; padding: 16rpx 0;
  border: 1rpx solid #E3F2FC;
}
.weekday-cell { text-align: center; font-size: 26rpx; color: #5A7A9A; }
.weekday-cell.weekend { color: #E05C5C; }

/* 日历网格 */
.calendar-grid {
  display: grid; grid-template-columns: repeat(7, 1fr);
  background: rgba(255,255,255,0.95);
  margin: 10rpx 24rpx; border-radius: 32rpx; padding: 14rpx 8rpx;
  box-shadow: 0 4rpx 20rpx rgba(74,144,217,0.08);
  border: 1rpx solid #D6E9F7;
}
.day-cell {
  display: flex; flex-direction: column; align-items: center;
  padding: 10rpx 0; border-radius: 20rpx; transition: all 0.15s;
}
.day-cell:active { background: #EEF4FA; }
.day-num {
  font-size: 28rpx; color: #1E3A5C;
  width: 56rpx; height: 56rpx; line-height: 56rpx; text-align: center; border-radius: 50%;
}
.other-month .day-num { color: #B8D4EC; }
.today .day-num {
  background: linear-gradient(135deg, #4A90D9, #3ABFBF);
  color: #fff; font-weight: 700;
}
.selected .day-num {
  background: #E3F2FC; color: #2F72C0; font-weight: 700;
  box-shadow: 0 0 0 2rpx #6EB3F0;
}
.dot-row { display: flex; gap: 5rpx; margin-top: 4rpx; min-height: 12rpx; }
.event-dot { width: 10rpx; height: 10rpx; border-radius: 50%; }

/* 事件列表区 */
.event-section { margin: 20rpx 24rpx 40rpx; }
.event-section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 18rpx; padding: 0 4rpx;
}
.event-section-date { font-size: 30rpx; font-weight: 700; color: #1E3A5C; }
.event-add-btn {
  font-size: 24rpx; color: #4A90D9;
  background: #E3F2FC; padding: 8rpx 24rpx; border-radius: 60rpx;
}
.event-empty {
  text-align: center; padding: 60rpx 0;
  color: #8FAEC8; font-size: 28rpx;
  background: rgba(255,255,255,0.8);
  border-radius: 40rpx;
}

/* 事件卡片 */
.event-item {
  display: flex; align-items: center;
  background: #fff; border-radius: 24rpx;
  padding: 24rpx 28rpx; margin-bottom: 16rpx;
  border-left: 8rpx solid #4A90D9;
  box-shadow: 0 3rpx 14rpx rgba(74,144,217,0.08);
}
.event-left { flex: 1; min-width: 0; }
.event-time { display: block; font-size: 24rpx; color: #8FAEC8; margin-bottom: 8rpx; }
.event-title { display: block; font-size: 30rpx; font-weight: 600; color: #1E3A5C; }
.event-desc { display: block; font-size: 24rpx; color: #8FAEC8; margin-top: 8rpx; }
.event-actions { display: flex; align-items: center; }
.event-del { font-size: 48rpx; color: #B8D4EC; padding: 0 12rpx; line-height: 1; }

/* FAB */
.fab {
  position: fixed; right: 40rpx; bottom: 160rpx;
  width: 100rpx; height: 100rpx; border-radius: 50%;
  background: linear-gradient(135deg, #4A90D9, #3ABFBF);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(74,144,217,0.38); z-index: 100;
}
.fab-icon { font-size: 64rpx; color: #fff; line-height: 1; margin-top: -4rpx; }
</style>