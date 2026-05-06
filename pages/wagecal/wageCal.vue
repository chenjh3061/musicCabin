<template>
  <view class="page">
    <view class="music-hero">
      <text class="hero-icon">💰</text>
      <text class="hero-title">薪资规划</text>
      <text class="hero-sub">目标平均 ¥{{ targetAvg }} × {{ totalMonths }}个月</text>
    </view>

    <!-- 目标设定 -->
    <view class="music-card">
      <view class="card-title">⚙️ 目标设定</view>
      <view class="row">
        <view class="col">
          <text class="label">总月数</text>
          <input class="music-input" type="number" v-model="totalMonths" @blur="saveData" />
        </view>
        <view class="col">
          <text class="label">目标平均月薪 (元)</text>
          <input class="music-input" type="digit" v-model="targetAvg" @blur="saveData" />
        </view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-num">{{ workedMonths }}</text>
        <text class="stat-label">已工作月数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">¥{{ totalEarned.toFixed(0) }}</text>
        <text class="stat-label">已赚总额</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">¥{{ remainingAvg.toFixed(0) }}</text>
        <text class="stat-label">剩余月均需赚</text>
      </view>
    </view>

    <!-- 已发工资列表 -->
    <view class="music-card">
      <view class="card-header">
        <text class="card-title">📋 已过去的月份工资</text>
        <text class="add-btn" @click="addMonthRecord">+ 添加</text>
      </view>
      <view v-if="monthRecords.length === 0" class="empty-tip">
        点击“+ 添加”记录你实际到手的月工资
      </view>
      <view v-for="(item, idx) in monthRecords" :key="idx" class="record-item">
        <view class="record-month">
          <text>第</text>
          <input class="month-input" type="number" v-model="item.month" @blur="sortAndSave" />
          <text>个月</text>
        </view>
        <view class="record-salary">
          <text>¥</text>
          <input class="salary-input" type="digit" v-model="item.salary" @blur="saveData" />
        </view>
        <text class="del-icon" @click="deleteRecord(idx)">🗑️</text>
      </view>
    </view>

    <!-- 结果提示 -->
    <view class="tip-card" :class="{ warn: remainingAvg < 0 }">
      <text class="tip-text" v-if="remainingAvg >= 0">
        ✅ 剩余 {{ remainingMonths }} 个月，平均每月需挣 ¥{{ remainingAvg.toFixed(0) }}
      </text>
      <text class="tip-text" v-else>
        ⚠️ 已经超过目标！剩余月平均为负数，你可以降低目标或庆祝一下 🎉
      </text>
    </view>

    <view class="music-footer">♫ 规划未来，从容生活 ♫</view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// 数据
const totalMonths = ref(120)
const targetAvg = ref(12000)
const monthRecords = ref([])  // { month: 数字, salary: 数字 }

// 计算属性
const workedMonths = computed(() => monthRecords.value.length)
const totalEarned = computed(() => monthRecords.value.reduce((sum, r) => sum + (Number(r.salary) || 0), 0))
const remainingMonths = computed(() => Math.max(0, totalMonths.value - workedMonths.value))
const requiredTotal = computed(() => targetAvg.value * totalMonths.value)
const remainingNeed = computed(() => requiredTotal.value - totalEarned.value)
const remainingAvg = computed(() => {
  if (remainingMonths.value <= 0) return 0
  const need = remainingNeed.value
  if (need <= 0) return 0
  return need / remainingMonths.value
})

// 保存到本地
function saveData() {
  const toStore = {
    totalMonths: totalMonths.value,
    targetAvg: targetAvg.value,
    monthRecords: monthRecords.value
  }
  uni.setStorageSync('wageCalData', toStore)
}

// 加载数据
function loadData() {
  const stored = uni.getStorageSync('wageCalData')
  if (stored) {
    totalMonths.value = stored.totalMonths || 120
    targetAvg.value = stored.targetAvg || 12000
    monthRecords.value = stored.monthRecords || []
    monthRecords.value = monthRecords.value.map(r => ({
      month: r.month || 1,
      salary: r.salary || 0
    }))
    sortRecords()
  } else {
    // 演示数据
    monthRecords.value = [
      { month: 1, salary: 11000 },
      { month: 2, salary: 11500 },
      { month: 3, salary: 11800 }
    ]
    saveData()
  }
}

function sortRecords() {
  monthRecords.value.sort((a, b) => a.month - b.month)
}
function sortAndSave() {
  sortRecords()
  saveData()
}
function addMonthRecord() {
  let nextMonth = 1
  if (monthRecords.value.length > 0) {
    const maxMonth = Math.max(...monthRecords.value.map(r => r.month))
    nextMonth = maxMonth + 1
  }
  monthRecords.value.push({ month: nextMonth, salary: 0 })
  sortAndSave()
}
function deleteRecord(idx) {
  monthRecords.value.splice(idx, 1)
  sortAndSave()
}

watch([totalMonths, targetAvg, monthRecords], () => saveData(), { deep: true })
onMounted(() => loadData())
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
  background: #fff; border-radius: 32rpx; margin: 16rpx 24rpx;
  padding: 28rpx; box-shadow: 0 4rpx 20rpx rgba(74,144,217,0.08);
  border: 1rpx solid #D6E9F7;
}
.card-title { font-size: 30rpx; font-weight: 700; color: #1E3A5C; margin-bottom: 20rpx; display: block; }
.row { display: flex; gap: 24rpx; }
.col { flex: 1; }
.label { font-size: 24rpx; color: #8FAEC8; display: block; margin-bottom: 10rpx; }
.music-input {
  width: 100%; background: #EEF4FA; border-radius: 16rpx;
  padding: 14rpx 16rpx; font-size: 28rpx; color: #1E3A5C;
  border: 1rpx solid #D6E9F7; box-sizing: border-box;
}

.stats-card {
  background: #fff; border-radius: 36rpx; margin: 16rpx 24rpx;
  padding: 28rpx 0; display: flex; justify-content: space-around;
  box-shadow: 0 4rpx 20rpx rgba(74,144,217,0.08);
  border: 1rpx solid #D6E9F7;
}
.stat-item { text-align: center; flex: 1; }
.stat-num { font-size: 40rpx; font-weight: 700; color: #4A90D9; display: block; }
.stat-label { font-size: 22rpx; color: #8FAEC8; margin-top: 8rpx; display: block; }
.stat-divider { width: 1rpx; background: #D6E9F7; height: 56rpx; align-self: center; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.add-btn { font-size: 26rpx; color: #4A90D9; background: #E3F2FC; padding: 6rpx 20rpx; border-radius: 60rpx; }

.record-item {
  display: flex; align-items: center; justify-content: space-between;
  background: #EDF4FB; border-radius: 20rpx; padding: 18rpx 20rpx; margin-bottom: 14rpx;
  border: 1rpx solid #D6E9F7;
}
.record-month { display: flex; align-items: center; gap: 12rpx; font-size: 28rpx; color: #1E3A5C; }
.month-input {
  width: 100rpx; background: #fff; border-radius: 12rpx;
  padding: 10rpx 14rpx; text-align: center; border: 1rpx solid #B8D4EC; color: #1E3A5C; font-size: 26rpx;
}
.record-salary { display: flex; align-items: center; gap: 8rpx; }
.salary-input {
  width: 180rpx; background: #fff; border-radius: 12rpx;
  padding: 10rpx 14rpx; text-align: right; border: 1rpx solid #B8D4EC; color: #1E3A5C; font-size: 26rpx;
}
.del-icon { font-size: 40rpx; color: #B8D4EC; padding: 8rpx; }

.tip-card {
  background: #E3F2FC; border-radius: 32rpx; margin: 16rpx 24rpx; padding: 24rpx; text-align: center;
  border: 1rpx solid #D6E9F7;
}
.tip-card.warn { background: #FEF0F0; border-color: #F5C6C6; }
.tip-text { font-size: 28rpx; font-weight: 600; color: #2F72C0; }
.tip-card.warn .tip-text { color: #C0392B; }
.empty-tip { text-align: center; color: #8FAEC8; padding: 40rpx 0; font-size: 26rpx; }
</style>