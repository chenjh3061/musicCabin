<template>
  <view class="page">
    <view class="music-hero">
      <text class="hero-icon">⏳</text>
      <text class="hero-title">纪念日</text>
      <text class="hero-sub">重要日子 · 温暖回忆</text>
    </view>

    <view class="music-card">
      <view class="card-header">
        <text class="card-title">📅 我的纪念日</text>
        <text class="add-btn" @click="addEvent">+ 添加</text>
      </view>
      <view v-for="ev in events" :key="ev.id" class="event-item">
        <view class="event-info">
          <text class="event-name">{{ ev.name }}</text>
          <text class="event-date">{{ ev.date }}</text>
        </view>
        <view class="event-days">
          <text class="days-num">{{ ev.daysRemaining }}</text>
          <text class="days-label">天</text>
        </view>
        <text class="del-icon" @click="deleteEvent(ev.id)">🗑️</text>
      </view>
      <view v-if="events.length === 0" class="empty-tip">
        暂无纪念日，点击 + 添加
      </view>
    </view>

    <view class="music-footer">♫ 每一个日子都值得期待 ♫</view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const events = ref([])

function loadData() {
  const stored = uni.getStorageSync('countdownData')
  if (stored) {
    events.value = stored.events || []
  } else {
    events.value = [
      { id: '1', name: '新年', date: '2026-01-01' },
      { id: '2', name: '生日', date: '2025-12-25' }
    ]
    saveData()
  }
  computeDays()
}

function saveData() {
  uni.setStorageSync('countdownData', { events: events.value })
}

function computeDays() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  events.value.forEach(ev => {
    const target = new Date(ev.date)
    target.setHours(0, 0, 0, 0)
    const diff = Math.ceil((target - today) / (1000 * 3600 * 24))
    ev.daysRemaining = diff >= 0 ? diff : `已过${-diff}`
  })
}

function addEvent() {
  uni.showModal({
    title: '添加纪念日',
    editable: true,
    placeholderText: '例如：结婚纪念日',
    success(res) {
      if (res.confirm && res.content) {
        uni.showModal({
          title: '日期',
          editable: true,
          placeholderText: 'YYYY-MM-DD',
          success(res2) {
            if (res2.confirm && res2.content) {
              events.value.push({
                id: Date.now().toString(),
                name: res.content,
                date: res2.content
              })
              computeDays()
              saveData()
            }
          }
        })
      }
    }
  })
}

function deleteEvent(id) {
  events.value = events.value.filter(e => e.id !== id)
  saveData()
}

onMounted(() => { loadData() })
</script>

<style scoped>
.page { min-height: 100vh; background: #EDF4FB; padding-bottom: 60rpx; }

.music-hero {
  background: linear-gradient(145deg, #3A7FD5 0%, #29ACAB 100%);
  padding: 60rpx 32rpx 50rpx; text-align: center;
  border-radius: 0 0 56rpx 56rpx;
  box-shadow: 0 10rpx 36rpx rgba(42,100,180,0.18);
}
.hero-icon { font-size: 64rpx; display: block; margin-bottom: 12rpx; }
.hero-title { font-size: 44rpx; font-weight: 700; color: #fff; letter-spacing: 4rpx; display: block; }
.hero-sub { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 8rpx; display: block; }

.music-card {
  background: #fff; border-radius: 32rpx; margin: 20rpx 24rpx;
  padding: 28rpx; box-shadow: 0 4rpx 20rpx rgba(74,144,217,0.08);
  border: 1rpx solid #D6E9F7;
}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.card-title { font-size: 30rpx; font-weight: 700; color: #1E3A5C; }
.add-btn { font-size: 26rpx; color: #4A90D9; background: #E3F2FC; padding: 6rpx 20rpx; border-radius: 60rpx; }

.event-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22rpx 0; border-bottom: 1rpx solid #EEF4FA;
}
.event-info { flex: 1; }
.event-name { font-size: 30rpx; font-weight: 600; color: #1E3A5C; display: block; }
.event-date { font-size: 24rpx; color: #8FAEC8; margin-top: 4rpx; display: block; }
.event-days { display: flex; align-items: baseline; gap: 4rpx; margin: 0 20rpx; }
.days-num { font-size: 40rpx; font-weight: 700; color: #4A90D9; }
.days-label { font-size: 24rpx; color: #8FAEC8; }
.del-icon { font-size: 40rpx; color: #B8D4EC; padding: 8rpx; }
.empty-tip { text-align: center; color: #8FAEC8; padding: 60rpx 0; font-size: 26rpx; }
.music-footer { text-align: center; font-size: 24rpx; color: #B8D4EC; margin: 36rpx 0 60rpx; letter-spacing: 2rpx; }
</style>