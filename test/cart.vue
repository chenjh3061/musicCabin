<template>
  <view class="cart-page">
    <!-- 地址 -->
    <view class="address-card" @click="chooseAddress">
      <uni-icons type="location" size="24" color="#07c160"></uni-icons>
      <view class="address-info" v-if="address">
        <view class="address-top">
          <text class="name">{{ address.name }}</text>
          <text class="phone">{{ address.phone }}</text>
        </view>
        <text class="address-detail">{{ address.detail }}</text>
      </view>
      <text class="address-tip" v-else>请选择收货地址</text>
      <uni-icons type="arrowright" size="18" color="#999"></uni-icons>
    </view>
    
    <!-- 购物车列表 -->
    <view class="cart-list">
      <view class="cart-section" v-for="(group, index) in groupedCart" :key="index">
        <view class="shop-title">{{ group.shopName }}</view>
        <view class="cart-item" v-for="item in group.items" :key="item.id">
          <image class="food-image" :src="item.image" mode="aspectFill" />
          <view class="food-info">
            <text class="food-name">{{ item.name }}</text>
            <text class="food-desc">{{ item.desc }}</text>
            <view class="food-price">
              <text class="price">¥{{ item.price }}</text>
              <view class="cart-operate">
                <uni-icons 
                  type="minus" 
                  size="20" 
                  color="#999" 
                  @click="decreaseCart(item)"
                ></uni-icons>
                <text class="cart-num">{{ item.count }}</text>
                <uni-icons 
                  type="plus" 
                  size="20" 
                  color="#07c160" 
                  @click="addToCart(item)"
                ></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 结算栏 -->
    <view class="checkout-bar">
      <view class="total-price">
        <text>合计: </text>
        <text class="price">¥{{ totalPrice }}</text>
      </view>
      <view class="checkout-btn" @click="submitOrder">提交订单</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/store/modules/cart'
import { onShow } from '@dcloudio/uni-app'

const cartStore = useCartStore()
const address = ref(null)

// 分组购物车数据（按店铺）
const groupedCart = computed(() => {
  const groups = {}
  
  cartStore.cartList.forEach(item => {
    if (!groups[item.shopId]) {
      groups[item.shopId] = {
        shopName: item.shopName,
        items: []
      }
    }
    groups[item.shopId].items.push(item)
  })
  
  return Object.values(groups)
})

const totalPrice = computed(() => cartStore.totalPrice)

onShow(() => {
  // 从缓存中读取地址
  const savedAddress = uni.getStorageSync('selectedAddress')
  if (savedAddress) {
    address.value = savedAddress
  }
})

const chooseAddress = () => {
  uni.chooseAddress({
    success: (res) => {
      address.value = {
        name: res.userName,
        phone: res.telNumber,
        detail: `${res.provinceName}${res.cityName}${res.countyName}${res.detailInfo}`
      }
      uni.setStorageSync('selectedAddress', address.value)
    }
  })
}

const addToCart = (item) => {
  cartStore.addToCart(item)
}

const decreaseCart = (item) => {
  cartStore.decreaseCart(item)
}

const submitOrder = () => {
  if (!address.value) {
    uni.showToast({
      title: '请选择收货地址',
      icon: 'none'
    })
    return
  }
  
  // 提交订单逻辑
  uni.showLoading({ title: '提交中...' })
  
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '订单提交成功' })
    cartStore.clearCart()
    uni.navigateBack()
  }, 1500)
}
</script>

<style scoped>
.cart-page {
  padding-bottom: 120rpx;
}

.address-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.address-info {
  flex: 1;
  margin-left: 20rpx;
}

.address-top {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.name {
  font-size: 28rpx;
  font-weight: bold;
}

.phone {
  font-size: 26rpx;
  color: #666;
  margin-left: 30rpx;
}

.address-detail {
  font-size: 26rpx;
  color: #666;
}

.address-tip {
  flex: 1;
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #666;
}

.cart-list {
  background-color: #fff;
}

.shop-title {
  padding: 20rpx;
  font-size: 28rpx;
  font-weight: bold;
  border-bottom: 1rpx solid #eee;
}

.cart-item {
  display: flex;
  padding: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.food-image {
  width: 160rpx;
  height: 160rpx;
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

.cart-operate {
  display: flex;
  align-items: center;
}

.cart-num {
  margin: 0 20rpx;
  font-size: 26rpx;
}

.checkout-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.total-price {
  font-size: 28rpx;
}

.price {
  font-size: 32rpx;
  color: #f40;
  font-weight: bold;
  margin-left: 10rpx;
}

.checkout-btn {
  background-color: #07c160;
  color: #fff;
  padding: 0 50rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-weight: bold;
}
</style>