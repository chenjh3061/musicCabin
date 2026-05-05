<template>
  <view class="page">
    <view class="header">
      <view class="header-left"><text class="greeting">单位换算</text><text class="date-text">长度｜重量｜温度</text></view>
      <view class="header-right"><text class="app-title">工具箱</text></view>
    </view>

    <view class="card">
      <view class="card-title">📏 长度换算</view>
      <view class="converter">
        <input class="input" type="digit" v-model="lengthVal" placeholder="数值" />
        <picker mode="selector" :range="lengthUnits" :value="lengthFromIdx" @change="onLengthFromChange">
          <view class="picker">{{ lengthUnits[lengthFromIdx] }}</view>
        </picker>
        <text> = </text>
        <view class="result">{{ lengthResult }}</view>
        <picker mode="selector" :range="lengthUnits" :value="lengthToIdx" @change="onLengthToChange">
          <view class="picker">{{ lengthUnits[lengthToIdx] }}</view>
        </picker>
      </view>
    </view>

    <!-- 重量、温度同理，代码略简洁 -->
    <view class="card">
      <view class="card-title">⚖️ 重量换算</view>
      <view class="converter">
        <input class="input" type="digit" v-model="weightVal" />
        <picker mode="selector" :range="weightUnits" :value="weightFromIdx"><view>{{ weightUnits[weightFromIdx] }}</view></picker>
        <text> = </text>
        <view class="result">{{ weightResult }}</view>
        <picker mode="selector" :range="weightUnits" :value="weightToIdx"><view>{{ weightUnits[weightToIdx] }}</view></picker>
      </view>
    </view>

    <view class="card">
      <view class="card-title">🌡️ 温度换算</view>
      <view class="converter">
        <input class="input" type="digit" v-model="tempVal" />
        <picker mode="selector" :range="tempUnits" :value="tempFromIdx"><view>{{ tempUnits[tempFromIdx] }}</view></picker>
        <text> = </text>
        <view class="result">{{ tempResult }}</view>
        <picker mode="selector" :range="tempUnits" :value="tempToIdx"><view>{{ tempUnits[tempToIdx] }}</view></picker>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

// 长度
const lengthUnits = ['米', '厘米', '毫米', '千米', '英寸', '英尺']
const lengthFactors = { '米':1, '厘米':0.01, '毫米':0.001, '千米':1000, '英寸':0.0254, '英尺':0.3048 }
const lengthVal = ref(1)
const lengthFromIdx = ref(0)
const lengthToIdx = ref(1)
const lengthResult = ref('')
// 重量
const weightUnits = ['克', '千克', '磅', '盎司']
const weightFactors = { '克':1, '千克':1000, '磅':453.59237, '盎司':28.3495 }
const weightVal = ref(1)
const weightFromIdx = ref(0)
const weightToIdx = ref(1)
const weightResult = ref('')
// 温度
const tempUnits = ['摄氏度', '华氏度', '开尔文']
const tempVal = ref(0)
const tempFromIdx = ref(0)
const tempToIdx = ref(1)
const tempResult = ref('')

function convertLength() {
  let val = parseFloat(lengthVal.value) || 0
  let fromUnit = lengthUnits[lengthFromIdx.value]
  let toUnit = lengthUnits[lengthToIdx.value]
  let meters = val * lengthFactors[fromUnit]
  let result = meters / lengthFactors[toUnit]
  lengthResult.value = result.toFixed(4)
}
function convertWeight() {
  let val = parseFloat(weightVal.value) || 0
  let from = weightUnits[weightFromIdx.value]
  let to = weightUnits[weightToIdx.value]
  let grams = val * weightFactors[from]
  let res = grams / weightFactors[to]
  weightResult.value = res.toFixed(4)
}
function convertTemp() {
  let val = parseFloat(tempVal.value) || 0
  let from = tempUnits[tempFromIdx.value]
  let to = tempUnits[tempToIdx.value]
  let celsius = 0
  if (from === '摄氏度') celsius = val
  else if (from === '华氏度') celsius = (val - 32) * 5/9
  else if (from === '开尔文') celsius = val - 273.15
  let result = 0
  if (to === '摄氏度') result = celsius
  else if (to === '华氏度') result = celsius * 9/5 + 32
  else if (to === '开尔文') result = celsius + 273.15
  tempResult.value = result.toFixed(2)
}

watch([lengthVal, lengthFromIdx, lengthToIdx], () => convertLength(), { immediate: true })
watch([weightVal, weightFromIdx, weightToIdx], () => convertWeight(), { immediate: true })
watch([tempVal, tempFromIdx, tempToIdx], () => convertTemp(), { immediate: true })
</script>

<style scoped>
.converter { display: flex; align-items: center; gap: 12rpx; flex-wrap: wrap; margin: 16rpx 0; }
.input { background: #f5f7fa; border-radius: 16rpx; padding: 16rpx; flex: 2; min-width: 140rpx; }
.picker { background: #eef2f7; padding: 16rpx 24rpx; border-radius: 32rpx; }
.result { font-weight: 700; color: #4A90D9; font-size: 32rpx; min-width: 120rpx; }
</style>