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
        <switch :checked="dailyReminder" @change="toggleDailyReminder" color="#4A90D9" />
      </view>
      <view class="setting-row">
        <text>物品过期提醒</text>
        <switch :checked="expiryReminder" @change="toggleExpiryReminder" color="#4A90D9" />
      </view>
      <view class="setting-row">
        <text>纪念日提醒</text>
        <switch :checked="countdownReminder" @change="toggleCountdownReminder" color="#4A90D9" />
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
.music-settings { background: #EDF4FB; min-height: 100vh; padding-bottom: 80rpx; }

.settings-header {
  background: linear-gradient(145deg, #3A7FD5 0%, #29ACAB 100%);
  padding: 60rpx 0 50rpx; text-align: center;
  border-radius: 0 0 56rpx 56rpx;
  box-shadow: 0 10rpx 36rpx rgba(42,100,180,0.18);
}
.header-icon { font-size: 60rpx; display: block; }
.header-title { font-size: 44rpx; font-weight: 700; color: #fff; margin: 10rpx 0; display: block; letter-spacing: 2rpx; }
.header-sub { font-size: 24rpx; color: rgba(255,255,255,0.78); display: block; }

.card {
  background: #fff; border-radius: 32rpx; margin: 20rpx 24rpx; padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(74,144,217,0.08); border: 1rpx solid #D6E9F7;
}
.card-title { font-size: 30rpx; font-weight: 700; color: #1E3A5C; margin-bottom: 22rpx; display: block; }
.setting-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20rpx 0; border-bottom: 1rpx solid #EEF4FA; font-size: 28rpx; color: #1E3A5C;
}
.soft-btn {
  background: linear-gradient(135deg, #4A90D9, #3ABFBF);
  color: #fff; border-radius: 60rpx; font-size: 26rpx; padding: 10rpx 28rpx;
  margin: 0; border: none;
}
.tip { font-size: 22rpx; color: #8FAEC8; margin-top: 20rpx; }
.request-btn {
  background: linear-gradient(135deg, #4A90D9, #3ABFBF); color: #fff;
  border-radius: 60rpx; margin-top: 24rpx; width: 65%;
  margin-left: auto; margin-right: auto; border: none; display: block;
}
.about { text-align: center; }
.about-text { font-size: 26rpx; color: #5A7A9A; line-height: 1.8; }
</style>