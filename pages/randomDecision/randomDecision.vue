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
.music-random {
  background: #FDF9F5;
  padding-bottom: 80rpx;
}
.hero {
  background: linear-gradient(115deg, #E5D5C0, #DCC8B2);
  padding: 60rpx 0 40rpx;
  text-align: center;
  border-radius: 0 0 48rpx 48rpx;
}
.hero-icon { font-size: 80rpx; display: block; margin-bottom: 12rpx; }
.hero-title { font-size: 40rpx; font-weight: 600; color: #5F4C3A; letter-spacing: 4rpx; }
.hero-sub { font-size: 24rpx; color: #8F735C; margin-top: 6rpx; }
.card {
  background: rgba(255,252,248,0.95);
  backdrop-filter: blur(12px);
  border-radius: 48rpx;
  margin: 24rpx 24rpx;
  padding: 32rpx;
}
.card-title { font-size: 32rpx; font-weight: 500; color: #7A624E; margin-bottom: 28rpx; letter-spacing: 2rpx; }
.result-area {
  background: #F8F2EA;
  border-radius: 80rpx;
  padding: 28rpx 20rpx;
  text-align: center;
  font-size: 48rpx;
  font-weight: 600;
  color: #B08C6E;
  margin: 20rpx 0;
  transition: all 0.2s;
}
.result-area.flip { transform: rotateY(180deg); }
.music-btn {
  background: #EADBC6;
  color: #6F5540;
  border-radius: 60rpx;
  font-size: 28rpx;
  padding: 20rpx;
  width: 60%;
  margin: 0 auto;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}
.range-row { display: flex; justify-content: center; gap: 20rpx; margin-bottom: 20rpx; }
.range-input { background: #F8F2EA; border-radius: 32rpx; padding: 16rpx 24rpx; width: 140rpx; text-align: center; }
.music-textarea { background: #F8F2EA; border-radius: 32rpx; padding: 20rpx; font-size: 28rpx; margin-bottom: 16rpx; width: 100%; }
.small-save { background: #E8DDD0; border-radius: 40rpx; font-size: 24rpx; padding: 12rpx; margin-bottom: 20rpx; width: 200rpx; }
.result-area.large { font-size: 40rpx; }
</style>