<template>
  <view class="music-settings">
    <view class="settings-header">
      <text class="header-icon">🎛️</text>
      <text class="header-title">调音台</text>
      <text class="header-sub">数据 · 提醒 · 偏好</text>
    </view>

    <view class="card">
      <view class="card-title">💾 数据备份</view>
      <view class="setting-row">
        <text>导出音乐日记</text>
        <button class="soft-btn" @click="exportData">导出JSON</button>
      </view>
      <view class="setting-row">
        <text>导入备份</text>
        <button class="soft-btn" @click="importData">选择文件</button>
      </view>
      <view class="tip">提示：导入会覆盖当前所有数据，建议先导出</view>
    </view>

    <view class="card">
      <view class="card-title">🔔 提醒旋律</view>
      <view class="setting-row">
        <text>每日晨间汇总</text>
        <switch :checked="dailyReminder" @change="toggleDailyReminder" color="#D6B8A8" />
      </view>
      <view class="setting-row">
        <text>物品过期提醒</text>
        <switch :checked="expiryReminder" @change="toggleExpiryReminder" color="#D6B8A8" />
      </view>
      <view class="setting-row">
        <text>纪念日提醒</text>
        <switch :checked="countdownReminder" @change="toggleCountdownReminder" color="#D6B8A8" />
      </view>
      <button class="request-btn" @click="requestSubscribe">请求通知授权</button>
      <view class="tip">注：订阅消息需小程序模板ID，此处为UI示意</view>
    </view>

    <view class="card about">
      <view class="card-title">🎵 关于音悦厅</view>
      <text class="about-text">这个小工具伴随你的每一段日常旋律。版本 1.0.0 · 献给爱音乐的你</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const dailyReminder = ref(false)
const expiryReminder = ref(false)
const countdownReminder = ref(false)

function loadSettings() {
  const s = uni.getStorageSync('reminderSettings')
  if(s) {
    dailyReminder.value = s.dailyReminder
    expiryReminder.value = s.expiryReminder
    countdownReminder.value = s.countdownReminder
  }
}
function saveSettings() {
  uni.setStorageSync('reminderSettings', { dailyReminder: dailyReminder.value, expiryReminder: expiryReminder.value, countdownReminder: countdownReminder.value })
}
function toggleDailyReminder(e) { dailyReminder.value = e.detail.value; saveSettings() }
function toggleExpiryReminder(e) { expiryReminder.value = e.detail.value; saveSettings() }
function toggleCountdownReminder(e) { countdownReminder.value = e.detail.value; saveSettings() }

function exportData() {
  const all = {
    todoList: uni.getStorageSync('todoList'),
    itemsData: uni.getStorageSync('itemsData'),
    countdownData: uni.getStorageSync('countdownData'),
    dailyCheckinData: uni.getStorageSync('dailyCheckinData'),
    mealOptions: uni.getStorageSync('mealOptions')
  }
  const str = JSON.stringify(all)
  const filePath = `${wx.env.USER_DATA_PATH}/backup_${Date.now()}.json`
  wx.getFileSystemManager().writeFileSync(filePath, str, 'utf8')
  wx.shareFileMessage({ filePath, success:()=>uni.showToast({title:'导出成功'}) })
}
function importData() {
  wx.chooseMessageFile({ count:1, type:'file', extension:['json'], success(res){
    const fs = wx.getFileSystemManager()
    fs.readFile({ filePath: res.tempFiles[0].path, encoding:'utf8', success(res2){
      try {
        const d = JSON.parse(res2.data)
        if(d.todoList) uni.setStorageSync('todoList', d.todoList)
        if(d.itemsData) uni.setStorageSync('itemsData', d.itemsData)
        if(d.countdownData) uni.setStorageSync('countdownData', d.countdownData)
        if(d.dailyCheckinData) uni.setStorageSync('dailyCheckinData', d.dailyCheckinData)
        if(d.mealOptions) uni.setStorageSync('mealOptions', d.mealOptions)
        uni.showToast({title:'导入成功，重启生效'})
      }catch(e){ uni.showToast({title:'文件解析失败',icon:'none'}) }
    } })
  } })
}
function requestSubscribe() {
  uni.showModal({ title:'通知授权', content:'此功能需配置模板ID，请联系开发者完成', showCancel:false })
}
onMounted(loadSettings)
</script>

<style scoped>
.music-settings { background: #FDF9F5; padding-bottom: 80rpx; }
.settings-header {
  background: linear-gradient(135deg, #E5D5C0, #DAC6B0);
  padding: 60rpx 0 50rpx;
  text-align: center;
  border-radius: 0 0 48rpx 48rpx;
}
.header-icon { font-size: 60rpx; display: block; }
.header-title { font-size: 44rpx; font-weight: 600; color: #5F4C3A; margin: 8rpx 0; }
.header-sub { font-size: 24rpx; color: #8F735C; }
.card {
  background: rgba(255,252,248,0.95);
  backdrop-filter: blur(12px);
  border-radius: 48rpx;
  margin: 24rpx;
  padding: 32rpx;
}
.card-title { font-size: 32rpx; font-weight: 500; color: #7A624E; margin-bottom: 28rpx; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #F0E4D8; }
.soft-btn { background: #EADBC6; border-radius: 60rpx; font-size: 26rpx; padding: 10rpx 28rpx; margin: 0; }
.tip { font-size: 22rpx; color: #CBB9AB; margin-top: 24rpx; }
.request-btn { background: #D6B8A8; color: white; border-radius: 60rpx; margin-top: 24rpx; width: 60%; margin-left: auto; margin-right: auto; }
.about { text-align: center; }
.about-text { font-size: 26rpx; color: #A28872; line-height: 1.5; }
</style>