<template>
  <view class="detail-page">
    <!-- 图片轮播 -->
    <swiper class="swiper" :autoplay="true" :interval="3000" :circular="true">
      <swiper-item v-for="(img, index) in detail.images" :key="index">
        <image class="swiper-image" :src="img" mode="aspectFill" />
      </swiper-item>
    </swiper>
    
    <!-- 商品信息 -->
    <view class="info-card">
      <view class="price-section">
        <text class="price">¥{{ detail.price }}</text>
        <text class="original-price" v-if="detail.originalPrice">¥{{ detail.originalPrice }}</text>
        <text class="discount" v-if="detail.discount">{{ detail.discount }}折</text>
      </view>
      <text class="name">{{ detail.name }}</text>
      <text class="desc">{{ detail.desc }}</text>
      <view class="sales">
        <text>月售{{ detail.sales }}份</text>
        <text>好评率{{ detail.rating }}%</text>
      </view>
    </view>
    
    <!-- 规格选择 -->
    <view class="spec-card" v-if="detail.specs">
      <text class="spec-title">规格</text>
      <view class="spec-list">
        <view 
          class="spec-item" 
          v-for="(spec, index) in detail.specs" 
          :key="index"
          :class="{ active: selectedSpec === index }"
          @click="selectSpec(index)"
        >
          {{ spec }}
        </view>
      </view>
    </view>
    
    <!-- 商品详情 -->
    <view class="detail-card">
      <text class="detail-title">商品详情</text>
      <rich-text :nodes="detail.content"></rich-text>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-btn" @click="navigateToHome">
        <uni-icons type="home" size="24" color="#666"></uni-icons>
        <text>首页</text>
      </view>
      <view class="action-btn" @click="navigateToCart">
        <uni-icons type="cart" size="24" color="#666"></uni-icons>
        <text>购物车</text>
        <view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
      </view>
      <view class="add-cart" @click="addToCart">加入购物车</view>
      <view class="buy-now" @click="buyNow">立即购买</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/store/modules/cart'

const cartStore = useCartStore()
const detail = ref({})
const selectedSpec = ref(0)
const query = ref({})

// 模拟商品详情数据
const mockDetail = {
  id: 1,
  name: '东江鱼头王',
  desc: '精选东江大鱼头，配以秘制酱料，味道鲜美',
  price: 128,
  originalPrice: 158,
  discount: 8.1,
  sales: 256,
  rating: 98,
  images: [
    '/static/images/fish1.jpg',
    '/static/images/fish2.jpg',
    '/static/images/fish3.jpg'
  ],
  specs: ['标准份', '大份', '特大份'],
  content: `
    <div style="padding: 20rpx;">
      <p style="font-size: 28rpx; margin-bottom: 20rpx;">东江鱼头王是我们餐厅的招牌菜，选用东江流域优质大鱼头，配以秘制酱料精心烹制而成。</p>
      <img src="/static/images/fish-detail1.jpg" style="width: 100%; margin-bottom: 20rpx;" />
      <p style="font-size: 28rpx; margin-bottom: 20rpx;">特点：</p>
      <ul style="padding-left: 40rpx;">
        <li style="font-size: 26rpx; margin-bottom: 10rpx;">鱼头鲜嫩，汤汁浓郁</li>
        <li style="font-size: 26rpx; margin-bottom: 10rpx;">秘制配方，回味无穷</li>
        <li style="font-size: 26rpx; margin-bottom: 10rpx;">营养丰富，富含蛋白质</li>
      </ul>
    </div>
  `
}

onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  query.value = currentPage.options
  
  // 根据id获取商品详情
  loadDetail()
})

const cartCount = computed(() => cartStore.totalCount)

const loadDetail = () => {
  // 这里应该是API请求，我们使用模拟数据
  setTimeout(() => {
    detail.value = mockDetail
  }, 300)
}

const selectSpec = (index) => {
  selectedSpec.value = index
}

const addToCart = () => {
  const item = {
    ...detail.value,
    count: 1,
    spec: detail.value.specs ? detail.value.specs[selectedSpec.value] : '',
    shopId: 1,
    shopName: '东江鱼庄'
  }
  cartStore.addToCart(item)
  uni.showToast({ title: '已加入购物车' })
}

const buyNow = () => {
  addToCart()
  uni.navigateTo({ url: '/pages/cart/cart' })
}

const navigateToHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const navigateToCart = () => {
  uni.navigateTo({ url: '/pages/cart/cart' })
}
</script>

<style scoped>
.detail-page {
  padding-bottom: 120rpx;
}

.swiper {
  width: 100%;
  height: 600rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.info-card {
  padding: 30rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.price-section {
  display: flex;
  align-items: flex-end;
  margin-bottom: 20rpx;
}

.price {
  font-size: 48rpx;
  color: #f40;
  font-weight: bold;
}

.original-price {
  font-size: 28rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 20rpx;
}

.discount {
  font-size: 24rpx;
  color: #fff;
  background-color: #f40;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  margin-left: 20rpx;
}

.name {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 15rpx;
}

.desc {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 20rpx;
}

.sales {
  display: flex;
  font-size: 24rpx;
  color: #999;
}

.sales text:first-child {
  margin-right: 30rpx;
}

.spec-card {
  padding: 30rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.spec-title {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 20rpx;
}

.spec-list {
  display: flex;
  flex-wrap: wrap;
}

.spec-item {
  padding: 12rpx 30rpx;
  border: 1rpx solid #ddd;
  border-radius: 6rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  font-size: 26rpx;
}

.spec-item.active {
  border-color: #07c160;
  color: #07c160;
  background-color: rgba(7, 193, 96, 0.1);
}

.detail-card {
  padding: 30rpx;
  background-color: #fff;
}

.detail-title {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 20rpx;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 22rpx;
  color: #666;
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 30rpx;
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

.add-cart {
  flex: 2;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: #ff9500;
  color: #fff;
  font-weight: bold;
  border-radius: 40rpx 0 0 40rpx;
}

.buy-now {
  flex: 2;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: #07c160;
  color: #fff;
  font-weight: bold;
  border-radius: 0 40rpx 40rpx 0;
}
</style>