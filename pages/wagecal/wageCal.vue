<template>
  <view class="page">
    <!-- 顶部渐变栏 -->
    <view class="header">
      <view class="header-left">
        <text class="greeting">工资计算器</text>
        <text class="date-text">目标平均￥{{ targetAvg }} × {{ totalMonths }}个月</text>
      </view>
      <view class="header-right">
        <text class="app-title">工具箱</text>
      </view>
    </view>

    <!-- 目标设定卡片 -->
    <view class="card">
      <view class="card-title">⚙️ 目标设定</view>
      <view class="row">
        <view class="col">
          <text class="label">总月数</text>
          <input class="input" type="number" v-model="totalMonths" @blur="saveData" />
        </view>
        <view class="col">
          <text class="label">目标平均月薪 (元)</text>
          <input class="input" type="digit" v-model="targetAvg" @blur="saveData" />
        </view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="card stats">
      <view class="stat-item">
        <text class="stat-num">{{ workedMonths }}</text>
        <text class="stat-label">已工作月数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">￥{{ totalEarned.toFixed(0) }}</text>
        <text class="stat-label">已赚总额</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">￥{{ remainingAvg.toFixed(0) }}</text>
        <text class="stat-label">剩余月均需赚</text>
      </view>
    </view>

    <!-- 已发工资列表 -->
    <view class="card">
      <view class="card-title">
        📋 已过去的月份工资
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
          <text>￥</text>
          <input class="salary-input" type="digit" v-model="item.salary" @blur="saveData" />
        </view>
        <text class="del-icon" @click="deleteRecord(idx)">🗑️</text>
      </view>
    </view>

    <!-- 结果提示卡片 -->
    <view class="card tip-card" :class="{ warn: remainingAvg < 0 }">
      <text class="tip-text" v-if="remainingAvg >= 0">
        ✅ 剩余 {{ remainingMonths }} 个月，平均每月需挣 ￥{{ remainingAvg.toFixed(0) }}
      </text>
      <text class="tip-text" v-else>
        ⚠️ 已经超过目标！剩余月平均为负数，你可以降低目标或庆祝一下 🎉
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// ---------- 数据 ----------
const totalMonths = ref(120)
const targetAvg = ref(12000)
// 月份记录：{ month: 数字, salary: 数字 }
const monthRecords = ref([])

// ---------- 计算属性 ----------
// 已工作月数（去重后的实际月份数）
const workedMonths = computed(() => monthRecords.value.length)

// 已赚总额
const totalEarned = computed(() => {
  return monthRecords.value.reduce((sum, r) => sum + (Number(r.salary) || 0), 0)
})

// 剩余月数
const remainingMonths = computed(() => {
  return Math.max(0, totalMonths.value - workedMonths.value)
})

// 需要达到总目标所需的总收入
const requiredTotal = computed(() => targetAvg.value * totalMonths.value)

// 剩余月份需要赚的总金额
const remainingNeed = computed(() => requiredTotal.value - totalEarned.value)

// 剩余月平均需要赚多少
const remainingAvg = computed(() => {
  if (remainingMonths.value <= 0) return 0
  const need = remainingNeed.value
  if (need <= 0) return 0
  return need / remainingMonths.value
})

// ---------- 辅助函数 ----------
// 保存到本地存储
function saveData() {
  const toStore = {
    totalMonths: totalMonths.value,
    targetAvg: targetAvg.value,
    monthRecords: monthRecords.value
  }
  uni.setStorageSync('wageCalData', toStore)
}

// 加载本地数据
function loadData() {
  const stored = uni.getStorageSync('wageCalData')
  if (stored) {
    totalMonths.value = stored.totalMonths || 120
    targetAvg.value = stored.targetAvg || 12000
    monthRecords.value = stored.monthRecords || []
    // 确保每条记录都有 month 和 salary
    monthRecords.value = monthRecords.value.map(r => ({
      month: r.month || 1,
      salary: r.salary || 0
    }))
    sortRecords()
  } else { 
    // 演示数据：示例已过去3个月
    monthRecords.value = [
      { month: 1, salary: 6581 },
      { month: 2, salary: 3855 },
      { month: 3, salary: 3322 },
	  { month: 4, salary: 9657 },
	  { month: 5, salary: 13686 },
	  { month: 6, salary: 8822 },
	  { month: 7, salary: 8839 },
	  { month: 8, salary: 5487 },
	  { month: 9, salary: 6043 },
    ]
    saveData()
  }
}

// 按月份排序
function sortRecords() {
  monthRecords.value.sort((a, b) => a.month - b.month)
}

function sortAndSave() {
  sortRecords()
  saveData()
}

// 添加新记录（自动取最大月份+1）
function addMonthRecord() {
  let nextMonth = 1
  if (monthRecords.value.length > 0) {
    const maxMonth = Math.max(...monthRecords.value.map(r => r.month))
    nextMonth = maxMonth + 1
  }
  monthRecords.value.push({
    month: nextMonth,
    salary: 0
  })
  sortAndSave()
}

// 删除记录
function deleteRecord(idx) {
  monthRecords.value.splice(idx, 1)
  sortAndSave()
}

// 监听变化自动保存
watch([totalMonths, targetAvg, monthRecords], () => {
  saveData()
}, { deep: true })

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f2f6fc;
  padding-bottom: 80rpx;
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 60rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #4A90D9 0%, #357abf 100%);
}
.greeting {
  display: block;
  font-size: 38rpx;
  font-weight: 600;
  color: #fff;
}
.date-text {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 6rpx;
}
.app-title {
  font-size: 28rpx;
  color: rgba(255,255,255,0.7);
}

/* 通用卡片 */
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
  font-weight: normal;
  background: #eaf4fe;
  padding: 8rpx 20rpx;
  border-radius: 28rpx;
}

/* 目标输入行 */
.row {
  display: flex;
  gap: 24rpx;
}
.col {
  flex: 1;
}
.label {
  font-size: 26rpx;
  color: #8a9bb0;
  display: block;
  margin-bottom: 12rpx;
}
.input {
  background: #f5f7fa;
  border-radius: 16rpx;
  padding: 18rpx 20rpx;
  font-size: 28rpx;
  border: 1rpx solid #eef2f7;
}

/* 统计卡片 */
.stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 24rpx 0;
}
.stat-item {
  flex: 1;
  text-align: center;
}
.stat-num {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #2c3e50;
}
.stat-label {
  font-size: 24rpx;
  color: #8a9bb0;
  margin-top: 8rpx;
}
.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #eef2f7;
}

/* 记录列表项 */
.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafd;
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
}
.record-month {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #2c3e50;
}
.month-input {
  width: 100rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
  text-align: center;
  font-size: 28rpx;
  border: 1rpx solid #e2e8f0;
}
.record-salary {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #2c3e50;
}
.salary-input {
  width: 180rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
  text-align: right;
  font-size: 28rpx;
  border: 1rpx solid #e2e8f0;
}
.del-icon {
  font-size: 36rpx;
  color: #f29b9b;
  padding: 8rpx;
}
.empty-tip {
  text-align: center;
  color: #aab5c2;
  font-size: 26rpx;
  padding: 40rpx 0;
}

/* 提示卡片 */
.tip-card {
  background: #e8f5e9;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
}
.tip-card.warn {
  background: #ffebee;
}
.tip-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #2c3e50;
  text-align: center;
  display: block;
}
</style>