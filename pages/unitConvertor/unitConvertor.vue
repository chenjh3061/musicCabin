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
.page { min-height: 100vh; background: #EDF4FB; padding-bottom: 60rpx; }

/* Hero */
.music-hero {
  background: linear-gradient(145deg, #3A7FD5 0%, #29ACAB 100%);
  padding: 60rpx 32rpx 50rpx; text-align: center;
  border-radius: 0 0 56rpx 56rpx;
  box-shadow: 0 10rpx 36rpx rgba(42,100,180,0.18);
}
.hero-icon { font-size: 64rpx; display: block; margin-bottom: 12rpx; }
.hero-title { font-size: 44rpx; font-weight: 700; letter-spacing: 4rpx; color: #fff; display: block; }
.hero-sub { font-size: 24rpx; opacity: 0.85; margin-top: 8rpx; color: #fff; display: block; }

/* 通用卡片 */
.music-card {
  background: #fff; border-radius: 32rpx; margin: 16rpx 24rpx;
  padding: 28rpx; box-shadow: 0 4rpx 20rpx rgba(74,144,217,0.08);
  border: 1rpx solid #D6E9F7;
}
.card-title { font-size: 30rpx; font-weight: 700; color: #1E3A5C; margin-bottom: 22rpx; display: block; }

/* 换算行 */
.converter-row { display: flex; align-items: center; gap: 14rpx; flex-wrap: wrap; }
.music-input.small {
  width: 150rpx; background: #EEF4FA; border-radius: 24rpx;
  padding: 18rpx 18rpx; font-size: 28rpx;
  border: 1rpx solid #D6E9F7; color: #1E3A5C;
}
.picker {
  background: #E3F2FC; padding: 14rpx 22rpx;
  border-radius: 40rpx; font-size: 26rpx; color: #4A90D9;
  border: 1rpx solid #B8D4EC;
}
.equal { font-size: 32rpx; font-weight: 700; color: #8FAEC8; }
.result {
  background: linear-gradient(135deg, #E3F2FC, #DFF4F4);
  padding: 14rpx 22rpx; border-radius: 40rpx;
  font-size: 30rpx; font-weight: 700; color: #2F72C0;
  min-width: 150rpx; text-align: center;
  border: 1rpx solid #B8D4EC;
}

.music-footer { text-align: center; font-size: 24rpx; color: #B8D4EC; margin: 36rpx 0 60rpx; letter-spacing: 2rpx; }
</style>