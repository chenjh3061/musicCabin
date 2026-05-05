<template>
  <view class="page">
    <view class="header">
      <view class="header-left"><text class="greeting">随机决定</text><text class="date-text">抛硬币｜抽签｜午餐</text></view>
      <view class="header-right"><text class="app-title">选择困难解药</text></view>
    </view>

    <!-- 原有抛硬币 -->
    <view class="card">
      <view class="card-title">🪙 抛硬币</view>
      <view class="random-result">{{ coinResult }}</view>
      <button class="random-btn" @click="flipCoin">抛一次</button>
    </view>

    <!-- 原有随机数字 -->
    <view class="card">
      <view class="card-title">🔢 随机数字</view>
      <view class="range">
        <input class="range-input" type="number" v-model.number="rangeMin" placeholder="最小值" />
        <text> ～ </text>
        <input class="range-input" type="number" v-model.number="rangeMax" placeholder="最大值" />
      </view>
      <view class="random-result">{{ randomNum !== null ? randomNum : '点击生成' }}</view>
      <button class="random-btn" @click="genRandomNum">生成</button>
    </view>

    

    <!-- 新增：随机午餐/晚餐 -->
    <view class="card">
      <view class="card-title">🍜 随机午餐/晚餐</view>
      <view class="meal-options">
        <view class="meal-editor">
          <textarea v-model="mealOptions" placeholder="每行一个选项，例如：兰州拉面\n沙县小吃\n麦当劳\n食堂" rows="4"></textarea>
          <button class="save-meal-btn" @click="saveMealOptions">保存菜单</button>
        </view>
      </view>
      <view class="random-result">{{ mealResult || '点击随机选择一顿' }}</view>
      <button class="random-btn" @click="pickMeal">随机决定吃什么</button>
    </view>
	
	<!-- 原有自定义抽签 -->
	<view class="card">
	  <view class="card-title">🎲 自定义抽签</view>
	  <view class="options-input">
	    <textarea v-model="optionsText" placeholder="每行一个选项，例如：吃饭\n看电影\n散步" rows="4"></textarea>
	  </view>
	  <view class="random-result">{{ customResult || '点击抽签' }}</view>
	  <button class="random-btn" @click="drawCustom">抽签</button>
	</view>
	
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 抛硬币
const coinResult = ref('')
function flipCoin() { coinResult.value = Math.random() < 0.5 ? '正面' : '反面' }

// 随机数字
const rangeMin = ref(1)
const rangeMax = ref(100)
const randomNum = ref(null)
function genRandomNum() {
  const min = Math.ceil(rangeMin.value)
  const max = Math.floor(rangeMax.value)
  if (min >= max) { uni.showToast({ title: '最小值需小于最大值', icon: 'none' }); return }
  randomNum.value = Math.floor(Math.random() * (max - min + 1)) + min
}

// 自定义抽签
const optionsText = ref('吃饭\n看电影\n散步')
const customResult = ref('')
function drawCustom() {
  const lines = optionsText.value.split('\n').filter(l => l.trim().length > 0)
  if (lines.length === 0) { customResult.value = '请至少输入一个选项'; return }
  const idx = Math.floor(Math.random() * lines.length)
  customResult.value = lines[idx]
}

// 随机午餐/晚餐
const mealOptions = ref('')
const mealResult = ref('')
function loadMealOptions() {
  const stored = uni.getStorageSync('mealOptions')
  if (stored) mealOptions.value = stored
  else mealOptions.value = '兰州拉面\n沙县小吃\n麦当劳\n肯德基\n食堂盖饭\n自选快餐'
}
function saveMealOptions() {
  uni.setStorageSync('mealOptions', mealOptions.value)
  uni.showToast({ title: '菜单已保存', icon: 'success' })
}
function pickMeal() {
  const lines = mealOptions.value.split('\n').filter(l => l.trim().length > 0)
  if (lines.length === 0) { mealResult.value = '请先添加一些美食选项'; return }
  const idx = Math.floor(Math.random() * lines.length)
  mealResult.value = lines[idx]
}

onMounted(() => {
  loadMealOptions()
})
</script>

<style scoped>
/* 复用已有样式，补充新样式 */
.page { min-height: 100vh; background: #f2f6fc; padding-bottom: 80rpx; }
.header { display: flex; justify-content: space-between; align-items: flex-end; padding: 60rpx 32rpx 24rpx; background: linear-gradient(135deg, #4A90D9 0%, #357abf 100%); }
.header-left { font-size: 30rpx; color: #fff; }

.random-result { font-size: 48rpx; font-weight: 700; text-align: center; margin: 24rpx 0; color: #4A90D9; }
.random-btn { background: #4A90D9; color: #fff; border-radius: 48rpx; font-size: 28rpx; width: 300rpx; margin: 0 auto; }
.range { display: flex; align-items: center; justify-content: center; gap: 16rpx; margin-bottom: 24rpx; }
.range-input { background: #f5f7fa; border-radius: 16rpx; padding: 12rpx 20rpx; width: 160rpx; text-align: center; }
.options-input textarea, .meal-editor textarea { background: #f5f7fa; border-radius: 16rpx; padding: 20rpx; font-size: 28rpx; width: 90%; margin-bottom: 16rpx; }
.save-meal-btn { background: #e8faf0; color: #2e7d32; border-radius: 48rpx; font-size: 26rpx; padding: 12rpx; width: auto; margin-top: 8rpx; }
.meal-editor { margin-bottom: 16rpx; }
</style>