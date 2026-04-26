<template>
  <view class="page">
    <!-- 类型选择（新增时显示） -->
    <view class="type-selector" v-if="!isEdit">
      <view
        v-for="t in types"
        :key="t.key"
        class="type-btn"
        :class="{ active: form.type === t.key }"
        @click="form.type = t.key"
      >
        <text class="type-emoji">{{ t.icon }}</text>
        <text class="type-label">{{ t.label }}</text>
        <text class="type-desc">{{ t.desc }}</text>
      </view>
    </view>

    <view class="form-card">
      <!-- 物品名称 -->
      <view class="field">
        <text class="field-label">物品名称 *</text>
        <input
          class="field-input"
          v-model="form.name"
          placeholder="输入物品名称"
          maxlength="30"
        />
      </view>

      <!-- 存放位置 -->
      <view class="field">
        <text class="field-label">存放位置</text>
        <input
          class="field-input"
          v-model="form.location"
          placeholder="如：卧室衣柜第二层、冰箱冷藏区"
          maxlength="50"
        />
      </view>

      <!-- 过期日期（过期提醒类型） -->
      <view class="field" v-if="form.type !== 'valuable'">
        <text class="field-label">过期/到期日期</text>
        <picker
          mode="date"
          :value="expiryDateStr"
          @change="onExpiryChange"
        >
          <view class="picker-value">
            <text :class="form.expiryDate ? 'has-value' : 'placeholder'">
              {{ form.expiryDate ? formatD(form.expiryDate) : '选择过期日期（可选）' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
        <text v-if="form.expiryDate" class="clear-btn" @click="form.expiryDate = null">清除</text>
      </view>

      <!-- 图标选择（贵重物品） -->
      <view class="field" v-if="form.type === 'valuable'">
        <text class="field-label">物品图标</text>
        <view class="icon-options">
          <view
            v-for="ic in valuableIcons"
            :key="ic"
            class="icon-btn"
            :class="{ selected: form.icon === ic }"
            @click="form.icon = ic"
          >{{ ic }}</view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="field">
        <text class="field-label">备注说明</text>
        <textarea
          class="field-textarea"
          v-model="form.note"
          :placeholder="form.type === 'valuable' ? '如：保修卡放在书桌抽屉里，购于2024年' : '可选，如：从超市XX购买'"
          maxlength="200"
        />
      </view>

      <!-- 数量（可选） -->
      <view class="field">
        <text class="field-label">数量</text>
        <input
          class="field-input"
          v-model="form.quantity"
          placeholder="如：2个、1盒（可选）"
          maxlength="20"
        />
      </view>

      <!-- 购买日期（可选） -->
      <view class="field">
        <text class="field-label">购买日期</text>
        <picker
          mode="date"
          :value="purchaseDateStr"
          @change="onPurchaseChange"
        >
          <view class="picker-value">
            <text :class="form.purchaseDate ? 'has-value' : 'placeholder'">
              {{ form.purchaseDate ? formatD(form.purchaseDate) : '选择购买日期（可选）' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
        <text v-if="form.purchaseDate" class="clear-btn" @click="form.purchaseDate = null">清除</text>
      </view>
    </view>

    <!-- 操作 -->
    <view class="action-bar">
      <button class="btn-cancel" @click="goBack">取消</button>
      <button class="btn-save" @click="save" :loading="saving">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addDoc, updateDoc, COLLECTIONS } from '../../utils/db.js'
import { formatDate, showToast } from '../../utils/helper.js'

const saving = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const types = [
  { key: 'expiry', label: '过期提醒', icon: '📦', desc: '食品、药品等' },
  { key: 'valuable', label: '贵重物品', icon: '💎', desc: '记录存放位置' }
]

const valuableIcons = ['💎', '💍', '👜', '💻', '📷', '🎸', '⌚', '📱', '🔑', '💳', '📄', '🏆']

const form = ref({
  name: '',
  type: 'expiry',
  location: '',
  expiryDate: null,
  purchaseDate: null,
  note: '',
  quantity: '',
  icon: '💎'
})

const expiryDateStr = computed(() =>
  form.value.expiryDate ? formatDate(form.value.expiryDate, 'YYYY-MM-DD') : formatDate(null, 'YYYY-MM-DD')
)
const purchaseDateStr = computed(() =>
  form.value.purchaseDate ? formatDate(form.value.purchaseDate, 'YYYY-MM-DD') : formatDate(null, 'YYYY-MM-DD')
)

function onExpiryChange(e) {
  const d = e.detail.value
  form.value.expiryDate = new Date(d + 'T23:59:59').getTime()
}
function onPurchaseChange(e) {
  const d = e.detail.value
  form.value.purchaseDate = new Date(d + 'T00:00:00').getTime()
}

const formatD = (ts) => formatDate(ts, 'YYYY-MM-DD')

onLoad((options) => {
  if (options && options.type) {
    form.value.type = options.type === 'valuable' ? 'valuable' : 'expiry'
  }
  if (options && options.id) {
    isEdit.value = true
    editId.value = options.id
    uni.setNavigationBarTitle({ title: '编辑物品' })
    try {
      const raw = uni.getStorageSync(`cache_${COLLECTIONS.ITEM}`)
      if (raw) {
        const list = JSON.parse(raw)
        const item = list.find(i => i._id === options.id)
        if (item) {
          form.value = {
            name: item.name || '',
            type: item.type || 'expiry',
            location: item.location || '',
            expiryDate: item.expiryDate || null,
            purchaseDate: item.purchaseDate || null,
            note: item.note || '',
            quantity: item.quantity || '',
            icon: item.icon || '💎'
          }
        }
      }
    } catch (e) {}
  }
})

async function save() {
  if (!form.value.name.trim()) { showToast('请输入物品名称'); return }
  saving.value = true
  try {
    const data = { ...form.value, name: form.value.name.trim() }
    if (isEdit.value && editId.value) {
      await updateDoc(COLLECTIONS.ITEM, editId.value, data)
      showToast('已更新')
    } else {
      await addDoc(COLLECTIONS.ITEM, data)
      showToast('物品已记录 ✅')
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

/* 类型选择 */
.type-selector {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
}
.type-btn {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2rpx solid transparent;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
  transition: all 0.2s;
}
.type-btn.active {
  border-color: #4A90D9;
  background: #eaf4fe;
}
.type-emoji { font-size: 52rpx; margin-bottom: 10rpx; }
.type-label { font-size: 28rpx; font-weight: 600; color: #2c3e50; margin-bottom: 4rpx; }
.type-desc { font-size: 22rpx; color: #8a9bb0; }

.form-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 0 24rpx 24rpx;
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
  min-height: 110rpx;
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

/* 图标 */
.icon-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.icon-btn {
  font-size: 44rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  background: #f5f8fc;
}
.icon-btn.selected {
  border-color: #4A90D9;
  background: #eaf4fe;
}

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
