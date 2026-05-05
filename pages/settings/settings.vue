<template>
  <view class="page">
    <view class="header">
      <view class="header-left">
        <text class="greeting">设置</text>
        <text class="date-text">数据备份 · 提醒管理</text>
      </view>
      <view class="header-right"><text class="app-title">工具箱</text></view>
    </view>

    <!-- 数据统计 -->
    <view class="card">
      <view class="card-title">📊 数据概览</view>
      <view class="stats-grid">
        <view v-for="stat in dataStats" :key="stat.key" class="stat-cell">
          <text class="stat-num">{{ stat.count }}</text>
          <text class="stat-label">{{ stat.label }}</text>
        </view>
      </view>
    </view>

    <!-- 数据备份与恢复 -->
    <view class="card">
      <view class="card-title">💾 数据备份与恢复</view>

      <view class="setting-item">
        <view class="item-left">
          <text class="label">导出备份</text>
          <text class="sublabel">导出所有数据为 JSON 文件</text>
        </view>
        <button class="small-btn" @click="exportData" :loading="exporting">导出</button>
      </view>

      <view class="setting-item">
        <view class="item-left">
          <text class="label">导入恢复</text>
          <text class="sublabel">从备份文件恢复（会覆盖当前数据）</text>
        </view>
        <button class="small-btn warn-btn" @click="importData" :loading="importing">选择文件</button>
      </view>

      <view class="setting-item last-item">
        <view class="item-left">
          <text class="label danger-label">清除全部数据</text>
          <text class="sublabel">删除本地所有记录，操作不可逆</text>
        </view>
        <button class="small-btn danger-btn" @click="clearAll">清除</button>
      </view>

      <view class="tip">⚠️ 导入会覆盖当前所有数据，建议导入前先备份</view>
    </view>

    <!-- 最近备份记录 -->
    <view class="card" v-if="lastBackupTime">
      <view class="card-title">🕐 最近备份</view>
      <view class="backup-info">
        <text class="backup-time">{{ lastBackupTime }}</text>
        <text class="backup-hint">备份文件已保存到设备</text>
      </view>
    </view>

    <!-- 订阅消息设置（模拟/演示） -->
    <view class="card">
      <view class="card-title">🔔 消息提醒设置</view>
      <view class="setting-item">
        <view class="item-left">
          <text class="label">每日汇总提醒</text>
          <text class="sublabel">每天汇总待办与事件</text>
        </view>
        <switch :checked="dailyReminder" @change="toggleDailyReminder" color="#4A90D9" />
      </view>
      <view class="setting-item">
        <view class="item-left">
          <text class="label">物品过期提醒</text>
          <text class="sublabel">临期前提前通知</text>
        </view>
        <switch :checked="expiryReminder" @change="toggleExpiryReminder" color="#4A90D9" />
      </view>
      <view class="setting-item last-item">
        <view class="item-left">
          <text class="label">纪念日当天提醒</text>
          <text class="sublabel">重要日期到来时通知</text>
        </view>
        <switch :checked="countdownReminder" @change="toggleCountdownReminder" color="#4A90D9" />
      </view>
      <button class="request-sub-btn" @click="requestSubscribe">请求订阅消息授权</button>
      <view class="tip">注意：订阅消息需在小程序后台配置模板ID，当前仅 UI 演示</view>
    </view>

    <!-- 关于 -->
    <view class="card about-card">
      <view class="about-row">
        <text class="about-name">个人工具箱</text>
        <text class="about-ver">v1.0.0</text>
      </view>
      <text class="about-desc">待办 · 物品 · 日历 · 打卡 · 倒数日 · 随机决定 · 工资计算</text>
      <text class="about-desc">数据完全本地存储，安全可靠</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  exportAllData,
  importAllData,
  clearAllData,
  getDataStats,
  getReminderSettings,
  saveReminderSettings
} from '../../utils/storage.js'

// ---------- 数据统计 ----------
const dataStats = ref([])

function refreshStats() {
  dataStats.value = getDataStats()
}

// ---------- 提醒开关 ----------
const dailyReminder = ref(false)
const expiryReminder = ref(false)
const countdownReminder = ref(false)

function loadSettings() {
  const s = getReminderSettings()
  dailyReminder.value = s.dailyReminder || false
  expiryReminder.value = s.expiryReminder || false
  countdownReminder.value = s.countdownReminder || false
}

function saveSettings() {
  saveReminderSettings({
    dailyReminder: dailyReminder.value,
    expiryReminder: expiryReminder.value,
    countdownReminder: countdownReminder.value
  })
}

function toggleDailyReminder(e) { dailyReminder.value = e.detail.value; saveSettings() }
function toggleExpiryReminder(e) { expiryReminder.value = e.detail.value; saveSettings() }
function toggleCountdownReminder(e) { countdownReminder.value = e.detail.value; saveSettings() }

// ---------- 备份状态 ----------
const lastBackupTime = ref('')
const exporting = ref(false)
const importing = ref(false)

function loadBackupRecord() {
  const t = uni.getStorageSync('_lastBackupTime')
  lastBackupTime.value = t || ''
}

// ---------- 导出数据 ----------
function exportData() {
  exporting.value = true
  try {
    const backup = exportAllData()
    const jsonStr = JSON.stringify(backup, null, 2)
    const fileName = `toolbox_backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`

    // 微信小程序：写入用户文件目录后分享
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
    const fs = wx.getFileSystemManager()
    fs.writeFile({
      filePath,
      data: jsonStr,
      encoding: 'utf8',
      success() {
        // 记录最后备份时间
        const now = new Date()
        const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
        uni.setStorageSync('_lastBackupTime', timeStr)
        lastBackupTime.value = timeStr

        // 尝试分享文件（部分版本支持）
        if (wx.shareFileMessage) {
          wx.shareFileMessage({
            filePath,
            success() { uni.showToast({ title: '导出成功，请保存到云盘或转发', icon: 'none', duration: 3000 }) },
            fail() { uni.showToast({ title: `文件已生成：${fileName}`, icon: 'none', duration: 3000 }) }
          })
        } else {
          uni.showToast({ title: `已生成备份文件`, icon: 'success' })
        }
      },
      fail(err) {
        console.error('写入文件失败', err)
        uni.showToast({ title: '导出失败，请重试', icon: 'none' })
      },
      complete() { exporting.value = false }
    })
  } catch (e) {
    exporting.value = false
    uni.showToast({ title: '导出失败', icon: 'none' })
  }
}

// ---------- 导入数据 ----------
function importData() {
  wx.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['json'],
    success(res) {
      importing.value = true
      const file = res.tempFiles[0]
      const fs = wx.getFileSystemManager()
      fs.readFile({
        filePath: file.path,
        encoding: 'utf8',
        success(fileRes) {
          try {
            const parsed = JSON.parse(fileRes.data)
            // 显示确认弹窗
            const exportTime = parsed.exportedAt
              ? `备份时间：${parsed.exportedAt.slice(0, 16).replace('T', ' ')}\n`
              : ''
            uni.showModal({
              title: '确认导入',
              content: `${exportTime}导入将覆盖当前所有数据，确定继续？`,
              success(modal) {
                if (modal.confirm) {
                  const result = importAllData(parsed)
                  if (result.success) {
                    refreshStats()
                    uni.showToast({ title: `${result.message}，请重启生效`, icon: 'none', duration: 3000 })
                  } else {
                    uni.showToast({ title: result.message, icon: 'none' })
                  }
                }
              }
            })
          } catch (e) {
            uni.showToast({ title: '文件解析失败，请确认为有效的备份文件', icon: 'none' })
          } finally {
            importing.value = false
          }
        },
        fail() {
          importing.value = false
          uni.showToast({ title: '读取文件失败', icon: 'none' })
        }
      })
    },
    fail() {
      // 用户取消选择，不提示
    }
  })
}

// ---------- 清除全部数据 ----------
function clearAll() {
  uni.showModal({
    title: '⚠️ 清除全部数据',
    content: '此操作将删除所有本地数据（待办、物品、打卡、纪念日等），且无法恢复！建议先备份。',
    confirmText: '确认清除',
    confirmColor: '#e74c3c',
    success(res) {
      if (res.confirm) {
        // 二次确认
        uni.showModal({
          title: '最后确认',
          content: '真的要清除全部数据吗？',
          confirmText: '清除',
          confirmColor: '#e74c3c',
          success(res2) {
            if (res2.confirm) {
              clearAllData()
              refreshStats()
              uni.showToast({ title: '已清除全部数据', icon: 'success' })
            }
          }
        })
      }
    }
  })
}

// ---------- 请求订阅消息（演示） ----------
function requestSubscribe() {
  uni.showModal({
    title: '订阅消息',
    content: '此功能需要在小程序后台添加消息模板并填入模板ID。当前为 UI 演示，不会实际发送。',
    showCancel: false
  })
}

onShow(() => {
  refreshStats()
  loadSettings()
  loadBackupRecord()
})
</script>

<style scoped>
.page { min-height: 100vh; background: #f2f6fc; padding-bottom: 80rpx; }

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 60rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #4A90D9 0%, #357abf 100%);
}
.greeting { font-size: 38rpx; font-weight: 600; color: #fff; display: block; }
.date-text { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 6rpx; display: block; }
.app-title { font-size: 28rpx; color: rgba(255,255,255,0.7); }

/* 卡片 */
.card {
  background: #fff;
  border-radius: 24rpx;
  margin: 20rpx 24rpx;
  padding: 28rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
}
.card-title { font-size: 30rpx; font-weight: 600; color: #2c3e50; margin-bottom: 24rpx; }

/* 数据统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.stat-cell {
  background: #f8fafd;
  border-radius: 16rpx;
  padding: 20rpx 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num { font-size: 40rpx; font-weight: 700; color: #4A90D9; line-height: 1; }
.stat-label { font-size: 22rpx; color: #8a9bb0; margin-top: 8rpx; }

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f4f8;
}
.setting-item.last-item { border-bottom: none; }
.item-left { flex: 1; margin-right: 20rpx; }
.label { font-size: 28rpx; color: #2c3e50; display: block; }
.sublabel { font-size: 22rpx; color: #8a9bb0; margin-top: 4rpx; display: block; }
.danger-label { color: #e74c3c; }

/* 按钮 */
.small-btn {
  background: #eaf4fe;
  color: #4A90D9;
  border-radius: 40rpx;
  font-size: 26rpx;
  padding: 10rpx 28rpx;
  margin: 0;
  flex-shrink: 0;
  white-space: nowrap;
}
.warn-btn { background: #fff3cd; color: #856404; }
.danger-btn { background: #fdecea; color: #e74c3c; }

.tip { font-size: 22rpx; color: #8a9bb0; margin-top: 20rpx; line-height: 1.6; }

/* 请求订阅按钮 */
.request-sub-btn {
  background: #4A90D9;
  color: #fff;
  border-radius: 48rpx;
  font-size: 28rpx;
  margin-top: 24rpx;
  margin-bottom: 4rpx;
}

/* 最近备份 */
.backup-info { padding: 8rpx 0; }
.backup-time { font-size: 30rpx; font-weight: 500; color: #2c3e50; display: block; }
.backup-hint { font-size: 22rpx; color: #8a9bb0; margin-top: 6rpx; display: block; }

/* 关于 */
.about-card { text-align: center; padding: 32rpx; }
.about-row {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.about-name { font-size: 30rpx; font-weight: 600; color: #2c3e50; }
.about-ver { font-size: 22rpx; color: #8a9bb0; }
.about-desc { font-size: 24rpx; color: #8a9bb0; display: block; line-height: 1.7; }
</style>
