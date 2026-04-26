<template>
  <view class="page">
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

    <!-- 日历格 -->
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
        <text class="day-num">{{ day.date }}</text>
        <!-- 事件点 -->
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

    <!-- 选中日期事件列表 -->
    <view class="event-section">
      <view class="event-section-header">
        <text class="event-section-date">{{ selectedDateLabel }}</text>
        <text class="event-add-btn" @click="addEvent">+ 添加事件</text>
      </view>

      <view v-if="selectedEvents.length === 0" class="event-empty">
        <text>这天没有安排，尽情放松吧 ☀️</text>
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

    <!-- 悬浮新增 -->
    <view class="fab" @click="addEvent">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getDocs, deleteDoc, COLLECTIONS } from '../../utils/db.js'
import { formatDate, getDaysInMonth, getFirstDayOfWeek, showToast, showConfirm } from '../../utils/helper.js'

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const todayStr = formatDate(null, 'YYYY-MM-DD')
const selectedDate = ref(todayStr)
const allEvents = ref([])

// 事件按日期分组
const eventMap = computed(() => {
  const map = {}
  allEvents.value.forEach(ev => {
    const d = ev.date ? ev.date.slice(0, 10) : null
    if (d) {
      if (!map[d]) map[d] = []
      map[d].push(ev)
    }
  })
  return map
})

const selectedEvents = computed(() => {
  return (eventMap.value[selectedDate.value] || []).sort((a, b) => {
    return (a.time || '00:00').localeCompare(b.time || '00:00')
  })
})

const selectedDateLabel = computed(() => {
  const d = new Date(selectedDate.value + 'T00:00:00')
  const labels = ['日', '一', '二', '三', '四', '五', '六']
  return `${formatDate(d, 'MM月DD日')} 周${labels[d.getDay()]}`
})

// 生成当月日历
const calDays = computed(() => {
  const days = []
  const total = getDaysInMonth(year.value, month.value)
  const firstDay = getFirstDayOfWeek(year.value, month.value)

  // 上月末尾
  const prevTotal = getDaysInMonth(year.value, month.value - 1 || 12)
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevTotal - i
    const m = month.value - 1 === 0 ? 12 : month.value - 1
    const y = month.value - 1 === 0 ? year.value - 1 : year.value
    days.push({
      date: d,
      curMonth: false,
      isToday: false,
      dateStr: `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    })
  }

  // 本月
  for (let d = 1; d <= total; d++) {
    const dateStr = `${year.value}-${String(month.value).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    days.push({ date: d, curMonth: true, isToday: dateStr === todayStr, dateStr })
  }

  // 下月补齐到42格
  const remain = 42 - days.length
  for (let d = 1; d <= remain; d++) {
    const m = month.value + 1 === 13 ? 1 : month.value + 1
    const y = month.value + 1 === 13 ? year.value + 1 : year.value
    days.push({
      date: d,
      curMonth: false,
      isToday: false,
      dateStr: `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    })
  }

  return days
})

async function loadEvents() {
  const res = await getDocs(COLLECTIONS.EVENT)
  if (res.success) allEvents.value = res.data || []
}

onShow(() => { loadEvents() })

function changeMonth(delta) {
  let m = month.value + delta
  let y = year.value
  if (m > 12) { m = 1; y++ }
  if (m < 1) { m = 12; y-- }
  year.value = y
  month.value = m
}

function goToday() {
  const n = new Date()
  year.value = n.getFullYear()
  month.value = n.getMonth() + 1
  selectedDate.value = todayStr
}

function selectDay(day) {
  selectedDate.value = day.dateStr
  if (!day.curMonth) {
    const parts = day.dateStr.split('-')
    year.value = parseInt(parts[0])
    month.value = parseInt(parts[1])
  }
}

function addEvent() {
  uni.navigateTo({ url: `/pages/calendar/eventEdit?date=${selectedDate.value}` })
}

function editEvent(ev) {
  uni.navigateTo({ url: `/pages/calendar/eventEdit?id=${ev._id}&date=${ev.date}` })
}

async function deleteEvent(ev) {
  const ok = await showConfirm(`删除「${ev.title}」？`)
  if (!ok) return
  await deleteDoc(COLLECTIONS.EVENT, ev._id)
  allEvents.value = allEvents.value.filter(e => e._id !== ev._id)
  showToast('已删除')
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f2f6fc;
  padding-bottom: 140rpx;
}

/* 月份导航 */
.month-nav {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 24rpx 32rpx;
}
.nav-btn {
  font-size: 44rpx;
  color: #4A90D9;
  padding: 0 20rpx;
  line-height: 1;
}
.month-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #2c3e50;
}
.today-btn {
  font-size: 26rpx;
  color: #4A90D9;
  padding: 8rpx 20rpx;
  border: 1rpx solid #4A90D9;
  border-radius: 20rpx;
}

/* 星期标题 */
.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #fff;
  padding: 0 8rpx 12rpx;
}
.weekday-cell {
  text-align: center;
  font-size: 22rpx;
  color: #8a9bb0;
  padding: 4rpx 0;
}
.weekday-cell.weekend { color: #e74c3c; }

/* 日历格 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #fff;
  padding: 0 8rpx 16rpx;
  border-bottom: 1rpx solid #eef2f7;
}
.day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 0;
  border-radius: 12rpx;
  min-height: 80rpx;
  position: relative;
}
.day-cell:active { background: #f0f6ff; }
.day-cell.other-month .day-num { color: #d0d8e4; }
.day-cell.today .day-num {
  background: #4A90D9;
  color: #fff;
  border-radius: 50%;
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.day-cell.selected:not(.today) .day-num {
  background: #eaf4fe;
  color: #4A90D9;
  border-radius: 50%;
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.day-num {
  font-size: 26rpx;
  color: #2c3e50;
  line-height: 44rpx;
  width: 44rpx;
  text-align: center;
}
.dot-row {
  display: flex;
  gap: 4rpx;
  margin-top: 4rpx;
  min-height: 10rpx;
}
.event-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
}

/* 事件区 */
.event-section {
  padding: 24rpx;
}
.event-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.event-section-date {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c3e50;
}
.event-add-btn {
  font-size: 26rpx;
  color: #4A90D9;
}

.event-empty {
  text-align: center;
  padding: 60rpx 0;
  color: #b0bec5;
  font-size: 26rpx;
}

.event-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
  border-left: 6rpx solid #4A90D9;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
}
.event-left {
  flex: 1;
  min-width: 0;
}
.event-time {
  display: block;
  font-size: 22rpx;
  color: #8a9bb0;
  margin-bottom: 6rpx;
}
.event-title {
  display: block;
  font-size: 30rpx;
  color: #2c3e50;
  font-weight: 500;
}
.event-desc {
  display: block;
  font-size: 24rpx;
  color: #8a9bb0;
  margin-top: 6rpx;
}
.event-actions {
  display: flex;
  align-items: center;
}
.event-del {
  font-size: 40rpx;
  color: #c0ccd8;
  padding: 0 8rpx;
  line-height: 1;
}

/* fab */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 160rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #4A90D9;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(74,144,217,0.4);
  z-index: 100;
}
.fab-icon {
  font-size: 60rpx;
  color: #fff;
  line-height: 1;
  margin-top: -4rpx;
}
</style>
