<template>
  <view class="page">
    <view class="form-card">
      <!-- 标题 -->
      <view class="field">
        <text class="field-label">任务标题 *</text>
        <input
          class="field-input"
          v-model="form.title"
          placeholder="输入任务名称"
          maxlength="50"
        />
      </view>

      <!-- 描述 -->
      <view class="field">
        <text class="field-label">备注说明</text>
        <textarea
          class="field-textarea"
          v-model="form.desc"
          placeholder="可选，添加详细说明"
          maxlength="200"
        />
      </view>

      <!-- 优先级 -->
      <view class="field">
        <text class="field-label">优先级</text>
        <view class="priority-options">
          <view
            v-for="p in priorities"
            :key="p.key"
            class="priority-btn"
            :class="{ selected: form.priority === p.key }"
            :style="form.priority === p.key
              ? { background: p.color, color: '#fff', borderColor: p.color }
              : { borderColor: p.color, color: p.color }"
            @click="form.priority = p.key"
          >{{ p.label }}</view>
        </view>
      </view>

      <!-- 截止日期 -->
      <view class="field">
        <text class="field-label">截止日期</text>
        <picker
          mode="date"
          :value="dueDateStr"
          :start="todayStr"
          @change="onDateChange"
        >
          <view class="picker-value">
            <text :class="form.dueDate ? 'has-value' : 'placeholder'">
              {{ form.dueDate ? formatDate(form.dueDate, 'YYYY年MM月DD日') : '选择截止日期（可选）' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
        <text v-if="form.dueDate" class="clear-btn" @click="form.dueDate = null">清除</text>
      </view>

      <!-- 标签 -->
      <view class="field">
        <text class="field-label">标签</text>
        <view class="tags-row">
          <view
            v-for="tag in form.tags"
            :key="tag"
            class="tag-chip"
          >
            <text class="tag-text">#{{ tag }}</text>
            <text class="tag-del" @click="removeTag(tag)">×</text>
          </view>
          <view class="tag-add-wrap" v-if="!showTagInput">
            <text class="tag-add-btn" @click="showTagInput = true">+ 添加标签</text>
          </view>
          <input
            v-else
            class="tag-input"
            v-model="newTag"
            placeholder="标签名后回车"
            @confirm="addTag"
            @blur="addTag"
            focus
            maxlength="10"
          />
        </view>
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
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getTodos, saveTodos } from '../../utils/storage.js'
import { formatDate, PRIORITY_MAP, showToast } from '../../utils/helper.js'

const saving = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const form = ref({
  title: '',
  desc: '',
  priority: 'medium',
  dueDate: null,
  tags: [],
  done: false
})

const priorities = [
  { key: 'high', label: '高优', color: '#e74c3c' },
  { key: 'medium', label: '中等', color: '#f39c12' },
  { key: 'low', label: '低优', color: '#27ae60' }
]

const todayStr = formatDate(null, 'YYYY-MM-DD')
const dueDateStr = computed(() =>
  form.value.dueDate ? formatDate(form.value.dueDate, 'YYYY-MM-DD') : todayStr
)

// 标签
const showTagInput = ref(false)
const newTag = ref('')
function addTag() {
  const t = newTag.value.trim()
  if (t && !form.value.tags.includes(t)) {
    form.value.tags.push(t)
  }
  newTag.value = ''
  showTagInput.value = false
}
function removeTag(tag) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

function onDateChange(e) {
  const dateStr = e.detail.value // 'YYYY-MM-DD'
  form.value.dueDate = new Date(dateStr + 'T23:59:59').getTime()
}

onLoad((options) => {
  if (options && options.id) {
    isEdit.value = true
    editId.value = options.id
    uni.setNavigationBarTitle({ title: '编辑待办' })
    try {
      const list = getTodos()
      const item = list.find(i => i._id === options.id)
      if (item) {
        form.value = {
          title: item.title || '',
          desc: item.desc || '',
          priority: item.priority || 'medium',
          dueDate: item.dueDate || null,
          tags: item.tags || [],
          done: item.done || false
        }
      }
    } catch (e) {}
  }
})

function save() {
  if (!form.value.title.trim()) {
    showToast('请输入任务标题')
    return
  }
  saving.value = true
  try {
    const data = { ...form.value, title: form.value.title.trim() }
    const list = getTodos()
    if (isEdit.value && editId.value) {
      const idx = list.findIndex(i => i._id === editId.value)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data, updatedAt: Date.now() }
      }
      saveTodos(list)
      showToast('已更新')
    } else {
      const newItem = {
        _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      list.unshift(newItem)
      saveTodos(list)
      showToast('已添加 ✅')
    }
    setTimeout(() => uni.navigateBack(), 500)
  } catch (e) {
    showToast('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #EDF4FB;
  padding-bottom: 140rpx;
}

.form-card {
  background: #fff;
  border-radius: 28rpx;
  margin: 24rpx;
  padding: 36rpx;
  box-shadow: 0 4rpx 20rpx rgba(74,144,217,0.08);
  border: 1rpx solid #D6E9F7;
}

.field { margin-bottom: 36rpx; }
.field:last-child { margin-bottom: 0; }
.field-label {
  display: block; font-size: 24rpx; color: #8FAEC8;
  font-weight: 600; margin-bottom: 14rpx; letter-spacing: 1rpx;
}
.field-input {
  width: 100%; font-size: 30rpx; color: #1E3A5C;
  border-bottom: 1rpx solid #D6E9F7;
  padding: 12rpx 0; box-sizing: border-box;
}
.field-textarea {
  width: 100%; font-size: 28rpx; color: #1E3A5C;
  border: 1rpx solid #D6E9F7; border-radius: 16rpx;
  padding: 16rpx; min-height: 120rpx; box-sizing: border-box;
  background: #EEF4FA;
}

/* 优先级 */
.priority-options { display: flex; gap: 20rpx; }
.priority-btn {
  flex: 1; text-align: center; padding: 16rpx 0;
  border-radius: 50rpx; border: 2rpx solid;
  font-size: 26rpx; font-weight: 600; transition: all 0.2s;
}

/* 日期选择 */
.picker-value {
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1rpx solid #D6E9F7; padding: 12rpx 0;
}
.has-value { font-size: 30rpx; color: #1E3A5C; }
.placeholder { font-size: 28rpx; color: #B8D4EC; }
.picker-arrow { color: #B8D4EC; font-size: 32rpx; }
.clear-btn { font-size: 24rpx; color: #E05C5C; margin-top: 8rpx; display: block; }

/* 标签 */
.tags-row { display: flex; flex-wrap: wrap; gap: 12rpx; align-items: center; }
.tag-chip {
  display: flex; align-items: center;
  background: #E3F2FC; border-radius: 20rpx; padding: 8rpx 16rpx; gap: 6rpx;
}
.tag-text { font-size: 24rpx; color: #4A90D9; }
.tag-del { font-size: 28rpx; color: #4A90D9; line-height: 1; }
.tag-add-btn {
  font-size: 24rpx; color: #4A90D9;
  border: 1rpx dashed #6EB3F0; border-radius: 20rpx; padding: 6rpx 16rpx;
}
.tag-input {
  font-size: 26rpx; border-bottom: 1rpx solid #4A90D9;
  padding: 4rpx 8rpx; min-width: 120rpx; color: #1E3A5C;
}

/* 操作栏 */
.action-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; gap: 24rpx; padding: 24rpx 32rpx;
  background: rgba(255,255,255,0.96); backdrop-filter: blur(16px);
  box-shadow: 0 -2rpx 20rpx rgba(74,144,217,0.10);
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}
.btn-cancel {
  flex: 1; border: 2rpx solid #B8D4EC; border-radius: 50rpx;
  background: #fff; color: #8FAEC8;
  font-size: 30rpx; padding: 18rpx 0;
}
.btn-save {
  flex: 2; background: linear-gradient(135deg, #4A90D9, #3ABFBF);
  border-radius: 50rpx; color: #fff;
  font-size: 30rpx; font-weight: 700; padding: 18rpx 0; border: none;
  box-shadow: 0 4rpx 16rpx rgba(74,144,217,0.28);
}
</style>
