<template>
  <view class="page">
    <!-- 用户信息区 -->
    <view class="profile-card">
      <view class="avatar-wrap">
        <image class="avatar" src="/static/logo.png" mode="aspectFill" />
      </view>
      <view class="profile-info">
        <text class="nickname">我的工具箱</text>
        <text class="sub-text">个人效率管理助手</text>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-num">{{ stats.todoTotal }}</text>
        <text class="stat-label">待办总数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num" style="color: #27ae60;">{{ stats.todoDone }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num" style="color: #f39c12;">{{ stats.eventTotal }}</text>
        <text class="stat-label">日历事件</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num" style="color: #9b59b6;">{{ stats.itemTotal }}</text>
        <text class="stat-label">物品记录</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-title">工具导航</view>
      <view class="menu-card">
        <view
          v-for="item in menuItems"
          :key="item.id"
          class="menu-item"
          @click="navTo(item.path)"
        >
          <view class="menu-icon" :style="{ background: item.bg }">
            <text>{{ item.icon }}</text>
          </view>
          <view class="menu-text-wrap">
            <text class="menu-name">{{ item.name }}</text>
            <text class="menu-desc">{{ item.desc }}</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 关于 / 帮助 -->
    <view class="menu-section">
      <view class="menu-title">关于</view>
      <view class="menu-card">
        <view class="menu-item" @click="showAbout">
          <view class="menu-icon" style="background:#f0f4f8">
            <text>ℹ️</text>
          </view>
          <view class="menu-text-wrap">
            <text class="menu-name">关于应用</text>
            <text class="menu-desc">版本 1.0.0 · 个人工具箱</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="clearCache">
          <view class="menu-icon" style="background:#fff3e0">
            <text>🗑️</text>
          </view>
          <view class="menu-text-wrap">
            <text class="menu-name">清除本地缓存</text>
            <text class="menu-desc">保留云端数据，清除本地缓存</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 云开发状态提示 -->
    <view class="cloud-tip">
      <text class="cloud-tip-text">
        💡 数据存储于微信云开发（免费额度）。如未配置云环境，数据将保存在本地。
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getDocs, COLLECTIONS } from '../../utils/db.js'
import { showToast, showConfirm } from '../../utils/helper.js'

const stats = ref({
  todoTotal: 0,
  todoDone: 0,
  eventTotal: 0,
  itemTotal: 0
})

const menuItems = [
  { id: 'todo', name: '待办事项', desc: '管理你的任务清单', icon: '✅', bg: '#eaf4fe', path: '/pages/todo/todo' },
  { id: 'cal', name: '日历提醒', desc: '查看日程安排', icon: '📅', bg: '#fef6e4', path: '/pages/calendar/calendar' },
  { id: 'items', name: '物品管理', desc: '过期提醒与物品位置', icon: '📦', bg: '#e8faf0', path: '/pages/items/items' },
  { id: 'val', name: '贵重物品', desc: '快速找到重要物品', icon: '💎', bg: '#fde9f4', path: '/pages/items/items?tab=valuable' }
]

async function loadStats() {
  const [t, e, i] = await Promise.all([
    getDocs(COLLECTIONS.TODO),
    getDocs(COLLECTIONS.EVENT),
    getDocs(COLLECTIONS.ITEM)
  ])
  const todos = t.data || []
  stats.value = {
    todoTotal: todos.length,
    todoDone: todos.filter(x => x.done).length,
    eventTotal: (e.data || []).length,
    itemTotal: (i.data || []).length
  }
}

onShow(() => { loadStats() })

function navTo(path) {
  uni.switchTab({ url: path, fail: () => uni.navigateTo({ url: path }) })
}

function showAbout() {
  uni.showModal({
    title: '个人工具箱',
    content: '版本 1.0.0\n\n功能：待办事项 · 日历提醒 · 物品管理\n\n数据存储于微信云开发免费环境',
    showCancel: false
  })
}

async function clearCache() {
  const ok = await showConfirm('确认清除本地缓存？云端数据不受影响。')
  if (!ok) return
  try {
    const keys = [`cache_${COLLECTIONS.TODO}`, `cache_${COLLECTIONS.EVENT}`, `cache_${COLLECTIONS.ITEM}`]
    keys.forEach(k => uni.removeStorageSync(k))
    showToast('缓存已清除')
  } catch (e) {
    showToast('清除失败')
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f2f6fc;
  padding-bottom: 40rpx;
}

/* 头像信息卡 */
.profile-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #4A90D9 0%, #357abf 100%);
  padding: 60rpx 40rpx 40rpx;
}
.avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255,255,255,0.2);
  margin-right: 28rpx;
  border: 4rpx solid rgba(255,255,255,0.4);
}
.avatar { width: 100%; height: 100%; }
.profile-info { flex: 1; }
.nickname {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
}
.sub-text { font-size: 24rpx; color: rgba(255,255,255,0.8); }

/* 统计卡 */
.stats-card {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  margin: -20rpx 24rpx 0;
  box-shadow: 0 4rpx 24rpx rgba(74,144,217,0.15);
  padding: 32rpx 0;
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 48rpx;
  font-weight: 700;
  color: #4A90D9;
  line-height: 1;
}
.stat-label {
  font-size: 22rpx;
  color: #8a9bb0;
  margin-top: 8rpx;
}
.stat-divider {
  width: 1rpx;
  background: #eef2f7;
  margin: 8rpx 0;
}

/* 菜单 */
.menu-section { margin-top: 36rpx; padding: 0 24rpx; }
.menu-title {
  font-size: 26rpx;
  color: #8a9bb0;
  font-weight: 500;
  margin-bottom: 12rpx;
  padding-left: 4rpx;
}
.menu-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 28rpx;
  border-bottom: 1rpx solid #f5f8fc;
}
.menu-item:last-child { border-bottom: none; }
.menu-icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}
.menu-text-wrap { flex: 1; }
.menu-name { display: block; font-size: 30rpx; color: #2c3e50; font-weight: 500; margin-bottom: 4rpx; }
.menu-desc { display: block; font-size: 24rpx; color: #b0bec5; }
.menu-arrow { font-size: 36rpx; color: #d0d8e4; }

/* 云开发提示 */
.cloud-tip {
  margin: 32rpx 24rpx 0;
  background: #eaf4fe;
  border-radius: 16rpx;
  padding: 24rpx;
}
.cloud-tip-text { font-size: 24rpx; color: #4A90D9; line-height: 1.7; }
</style>
