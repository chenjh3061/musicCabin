<template>
  <view class="page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="filter-tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <text class="tab-count" v-if="tab.count > 0">{{ tab.count }}</text>
      </view>
    </view>

    <!-- 待办列表 -->
    <view class="list-container">
      <view v-if="filteredTodos.length === 0" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">{{ activeTab === 'done' ? '还没有完成的任务' : '太棒了，没有待办事项' }}</text>
      </view>

      <view
        v-for="todo in filteredTodos"
        :key="todo._id"
        class="todo-card"
        :class="{ done: todo.done }"
      >
        <!-- 完成按钮 -->
        <view class="todo-check" @click.stop="toggleDone(todo)">
          <view class="check-circle" :class="{ checked: todo.done }">
            <text v-if="todo.done" class="check-icon">✓</text>
          </view>
        </view>

        <!-- 内容区 -->
        <view class="todo-content" @click="editTodo(todo)">
          <view class="todo-title-row">
            <text class="todo-title" :class="{ 'text-done': todo.done }">{{ todo.title }}</text>
            <view
              class="priority-badge"
              :style="{
                color: PRIORITY_MAP[todo.priority]?.color || '#999',
                background: PRIORITY_MAP[todo.priority]?.bg || '#f5f5f5'
              }"
            >{{ PRIORITY_MAP[todo.priority]?.label || '中' }}</view>
          </view>
          <text class="todo-desc" v-if="todo.desc">{{ todo.desc }}</text>
          <view class="todo-meta">
            <text class="meta-date" v-if="todo.dueDate">
              📅 {{ formatDate(todo.dueDate, 'MM月DD日') }}
              <text
                v-if="isDueSoon(todo)"
                class="due-warn"
              > · {{ getDueLabel(todo) }}</text>
            </text>
            <text
              v-if="todo.tags && todo.tags.length"
              class="meta-tag"
              v-for="tag in todo.tags"
              :key="tag"
            >#{{ tag }}</text>
          </view>
        </view>

        <!-- 删除 -->
        <view class="todo-del" @click.stop="deleteTodo(todo)">
          <text class="del-icon">×</text>
        </view>
      </view>
    </view>

    <!-- 悬浮新增按钮 -->
    <view class="fab" @click="addTodo">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getDocs, updateDoc, deleteDoc, COLLECTIONS } from '../../utils/db.js'
import { formatDate, PRIORITY_MAP, daysFromNow, showToast, showConfirm } from '../../utils/helper.js'

const allTodos = ref([])
const activeTab = ref('pending')

const tabs = computed(() => [
  { key: 'pending', label: '待完成', count: allTodos.value.filter(t => !t.done).length },
  { key: 'done', label: '已完成', count: 0 },
  { key: 'all', label: '全部', count: 0 }
])

const filteredTodos = computed(() => {
  if (activeTab.value === 'pending') return allTodos.value.filter(t => !t.done)
  if (activeTab.value === 'done') return allTodos.value.filter(t => t.done)
  return allTodos.value
})

async function loadTodos() {
  const res = await getDocs(COLLECTIONS.TODO)
  if (res.success) {
    allTodos.value = (res.data || []).sort((a, b) => {
      // 排序：未完成优先，再按优先级，再按截止日期
      if (a.done !== b.done) return a.done ? 1 : -1
      const pOrder = { high: 0, medium: 1, low: 2 }
      const pDiff = (pOrder[a.priority] || 1) - (pOrder[b.priority] || 1)
      if (pDiff !== 0) return pDiff
      return (a.dueDate || 9999999999999) - (b.dueDate || 9999999999999)
    })
  }
}

onShow(() => { loadTodos() })

async function toggleDone(todo) {
  await updateDoc(COLLECTIONS.TODO, todo._id, { done: !todo.done })
  todo.done = !todo.done
  showToast(todo.done ? '已完成 ✅' : '已撤销完成')
}

async function deleteTodo(todo) {
  const ok = await showConfirm(`确认删除「${todo.title}」？`)
  if (!ok) return
  await deleteDoc(COLLECTIONS.TODO, todo._id)
  allTodos.value = allTodos.value.filter(t => t._id !== todo._id)
  showToast('已删除')
}

function addTodo() {
  uni.navigateTo({ url: '/pages/todo/todoEdit' })
}

function editTodo(todo) {
  uni.navigateTo({ url: `/pages/todo/todoEdit?id=${todo._id}` })
}

function isDueSoon(todo) {
  if (todo.done || !todo.dueDate) return false
  return daysFromNow(todo.dueDate) <= 3
}

function getDueLabel(todo) {
  const d = daysFromNow(todo.dueDate)
  if (d < 0) return '已过期'
  if (d === 0) return '今天截止'
  return `${d}天后截止`
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f2f6fc;
  padding-bottom: 140rpx;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  background: #fff;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #eef2f7;
  position: sticky;
  top: 0;
  z-index: 10;
}
.filter-tab {
  flex: 1;
  text-align: center;
  padding: 28rpx 0;
  font-size: 28rpx;
  color: #8a9bb0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}
.filter-tab.active {
  color: #4A90D9;
  font-weight: 600;
}
.filter-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  right: 25%;
  height: 4rpx;
  background: #4A90D9;
  border-radius: 2rpx;
}
.tab-count {
  font-size: 20rpx;
  background: #e74c3c;
  color: #fff;
  border-radius: 20rpx;
  padding: 2rpx 8rpx;
  min-width: 32rpx;
  text-align: center;
}

/* 列表 */
.list-container {
  padding: 20rpx 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}
.empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #b0bec5; }

/* 待办卡片 */
.todo-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
  transition: opacity 0.2s;
}
.todo-card.done {
  opacity: 0.6;
}

/* 勾选 */
.todo-check {
  margin-right: 20rpx;
  margin-top: 4rpx;
  flex-shrink: 0;
}
.check-circle {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid #d0d8e4;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.check-circle.checked {
  background: #4A90D9;
  border-color: #4A90D9;
}
.check-icon {
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

/* 内容 */
.todo-content {
  flex: 1;
  min-width: 0;
}
.todo-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}
.todo-title {
  font-size: 30rpx;
  color: #2c3e50;
  font-weight: 500;
  flex: 1;
}
.todo-title.text-done {
  text-decoration: line-through;
  color: #b0bec5;
}
.priority-badge {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-weight: 600;
  flex-shrink: 0;
}
.todo-desc {
  font-size: 26rpx;
  color: #8a9bb0;
  margin-bottom: 10rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.todo-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}
.meta-date {
  font-size: 22rpx;
  color: #8a9bb0;
}
.due-warn {
  color: #e74c3c;
  font-weight: 600;
}
.meta-tag {
  font-size: 20rpx;
  color: #4A90D9;
  background: #eaf4fe;
  padding: 2rpx 10rpx;
  border-radius: 20rpx;
}

/* 删除按钮 */
.todo-del {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8rpx;
  flex-shrink: 0;
}
.del-icon {
  font-size: 40rpx;
  color: #c0ccd8;
  line-height: 1;
}

/* 悬浮按钮 */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 160rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #4A90D9;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(74,144,217,0.4);
  z-index: 100;
}
.fab-icon {
  font-size: 60rpx;
  color: #fff;
  line-height: 1;
  margin-top: -4rpx;
}
</style>
