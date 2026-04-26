<template>
  <view class="page">
    <view class="form-card">
      <!-- 标题 -->
      <view class="field">
        <text class="field-label">事件标题 *</text>
        <input
          class="field-input"
          v-model="form.title"
          placeholder="输入事件名称"
          maxlength="50"
        />
      </view>

      <!-- 日期 -->
      <view class="field">
        <text class="field-label">日期 *</text>
        <picker mode="date" :value="form.date" @change="e => form.date = e.detail.value">
          <view class="picker-value">
            <text :class="form.date ? 'has-value' : 'placeholder'">{{ form.date || '选择日期' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 时间 -->
      <view class="field">
        <text class="field-label">时间（可选）</text>
        <picker mode="time" :value="form.time" @change="e => form.time = e.detail.value">
          <view class="picker-value">
            <text :class="form.time ? 'has-value' : 'placeholder'">{{ form.time || '选择时间（可选）' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
        <text v-if="form.time" class="clear-btn" @click="form.time = ''">清除时间</text>
      </view>

      <!-- 描述 -->
      <view class="field">
        <text class="field-label">备注说明</text>
        <textarea
          class="field-textarea"
          v-model="form.desc"
          placeholder="可选，添加事件详情"
          maxlength="200"
        />
      </view>

      <!-- 颜色标记 -->
      <view class="field">
        <text class="field-label">颜色标记</text>
        <view class="color-options">
          <view
            v-for="c in colors"
            :key="c"
            class="color-btn"
            :style="{ background: c }"
            :class="{ selected: form.color === c }"
            @click="form.color = c"
          >
            <text v-if="form.color === c" class="color-check">✓</text>
          </view>
        </view>
      </view>

      <!-- 提醒开关 -->
      <view class="field field-row">
        <text class="field-label no-mb">开启提醒</text>
        <switch
          :checked="form.remind"
          @change="e => form.remind = e.detail.value"
          color="#4A90D9"
        />
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button class="btn-cancel" @click="goBack">取消</button>
      <button class="btn-save" @click="save" :loading="saving">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addDoc, updateDoc, COLLECTIONS } from '../../utils/db.js'
import { showToast } from '../../utils/helper.js'

const saving = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const colors = ['#4A90D9', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6', '#1abc9c', '#e67e22']

const form = ref({
  title: '',
  date: '',
  time: '',
  desc: '',
  color: '#4A90D9',
  remind: false
})

onLoad((options) => {
  if (options && options.date) {
    form.value.date = options.date
  }
  if (options && options.id) {
    isEdit.value = true
    editId.value = options.id
    uni.setNavigationBarTitle({ title: '编辑事件' })
    // 从缓存读取
    try {
      const raw = uni.getStorageSync(`cache_${COLLECTIONS.EVENT}`)
      if (raw) {
        const list = JSON.parse(raw)
        const item = list.find(i => i._id === options.id)
        if (item) {
          form.value = {
            title: item.title || '',
            date: item.date || '',
            time: item.time || '',
            desc: item.desc || '',
            color: item.color || '#4A90D9',
            remind: item.remind || false
          }
        }
      }
    } catch (e) {}
  }
})

async function save() {
  if (!form.value.title.trim()) { showToast('请输入事件标题'); return }
  if (!form.value.date) { showToast('请选择日期'); return }
  saving.value = true
  try {
    const data = { ...form.value, title: form.value.title.trim() }
    if (isEdit.value && editId.value) {
      await updateDoc(COLLECTIONS.EVENT, editId.value, data)
      showToast('已更新')
    } else {
      await addDoc(COLLECTIONS.EVENT, data)
      showToast('事件已添加 📅')
    }
    setTimeout(() => uni.navigateBack(), 500)
  } catch (e) {
    showToast('保存失败')
  } finally {
    saving.value = false
  }
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f2f6fc;
  padding-bottom: 140rpx;
}
.form-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.04);
}
.field { margin-bottom: 36rpx; }
.field:last-child { margin-bottom: 0; }
.field-label {
  display: block;
  font-size: 26rpx;
  color: #8a9bb0;
  font-weight: 500;
  margin-bottom: 14rpx;
}
.field-label.no-mb { margin-bottom: 0; }
.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}
.field-input {
  width: 100%;
  font-size: 30rpx;
  color: #2c3e50;
  border-bottom: 1rpx solid #eef2f7;
  padding: 12rpx 0;
}
.field-textarea {
  width: 100%;
  font-size: 28rpx;
  color: #2c3e50;
  border: 1rpx solid #eef2f7;
  border-radius: 12rpx;
  padding: 16rpx;
  min-height: 100rpx;
  box-sizing: border-box;
  background: #fafbfc;
}
.picker-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #eef2f7;
  padding: 12rpx 0;
}
.has-value { font-size: 30rpx; color: #2c3e50; }
.placeholder { font-size: 28rpx; color: #c0ccd8; }
.picker-arrow { color: #c0ccd8; font-size: 32rpx; }
.clear-btn { font-size: 24rpx; color: #e74c3c; margin-top: 8rpx; display: block; }

/* 颜色选择 */
.color-options {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}
.color-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.color-btn.selected {
  box-shadow: 0 0 0 3rpx #fff, 0 0 0 6rpx currentColor;
}
.color-check { font-size: 24rpx; color: #fff; font-weight: 700; }

/* 操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  background: #fff;
  box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.06);
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}
.btn-cancel {
  flex: 1;
  border: 2rpx solid #d0d8e4;
  border-radius: 50rpx;
  background: #fff;
  color: #8a9bb0;
  font-size: 30rpx;
  padding: 18rpx 0;
}
.btn-save {
  flex: 2;
  background: #4A90D9;
  border-radius: 50rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  padding: 18rpx 0;
  border: none;
}
</style>
