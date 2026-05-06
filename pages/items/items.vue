<template>
  <view class="page">
    <!-- 标签栏 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >{{ tab.label }}</view>
    </view>

    <!-- 搜索框 -->
    <view class="search-bar">
      <view class="search-inner">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索物品名称、位置..."
          @input="onSearch"
        />
        <text v-if="keyword" class="search-clear" @click="keyword = ''">×</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="displayList.length === 0" class="empty-state">
      <text class="empty-icon">{{ activeTab === 'expiry' ? '⏰' : '📦' }}</text>
      <text class="empty-text">{{ emptyText }}</text>
    </view>

    <!-- 物品列表 -->
    <view class="list-container">
      <!-- 过期提醒Tab：按紧急程度分组 -->
      <template v-if="activeTab === 'expiry'">
        <view v-for="group in expiryGroups" :key="group.key">
          <view class="group-header" v-if="group.items.length > 0">
            <view class="group-dot" :style="{ background: group.color }"></view>
            <text class="group-label" :style="{ color: group.color }">{{ group.label }}</text>
            <text class="group-count">{{ group.items.length }}</text>
          </view>
          <view
            v-for="item in group.items"
            :key="item._id"
            class="item-card"
            @click="viewItem(item)"
          >
            <view class="item-main">
              <text class="item-name">{{ item.name }}</text>
              <view class="item-meta">
                <text class="meta-text" v-if="item.location">📍 {{ item.location }}</text>
              </view>
            </view>
            <view class="item-right">
              <view class="expiry-badge" :style="{ color: getExpiry(item.expiryDate).color }">
                {{ getExpiry(item.expiryDate).label }}
              </view>
              <text class="expiry-date">{{ formatD(item.expiryDate) }}</text>
            </view>
            <view class="item-del" @click.stop="deleteItem(item)">
              <text class="del-icon">×</text>
            </view>
          </view>
        </view>
      </template>

      <!-- 贵重物品Tab -->
      <template v-else-if="activeTab === 'valuable'">
        <view
          v-for="item in displayList"
          :key="item._id"
          class="item-card"
          @click="viewItem(item)"
        >
          <view class="valuable-icon">{{ item.icon || '💎' }}</view>
          <view class="item-main">
            <text class="item-name">{{ item.name }}</text>
            <view class="location-row" v-if="item.location">
              <text class="location-tag">📍 {{ item.location }}</text>
            </view>
            <text class="item-note" v-if="item.note">{{ item.note }}</text>
          </view>
          <view class="item-del" @click.stop="deleteItem(item)">
            <text class="del-icon">×</text>
          </view>
        </view>
      </template>

      <!-- 全部物品Tab -->
      <template v-else>
        <view
          v-for="item in displayList"
          :key="item._id"
          class="item-card"
          @click="viewItem(item)"
        >
          <view class="item-type-badge" :style="{ background: getTypeBg(item.type) }">
            <text class="type-icon">{{ getTypeIcon(item.type) }}</text>
          </view>
          <view class="item-main">
            <text class="item-name">{{ item.name }}</text>
            <view class="item-meta">
              <text class="meta-text" v-if="item.location">📍 {{ item.location }}</text>
              <text class="meta-text" v-if="item.expiryDate">
                ⏰ {{ getExpiry(item.expiryDate).label }}
              </text>
            </view>
          </view>
          <view class="item-del" @click.stop="deleteItem(item)">
            <text class="del-icon">×</text>
          </view>
        </view>
      </template>
    </view>

    <!-- 悬浮按钮 -->
    <view class="fab" @click="addItem">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { getItems, saveItems } from '../../utils/storage.js'
import { formatDate, getExpiryStatus, daysFromNow, showToast, showConfirm } from '../../utils/helper.js'

const activeTab = ref('all')
const keyword = ref('')
const allItems = ref([])

const tabs = [
  { key: 'all', label: '全部物品' },
  { key: 'expiry', label: '⏰ 过期提醒' },
  { key: 'valuable', label: '💎 贵重物品' }
]

const emptyText = computed(() => {
  if (keyword.value) return `没有找到「${keyword.value}」相关物品`
  if (activeTab.value === 'expiry') return '没有需要关注的过期物品'
  if (activeTab.value === 'valuable') return '还没有记录贵重物品，点击 + 添加'
  return '还没有物品记录，点击 + 添加'
})

// 过滤后的列表
const filteredItems = computed(() => {
  let list = allItems.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(i =>
      (i.name || '').toLowerCase().includes(kw) ||
      (i.location || '').toLowerCase().includes(kw) ||
      (i.note || '').toLowerCase().includes(kw)
    )
  }
  if (activeTab.value === 'expiry') {
    return list.filter(i => i.expiryDate)
  }
  if (activeTab.value === 'valuable') {
    return list.filter(i => i.type === 'valuable')
  }
  return list
})

const displayList = computed(() => filteredItems.value)

// 过期分组
const expiryGroups = computed(() => {
  const items = filteredItems.value
  const expired = items.filter(i => daysFromNow(i.expiryDate) < 0)
  const urgent = items.filter(i => daysFromNow(i.expiryDate) >= 0 && daysFromNow(i.expiryDate) <= 3)
  const soon = items.filter(i => daysFromNow(i.expiryDate) > 3 && daysFromNow(i.expiryDate) <= 30)
  const normal = items.filter(i => daysFromNow(i.expiryDate) > 30)
  return [
    { key: 'expired', label: '已过期', color: '#e74c3c', items: expired },
    { key: 'urgent', label: '紧急（3天内）', color: '#e67e22', items: urgent },
    { key: 'soon', label: '即将到期（30天内）', color: '#f39c12', items: soon },
    { key: 'normal', label: '充裕', color: '#27ae60', items: normal }
  ].filter(g => g.items.length > 0)
})

const getExpiry = (ts) => getExpiryStatus(ts)
const formatD = (ts) => formatDate(ts, 'YYYY-MM-DD')

function getTypeIcon(type) {
  const map = { expiry: '📦', valuable: '💎', other: '📝' }
  return map[type] || '📝'
}
function getTypeBg(type) {
  const map = { expiry: '#fff3e0', valuable: '#fce4ec', other: '#e3f2fd' }
  return map[type] || '#e3f2fd'
}

function loadItems() {
  allItems.value = getItems()
}

onShow(() => { loadItems() })

onLoad((options) => {
  if (options && options.tab) {
    activeTab.value = options.tab
  }
})

function switchTab(key) {
  activeTab.value = key
  keyword.value = ''
}

function onSearch() {}

async function deleteItem(item) {
  const ok = await showConfirm(`删除「${item.name}」？`)
  if (!ok) return
  allItems.value = allItems.value.filter(i => i._id !== item._id)
  saveItems(allItems.value)
  showToast('已删除')
}

function addItem() {
  uni.navigateTo({ url: `/pages/items/itemDetail?type=${activeTab.value === 'valuable' ? 'valuable' : 'expiry'}` })
}

function viewItem(item) {
  uni.navigateTo({ url: `/pages/items/itemDetail?id=${item._id}` })
}
</script>

<style scoped>
.page { min-height: 100vh; background: #EDF4FB; padding-bottom: 140rpx; }

/* 标签栏 */
.tab-bar {
  display: flex; background: #fff;
  border-bottom: 1rpx solid #D6E9F7;
  position: sticky; top: 0; z-index: 10;
  box-shadow: 0 2rpx 10rpx rgba(74,144,217,0.07);
}
.tab-item {
  flex: 1; text-align: center; padding: 28rpx 0;
  font-size: 26rpx; color: #8FAEC8; position: relative;
}
.tab-item.active { color: #4A90D9; font-weight: 700; }
.tab-item.active::after {
  content: ''; position: absolute; bottom: 0;
  left: 20%; right: 20%; height: 4rpx;
  background: linear-gradient(90deg, #4A90D9, #3ABFBF); border-radius: 2rpx;
}

/* 搜索栏 */
.search-bar { padding: 16rpx 24rpx; background: #EDF4FB; }
.search-inner {
  display: flex; align-items: center;
  background: #fff; border-radius: 50rpx;
  padding: 14rpx 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(74,144,217,0.07);
  border: 1rpx solid #D6E9F7;
}
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-input { flex: 1; font-size: 28rpx; color: #1E3A5C; }
.search-clear { font-size: 36rpx; color: #B8D4EC; padding: 0 4rpx; }

/* 空状态 */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 0; }
.empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #8FAEC8; }

.list-container { padding: 0 24rpx 20rpx; }

/* 分组标题 */
.group-header { display: flex; align-items: center; padding: 24rpx 0 12rpx; gap: 12rpx; }
.group-dot { width: 12rpx; height: 12rpx; border-radius: 50%; }
.group-label { font-size: 26rpx; font-weight: 700; }
.group-count {
  font-size: 22rpx; color: #8FAEC8;
  background: #E3F2FC; border-radius: 20rpx; padding: 2rpx 10rpx;
}

/* 物品卡片 */
.item-card {
  display: flex; align-items: center;
  background: #fff; border-radius: 24rpx;
  padding: 24rpx; margin-bottom: 16rpx;
  box-shadow: 0 3rpx 14rpx rgba(74,144,217,0.08);
  border: 1rpx solid #E3F2FC;
}
.item-type-badge {
  width: 72rpx; height: 72rpx; border-radius: 18rpx;
  display: flex; align-items: center; justify-content: center;
  margin-right: 20rpx; flex-shrink: 0;
}
.type-icon { font-size: 36rpx; }
.valuable-icon { font-size: 44rpx; margin-right: 20rpx; flex-shrink: 0; }
.item-main { flex: 1; min-width: 0; }
.item-name { display: block; font-size: 30rpx; font-weight: 600; color: #1E3A5C; margin-bottom: 8rpx; }
.item-meta { display: flex; gap: 16rpx; flex-wrap: wrap; }
.meta-text { font-size: 22rpx; color: #8FAEC8; }
.location-row { margin-bottom: 6rpx; }
.location-tag { font-size: 24rpx; color: #4A90D9; background: #E3F2FC; padding: 4rpx 12rpx; border-radius: 12rpx; }
.item-note { font-size: 24rpx; color: #8FAEC8; margin-top: 6rpx; display: block; }

.item-right { display: flex; flex-direction: column; align-items: flex-end; margin-right: 8rpx; }
.expiry-badge { font-size: 24rpx; font-weight: 700; margin-bottom: 4rpx; }
.expiry-date { font-size: 20rpx; color: #B8D4EC; }

.item-del { width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; }
.del-icon { font-size: 40rpx; color: #B8D4EC; }

/* FAB */
.fab {
  position: fixed; right: 40rpx; bottom: 160rpx;
  width: 100rpx; height: 100rpx; border-radius: 50%;
  background: linear-gradient(135deg, #4A90D9, #3ABFBF);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(74,144,217,0.38); z-index: 100;
}
.fab-icon { font-size: 60rpx; color: #fff; line-height: 1; margin-top: -4rpx; }
</style>
