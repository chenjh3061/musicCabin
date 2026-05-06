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

.event-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #E4E9F2;
}
.event-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #2C3E50;
}
.event-date {
  font-size: 24rpx;
  color: #95A5A6;
  margin-left: 16rpx;
}
.event-days {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}
.days-num {
  font-size: 36rpx;
  font-weight: 700;
  color: #5D9BEC;
}
.days-label {
  font-size: 24rpx;
  color: #95A5A6;
}
.del-icon {
  font-size: 40rpx;
  color: #E74C3C;
  padding: 8rpx;
  margin-left: 20rpx;
}
.empty-tip {
  text-align: center;
  color: #95A5A6;
  padding: 60rpx 0;
}
</style>