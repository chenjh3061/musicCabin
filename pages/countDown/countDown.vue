<template>
  <view class="page">
    <view class="header">
      <view class="header-left">
        <text class="greeting">倒数日</text>
        <text class="date-text">记录重要日子</text>
      </view>
      <view class="header-right"><text class="app-title">纪念日</text></view>
    </view>

    <view class="card">
      <view class="card-title">
        📅 我的纪念日
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
      <view v-if="events.length === 0" class="empty-tip">暂无纪念日，点击 + 添加</view>
    </view>
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
      { id: '2', name: '生日', date: '2025-12-25' },
	  { id: '3', name: '动物园', date: '2022-06-05'}
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
  today.setHours(0,0,0,0)
  events.value.forEach(ev => {
    const target = new Date(ev.date)
    target.setHours(0,0,0,0)
    const diff = Math.ceil((target - today) / (1000*3600*24))
    ev.daysRemaining = diff >= 0 ? diff : `已过${-diff}天`
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
/* 必须包含这些基础样式 */
.page {
  min-height: 100vh;
  background: #f2f6fc;
  padding-bottom: 80rpx;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 60rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #4A90D9 0%, #357abf 100%);
}
.greeting {
  font-size: 38rpx;
  font-weight: 600;
  color: #fff;
}
.date-text {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 6rpx;
}
.app-title {
  font-size: 28rpx;
  color: rgba(255,255,255,0.7);
}
.card {
  background: #fff;
  border-radius: 24rpx;
  margin: 20rpx 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
}
.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.add-btn {
  font-size: 26rpx;
  color: #4A90D9;
  background: #eaf4fe;
  padding: 8rpx 20rpx;
  border-radius: 28rpx;
}
.empty-tip {
  text-align: center;
  color: #aab5c2;
  padding: 60rpx 0;
}
/* 事件项样式 */
.event-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f4f8;
}
.event-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #2c3e50;
}
.event-date {
  font-size: 24rpx;
  color: #8a9bb0;
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
  color: #e67e22;
}
.days-label {
  font-size: 24rpx;
  color: #8a9bb0;
}
.del-icon {
  font-size: 36rpx;
  color: #f29b9b;
  padding: 8rpx;
}
</style>