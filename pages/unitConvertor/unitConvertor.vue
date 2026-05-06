<template>
  <view class="page">
    <view class="music-hero">
      <text class="hero-icon">📐</text>
      <text class="hero-title">单位换算</text>
      <text class="hero-sub">长度 · 重量 · 温度</text>
    </view>

    <!-- 长度换算 -->
    <view class="music-card">
      <view class="card-title">📏 长度换算</view>
      <view class="converter-row">
        <input class="music-input small" type="digit" v-model="lengthVal" placeholder="数值" />
        <picker mode="selector" :range="lengthUnits" v-model="lengthFromIdx" @change="onLengthFromChange">
          <view class="picker">{{ lengthUnits[lengthFromIdx] }}</view>
        </picker>
        <text class="equal">=</text>
        <view class="result">{{ lengthResult }}</view>
        <picker mode="selector" :range="lengthUnits" v-model="lengthToIdx" @change="onLengthToChange">
          <view class="picker">{{ lengthUnits[lengthToIdx] }}</view>
        </picker>
      </view>
    </view>

    <!-- 重量换算 -->
    <view class="music-card">
      <view class="card-title">⚖️ 重量换算</view>
      <view class="converter-row">
        <input class="music-input small" type="digit" v-model="weightVal" placeholder="数值" />
        <picker mode="selector" :range="weightUnits" v-model="weightFromIdx" @change="onWeightFromChange">
          <view class="picker">{{ weightUnits[weightFromIdx] }}</view>
        </picker>
        <text class="equal">=</text>
        <view class="result">{{ weightResult }}</view>
        <picker mode="selector" :range="weightUnits" v-model="weightToIdx" @change="onWeightToChange">
          <view class="picker">{{ weightUnits[weightToIdx] }}</view>
        </picker>
      </view>
    </view>

    <!-- 温度换算 -->
    <view class="music-card">
      <view class="card-title">🌡️ 温度换算</view>
      <view class="converter-row">
        <input class="music-input small" type="digit" v-model="tempVal" placeholder="数值" />
        <picker mode="selector" :range="tempUnits" v-model="tempFromIdx" @change="onTempFromChange">
          <view class="picker">{{ tempUnits[tempFromIdx] }}</view>
        </picker>
        <text class="equal">=</text>
        <view class="result">{{ tempResult }}</view>
        <picker mode="selector" :range="tempUnits" v-model="tempToIdx" @change="onTempToChange">
          <view class="picker">{{ tempUnits[tempToIdx] }}</view>
        </picker>
      </view>
    </view>

    <view class="music-footer">♫ 换算随心，生活从容 ♫</view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

// ---------- 长度 ----------
const lengthUnits = ['米', '厘米', '毫米', '千米', '英寸', '英尺']
const lengthFactors = { '米': 1, '厘米': 0.01, '毫米': 0.001, '千米': 1000, '英寸': 0.0254, '英尺': 0.3048 }
const lengthVal = ref(1)
const lengthFromIdx = ref(0)
const lengthToIdx = ref(1)
const lengthResult = ref('')

// ---------- 重量 ----------
const weightUnits = ['克', '千克', '磅', '盎司']
const weightFactors = { '克': 1, '千克': 1000, '磅': 453.59237, '盎司': 28.3495 }
const weightVal = ref(1)
const weightFromIdx = ref(0)
const weightToIdx = ref(1)
const weightResult = ref('')

// ---------- 温度 ----------
const tempUnits = ['摄氏度', '华氏度', '开尔文']
const tempVal = ref(0)
const tempFromIdx = ref(0)
const tempToIdx = ref(1)
const tempResult = ref('')

// 长度换算
function convertLength() {
  let val = parseFloat(lengthVal.value) || 0
  let fromUnit = lengthUnits[lengthFromIdx.value]
  let toUnit = lengthUnits[lengthToIdx.value]
  let meters = val * lengthFactors[fromUnit]
  let res = meters / lengthFactors[toUnit]
  lengthResult.value = res.toFixed(4)
}

// 重量换算
function convertWeight() {
  let val = parseFloat(weightVal.value) || 0
  let from = weightUnits[weightFromIdx.value]
  let to = weightUnits[weightToIdx.value]
  let grams = val * weightFactors[from]
  let res = grams / weightFactors[to]
  weightResult.value = res.toFixed(4)
}

// 温度换算
function convertTemp() {
  let val = parseFloat(tempVal.value) || 0
  let from = tempUnits[tempFromIdx.value]
  let to = tempUnits[tempToIdx.value]
  let celsius = 0
  if (from === '摄氏度') celsius = val
  else if (from === '华氏度') celsius = (val - 32) * 5 / 9
  else if (from === '开尔文') celsius = val - 273.15

  let result = 0
  if (to === '摄氏度') result = celsius
  else if (to === '华氏度') result = celsius * 9 / 5 + 32
  else if (to === '开尔文') result = celsius + 273.15
  tempResult.value = result.toFixed(2)
}

// 监听变化
watch([lengthVal, lengthFromIdx, lengthToIdx], () => convertLength(), { immediate: true })
watch([weightVal, weightFromIdx, weightToIdx], () => convertWeight(), { immediate: true })
watch([tempVal, tempFromIdx, tempToIdx], () => convertTemp(), { immediate: true })

function onLengthFromChange() { convertLength() }
function onLengthToChange() { convertLength() }
function onWeightFromChange() { convertWeight() }
function onWeightToChange() { convertWeight() }
function onTempFromChange() { convertTemp() }
function onTempToChange() { convertTemp() }
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #F0F4FA;
  padding-bottom: 40rpx;
}

.hero-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 12rpx;
}
.hero-title {
  font-size: 44rpx;
  font-weight: 600;
  letter-spacing: 4rpx;
  color: white;
}
.hero-sub {
  font-size: 24rpx;
  opacity: 0.9;
  margin-top: 8rpx;
  color: white;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 24rpx;
}

.converter-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}
.music-input.small {
  width: 160rpx;
  background: #F5F8FF;
  border-radius: 32rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  border: 1rpx solid #E4E9F2;
}
.picker {
  background: #E8F0FE;
  padding: 16rpx 28rpx;
  border-radius: 48rpx;
  font-size: 28rpx;
  color: #5D9BEC;
}
.equal {
  font-size: 32rpx;
  font-weight: 500;
  color: #7F8C8D;
}
.result {
  background: #E8F0FE;
  padding: 16rpx 28rpx;
  border-radius: 48rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #5D9BEC;
  min-width: 160rpx;
  text-align: center;
}
</style>