<template>
  <view class="music-random">
    <view class="hero">
      <text class="hero-icon">🎲</text>
      <text class="hero-title">随机回旋曲</text>
      <text class="hero-sub">抛硬币 · 抽签 · 今日菜单</text>
    </view>

    <!-- 抛硬币模块 -->
    <view class="card">
      <view class="card-title">🪙 抛一枚硬币</view>
      <view class="result-area" :class="{ flip: coinFlip }">{{ coinResult }}</view>
      <button class="music-btn" @click="flipCoin">抛一次</button>
    </view>

    <!-- 随机数字 -->
    <view class="card">
      <view class="card-title">🔢 随机数字</view>
      <view class="range-row">
        <input class="range-input" type="number" v-model.number="rangeMin" />
        <text>—</text>
        <input class="range-input" type="number" v-model.number="rangeMax" />
      </view>
      <view class="result-area">{{ randomNum !== null ? randomNum : '点击生成' }}</view>
      <button class="music-btn" @click="genRandomNum">生成</button>
    </view>

    <!-- 自定义抽签 -->
    <view class="card">
      <view class="card-title">🎼 自定义签筒</view>
      <textarea class="music-textarea" v-model="optionsText" placeholder="每行一个选项" rows="3"></textarea>
      <view class="result-area">{{ customResult || '点击抽一支签' }}</view>
      <button class="music-btn" @click="drawCustom">摇一摇</button>
    </view>

    <!-- 随机午餐/晚餐 -->
    <view class="card">
      <view class="card-title">🍽️ 今日食堂随机曲</view>
      <textarea class="music-textarea" v-model="mealOptions" placeholder="每行一道美食" rows="3"></textarea>
      <button class="small-save" @click="saveMealOptions">保存菜单</button>
      <view class="result-area large">{{ mealResult || '点击随机选择' }}</view>
      <button class="music-btn" @click="pickMeal">随机决定吃什么</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const coinResult = ref('')
const coinFlip = ref(false)
function flipCoin() {
  coinFlip.value = true
  setTimeout(() => { coinFlip.value = false }, 300)
  coinResult.value = Math.random() < 0.5 ? '正面' : '反面'
}

const rangeMin = ref(1), rangeMax = ref(100), randomNum = ref(null)
function genRandomNum() {
  if(rangeMin.value >= rangeMax.value) return uni.showToast({title:'最小值需小于最大值',icon:'none'})
  randomNum.value = Math.floor(Math.random()*(rangeMax.value-rangeMin.value+1))+rangeMin.value
}

const optionsText = ref('吃饭\n看电影\n散步')
const customResult = ref('')
function drawCustom() {
  const lines = optionsText.value.split('\n').filter(l=>l.trim())
  if(!lines.length) { customResult.value = '请至少填写一项'; return }
  customResult.value = lines[Math.floor(Math.random()*lines.length)]
}

const mealOptions = ref('')
const mealResult = ref('')
function loadMealOptions() { mealOptions.value = uni.getStorageSync('mealOptions') || '🥗 沙拉\n🍜 牛肉面\n🍛 咖喱饭\n🥟 水饺' }
function saveMealOptions() { uni.setStorageSync('mealOptions', mealOptions.value); uni.showToast({title:'菜单已存档'}) }
function pickMeal() {
  const lines = mealOptions.value.split('\n').filter(l=>l.trim())
  if(!lines.length) { mealResult.value = '请先录入一些美食吧'; return }
  mealResult.value = lines[Math.floor(Math.random()*lines.length)]
}

onMounted(loadMealOptions)
</script>

<style scoped>
.music-random { background: #EDF4FB; min-height: 100vh; padding-bottom: 80rpx; }
.hero {
  background: linear-gradient(145deg, #3A7FD5 0%, #29ACAB 100%);
  padding: 60rpx 0 44rpx; text-align: center;
  border-radius: 0 0 56rpx 56rpx;
  box-shadow: 0 10rpx 36rpx rgba(42,100,180,0.18);
}
.hero-icon { font-size: 72rpx; display: block; margin-bottom: 12rpx; }
.hero-title { font-size: 40rpx; font-weight: 700; color: #fff; letter-spacing: 4rpx; display: block; }
.hero-sub { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 6rpx; display: block; }

.card {
  background: rgba(255,255,255,0.95); border-radius: 32rpx;
  margin: 20rpx 24rpx; padding: 28rpx 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(74,144,217,0.08);
  border: 1rpx solid #D6E9F7;
}
.card-title { font-size: 30rpx; font-weight: 700; color: #1E3A5C; margin-bottom: 24rpx; }

.result-area {
  background: #EEF4FA; border-radius: 60rpx;
  padding: 28rpx 20rpx; text-align: center;
  font-size: 48rpx; font-weight: 700; color: #2F72C0;
  margin: 18rpx 0; transition: all 0.2s;
  border: 1rpx solid #D6E9F7;
}
.result-area.flip { transform: rotateY(180deg); }
.result-area.large { font-size: 38rpx; }

.music-btn {
  background: linear-gradient(135deg, #4A90D9, #3ABFBF);
  color: #fff; border-radius: 60rpx;
  font-size: 28rpx; padding: 20rpx; width: 62%;
  margin: 4rpx auto;
  box-shadow: 0 4rpx 18rpx rgba(74,144,217,0.30);
  display: block; letter-spacing: 1rpx; border: none;
}
.range-row { display: flex; justify-content: center; gap: 20rpx; margin-bottom: 20rpx; align-items: center; }
.range-input { background: #EEF4FA; border-radius: 24rpx; padding: 14rpx 18rpx; width: 130rpx; text-align: center; border: 1rpx solid #D6E9F7; color: #1E3A5C; font-size: 28rpx; }
.music-textarea { background: #EEF4FA; border-radius: 24rpx; padding: 18rpx; font-size: 26rpx; margin-bottom: 16rpx; width: 100%; box-sizing: border-box; border: 1rpx solid #D6E9F7; color: #1E3A5C; }
.small-save {
  background: #E3F2FC; border-radius: 40rpx; font-size: 24rpx; padding: 12rpx;
  margin-bottom: 20rpx; width: 200rpx; color: #4A90D9; border: none; display: block; text-align: center;
}
</style>