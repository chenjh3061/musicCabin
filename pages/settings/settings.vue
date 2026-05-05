<template>
  <view class="page">
    <view class="header">
      <view class="header-left"><text class="greeting">设置</text><text class="date-text">数据备份 · 提醒管理</text></view>
      <view class="header-right"><text class="app-title">工具箱</text></view>
    </view>

    <!-- 数据备份与恢复 -->
    <view class="card">
      <view class="card-title">💾 数据备份与恢复</view>
      <view class="setting-item">
        <text class="label">导出数据（JSON）</text>
        <button class="small-btn" @click="exportData">导出</button>
      </view>
      <view class="setting-item">
        <text class="label">导入数据（覆盖当前）</text>
        <button class="small-btn" @click="importData">选择文件导入</button>
      </view>
      <view class="tip">注：导入会覆盖现有所有数据，请谨慎操作</view>
    </view>

    <!-- 订阅消息设置（模拟/演示） -->
    <view class="card">
      <view class="card-title">🔔 消息提醒设置</view>
      <view class="setting-item">
        <text class="label">开启每日汇总提醒</text>
        <switch :checked="dailyReminder" @change="toggleDailyReminder" color="#4A90D9" />
      </view>
      <view class="setting-item">
        <text class="label">开启物品过期提前提醒</text>
        <switch :checked="expiryReminder" @change="toggleExpiryReminder" color="#4A90D9" />
      </view>
      <view class="setting-item">
        <text class="label">开启纪念日当天提醒</text>
        <switch :checked="countdownReminder" @change="toggleCountdownReminder" color="#4A90D9" />
      </view>
      <button class="request-sub-btn" @click="requestSubscribe">请求订阅消息授权</button>
      <view class="tip">注意：小程序订阅消息需要模板ID，此处仅为演示UI。实际使用请替换真实模板ID。</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 提醒开关状态（存储到本地）
const dailyReminder = ref(false)
const expiryReminder = ref(false)
const countdownReminder = ref(false)

function loadSettings() {
  const settings = uni.getStorageSync('reminderSettings')
  if (settings) {
    dailyReminder.value = settings.dailyReminder || false
    expiryReminder.value = settings.expiryReminder || false
    countdownReminder.value = settings.countdownReminder || false
  }
}
function saveSettings() {
  uni.setStorageSync('reminderSettings', {
    dailyReminder: dailyReminder.value,
    expiryReminder: expiryReminder.value,
    countdownReminder: countdownReminder.value
  })
}
function toggleDailyReminder(e) { dailyReminder.value = e.detail.value; saveSettings() }
function toggleExpiryReminder(e) { expiryReminder.value = e.detail.value; saveSettings() }
function toggleCountdownReminder(e) { countdownReminder.value = e.detail.value; saveSettings() }

// 导出数据
function exportData() {
  const allData = {
    todoList: uni.getStorageSync('todoList') || {},
    itemsData: uni.getStorageSync('itemsData') || {},
    countdownData: uni.getStorageSync('countdownData') || {},
    dailyCheckinData: uni.getStorageSync('dailyCheckinData') || {},
    mealOptions: uni.getStorageSync('mealOptions') || '',
    wageCalData: uni.getStorageSync('wageCalData') || {},
    reminderSettings: uni.getStorageSync('reminderSettings') || {}
  }
  const jsonStr = JSON.stringify(allData, null, 2)
  // 保存为临时文件并分享
  const filePath = `${wx.env.USER_DATA_PATH}/backup_${Date.now()}.json`
  const fs = wx.getFileSystemManager()
  fs.writeFileSync(filePath, jsonStr, 'utf8')
  wx.shareFileMessage({
    filePath: filePath,
    success() { uni.showToast({ title: '导出成功' }) },
    fail() { uni.showToast({ title: '导出失败', icon: 'none' }) }
  })
}

// 导入数据
function importData() {
  wx.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['json'],
    success(res) {
      const file = res.tempFiles[0]
      const fs = wx.getFileSystemManager()
      fs.readFile({
        filePath: file.path,
        encoding: 'utf8',
        success(res) {
          try {
            const data = JSON.parse(res.data)
            // 逐个恢复
            if (data.todoList) uni.setStorageSync('todoList', data.todoList)
            if (data.itemsData) uni.setStorageSync('itemsData', data.itemsData)
            if (data.countdownData) uni.setStorageSync('countdownData', data.countdownData)
            if (data.dailyCheckinData) uni.setStorageSync('dailyCheckinData', data.dailyCheckinData)
            if (data.mealOptions) uni.setStorageSync('mealOptions', data.mealOptions)
            if (data.wageCalData) uni.setStorageSync('wageCalData', data.wageCalData)
            if (data.reminderSettings) uni.setStorageSync('reminderSettings', data.reminderSettings)
            uni.showToast({ title: '导入成功，请重启小程序生效', icon: 'none' })
          } catch (e) {
            uni.showToast({ title: '解析失败', icon: 'none' })
          }
        },
        fail() { uni.showToast({ title: '读取失败', icon: 'none' }) }
      })
    }
  })
}

// 请求订阅消息（演示）
function requestSubscribe() {
  // 这里需要填写真实的消息模板ID，否则会报错。演示时仅提示。
  uni.showModal({
    title: '订阅消息',
    content: '此功能需要配置模板ID。正式使用时请在小程序后台添加消息模板，并在代码中填入。',
    showCancel: false
  })
  // 真实调用：
  // uni.requestSubscribeMessage({
  //   tmplIds: ['你的模板ID'],
  //   success(res) { ... }
  // })
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.page { min-height: 100vh; background: #f2f6fc; padding-bottom: 80rpx; }
.header { display: flex; justify-content: space-between; align-items: flex-end; padding: 60rpx 32rpx 24rpx; background: linear-gradient(135deg, #4A90D9 0%, #357abf 100%); }
.greeting { font-size: 38rpx; font-weight: 600; color: #fff; }
.date-text { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 6rpx; }
.app-title { font-size: 28rpx; color: rgba(255,255,255,0.7); }
.card { background: #fff; border-radius: 24rpx; margin: 20rpx 24rpx; padding: 28rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04); }
.card-title { font-size: 30rpx; font-weight: 600; color: #2c3e50; margin-bottom: 24rpx; }
.setting-item { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #f0f4f8; }
.label { font-size: 28rpx; }
.small-btn { background: #eaf4fe; color: #4A90D9; border-radius: 40rpx; font-size: 26rpx; padding: 10rpx 28rpx; margin: 0; }
.tip { font-size: 24rpx; color: #8a9bb0; margin-top: 20rpx; }
.request-sub-btn { background: #4A90D9; color: #fff; border-radius: 48rpx; font-size: 28rpx; margin-top: 20rpx; }
</style>