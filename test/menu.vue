<template>
  <view class="menu-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input 
          type="text" 
          placeholder="搜索菜品" 
          v-model="searchText" 
          @confirm="handleSearch"
        />
      </view>
    </view>
    
    <!-- 分类和菜品 -->
    <view class="menu-container">
      <!-- 左侧分类 -->
      <scroll-view class="category-list" scroll-y>
        <view 
          class="category-item" 
          v-for="(item, index) in categories" 
          :key="item.id"
          :class="{ active: activeCategory === index }"
          @click="changeCategory(index)"
        >
          {{ item.name }}
        </view>
      </scroll-view>
      
      <!-- 右侧菜品 -->
      <scroll-view class="food-list" scroll-y :scroll-top="scrollTop">
        <view class="food-section" v-for="category in categories" :key="category.id" :id="'category-'+category.id">
          <view class="section-title">{{ category.name }}</view>
          <view 
            class="food-item" 
            v-for="food in category.foods" 
            :key="food.id"
            @click="navigateToDetail(food.id)"
          >
            <image class="food-image" :src="food.image" mode="aspectFill" />
            <view class="food-info">
              <text class="food-name">{{ food.name }}</text>
              <text class="food-desc">{{ food.desc }}</text>
              <text class="food-sales">月售{{ food.sales }}份</text>
              <view class="food-price">
                <text class="price">¥{{ food.price }}</text>
                <view class="cart-btn">
                  <uni-icons 
                    type="minus" 
                    size="20" 
                    color="#999" 
                    @click.stop="decreaseCart(food)" 
                    v-if="cartMap[food.id]"
                  ></uni-icons>
                  <text class="cart-num" v-if="cartMap[food.id]">{{ cartMap[food.id] }}</text>
                  <uni-icons 
                    type="plus" 
                    size="20" 
                    color="#07c160" 
                    @click.stop="addToCart(food)"
                  ></uni-icons>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 购物车底部 -->
    <view class="cart-footer" v-if="totalCount > 0">
      <view class="cart-icon">
        <uni-icons type="cart" size="30" color="#fff"></uni-icons>
        <view class="cart-badge" v-if="totalCount > 0">{{ totalCount }}</view>
      </view>
      <view class="cart-info">
        <text class="total-price">¥{{ totalPrice }}</text>
        <text class="delivery-fee">另需配送费¥{{ deliveryFee }}</text>
      </view>
      <view class="checkout-btn" @click="navigateToCart">去结算</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/store/cart'

const cartStore = useCartStore()

const searchText = ref('')
const activeCategory = ref(0)
const scrollTop = ref(0)

// 模拟分类数据
const categories = ref([
  {
    id: 1,
    name: '招牌推荐',
    foods: [
      { id: 101, name: '东江鱼头王', desc: '精选东江大鱼头，配以秘制酱料', price: 128, sales: 256, image: '/static/images/fish1.jpg' },
      { id: 102, name: '清蒸东江鱼', desc: '原汁原味，鲜嫩可口', price: 98, sales: 189, image: '/static/images/fish2.jpg' }
    ]
  },
  {
    id: 2,
    name: '热销菜品',
    foods: [
      { id: 201, name: '香辣鱼块', desc: '香辣可口，下饭佳品', price: 88, sales: 203, image: '/static/images/fish3.jpg' },
      { id: 202, name: '鱼丸汤', desc: '手工鱼丸，汤鲜味美', price: 58, sales: 178, image: '/static/images/fish4.jpg' }
    ]
  },
  // 更多分类...
])

// 购物车相关
const cartMap = computed(() => cartStore.cartMap)
const totalCount = computed(() => cartStore.totalCount)
const totalPrice = computed(() => cartStore.totalPrice)
const deliveryFee = ref(5)

const changeCategory = (index) => {
  activeCategory.value = index
  scrollTop.value = document.getElementById(`category-${categories.value[index].id}`).offsetTop
}

const handleSearch = () => {
  // 搜索逻辑
  console.log('搜索:', searchText.value)
}

const addToCart = (food) => {
  cartStore.addToCart(food)
}

const decreaseCart = (food) => {
  cartStore.decreaseCart(food)
}

const navigateToDetail = (id) => {
  uni.navigateTo({ url: `/pages/detail/detail?id=${id}` })
}

const navigateToCart = () => {
  uni.navigateTo({ url: '/pages/cart/cart' })
}
</script>

<style scoped>
.menu-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
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

.menu-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.category-list {
  width: 160rpx;
  background-color: #f8f8f8;
}

.category-item {
  padding: 30rpx 10rpx;
  text-align: center;
  font-size: 26rpx;
  border-left: 6rpx solid transparent;
}

.category-item.active {
  background-color: #fff;
  border-left-color: #07c160;
  color: #07c160;
  font-weight: bold;
}

.food-list {
  flex: 1;
  padding: 0 20rpx;
}

.food-section {
  padding: 20rpx 0;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin: 20rpx 0;
}

.food-item {
  display: flex;
  margin-bottom: 30rpx;
}

.food-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 10rpx;
}

.food-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.food-name {
  font-size: 28rpx;
  font-weight: bold;
}

.food-desc {
  font-size: 24rpx;
  color: #999;
  margin: 10rpx 0;
}

.food-sales {
  font-size: 22rpx;
  color: #999;
}

.food-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.price {
  font-size: 32rpx;
  color: #f40;
  font-weight: bold;
}

.cart-btn {
  display: flex;
  align-items: center;
}

.cart-num {
  margin: 0 20rpx;
  font-size: 26rpx;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #3d3d3d;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  color: #fff;
}

.cart-icon {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  background-color: #07c160;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cart-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background-color: #f40;
  color: #fff;
  font-size: 20rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cart-info {
  flex: 1;
  margin-left: 20rpx;
}

.total-price {
  font-size: 32rpx;
  font-weight: bold;
}

.delivery-fee {
  font-size: 24rpx;
  color: #999;
  margin-left: 20rpx;
}

.checkout-btn {
  background-color: #07c160;
  padding: 0 40rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 35rpx;
  font-weight: bold;
}
</style>