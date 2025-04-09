<template>
  <view class="special-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input 
          type="text" 
          placeholder="搜索特产" 
          v-model="searchText" 
          @confirm="handleSearch"
        />
      </view>
    </view>
    
    <!-- 分类标签 -->
    <scroll-view class="tab-scroll" scroll-x>
      <view 
        class="tab-item" 
        v-for="(tab, index) in tabs" 
        :key="tab.id"
        :class="{ active: activeTab === index }"
        @click="changeTab(index)"
      >
        {{ tab.name }}
      </view>
    </scroll-view>
    
    <!-- 特产列表 -->
    <view class="special-list">
      <view 
        class="special-item" 
        v-for="item in filteredSpecials" 
        :key="item.id"
        @click="navigateToDetail(item.id)"
      >
        <image class="special-image" :src="item.image" mode="aspectFill" />
        <view class="special-info">
          <text class="special-name">{{ item.name }}</text>
          <text class="special-desc">{{ item.desc }}</text>
          <view class="special-bottom">
            <text class="special-price">¥{{ item.price }}</text>
            <text class="special-sales">销量: {{ item.sales }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchText = ref('')
const activeTab = ref(0)

const tabs = ref([
  { id: 0, name: '全部' },
  { id: 1, name: '鱼类特产' },
  { id: 2, name: '农副产品' },
  { id: 3, name: '手工艺品' }
])

const specials = ref([
  { 
    id: 1, 
    name: '东江鱼干', 
    desc: '传统工艺制作，味道鲜美', 
    price: 68, 
    sales: 256, 
    image: '/static/images/special1.jpg',
    category: 1
  },
  { 
    id: 2, 
    name: '东江鱼酱', 
    desc: '秘制配方，下饭佳品', 
    price: 38, 
    sales: 189, 
    image: '/static/images/special2.jpg',
    category: 1
  },
  { 
    id: 3, 
    name: '东江米酒', 
    desc: '纯粮酿造，醇香浓郁', 
    price: 88, 
    sales: 132, 
    image: '/static/images/special3.jpg',
    category: 2
  },
  { 
    id: 4, 
    name: '手工竹编', 
    desc: '传统工艺，精美实用', 
    price: 45, 
    sales: 87, 
    image: '/static/images/special4.jpg',
    category: 3
  }
])

const filteredSpecials = computed(() => {
  let result = specials.value
  
  // 按分类筛选
  if (activeTab.value > 0) {
    result = result.filter(item => item.category === activeTab.value)
  }
  
  // 按搜索词筛选
  if (searchText.value) {
    result = result.filter(item => 
      item.name.includes(searchText.value) || 
      item.desc.includes(searchText.value)
  )}
  
  return result
})

const changeTab = (index) => {
  activeTab.value = index
}

const handleSearch = () => {
  console.log('搜索:', searchText.value)
}

const navigateToDetail = (id) => {
  uni.navigateTo({ url: `/pages/detail/detail?id=${id}&type=special` })
}
</script>

<style scoped>
.special-page {
  padding-bottom: 20rpx;
}

.search-bar {
  padding: 20rpx;
  background-color: #07c160;
}

.search-input {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 50rpx;
  padding: 10rpx 20rpx;
}

.search-input input {
  flex: 1;
  margin-left: 10rpx;
  font-size: 28rpx;
}

.tab-scroll {
  white-space: nowrap;
  padding: 20rpx;
  background-color: #fff;
}

.tab-item {
  display: inline-block;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #666;
}

.tab-item.active {
  color: #07c160;
  font-weight: bold;
  position: relative;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background-color: #07c160;
  border-radius: 3rpx;
}

.special-list {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;
}

.special-item {
  width: 48%;
  margin: 1%;
  background-color: #fff;
  border-radius: 10rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.special-image {
  width: 100%;
  height: 300rpx;
}

.special-info {
  padding: 20rpx;
}

.special-name {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
}

.special-desc {
  font-size: 24rpx;
  color: #999;
  margin: 10rpx 0;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.special-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.special-price {
  font-size: 32rpx;
  color: #f40;
  font-weight: bold;
}

.special-sales {
  font-size: 24rpx;
  color: #999;
}
</style>