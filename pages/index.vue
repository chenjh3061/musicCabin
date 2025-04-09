<template>
	<view class="page">
		<view class="header-bg">
			<image class="wave-bg" src="/static/images/wave-bg.png" mode="widthFix"></image>
			<text class="slogan">东江鲜味 · 渔家传承</text>
		</view>
		<!-- 轮播图 -->
		<swiper class="swiper" :autoplay="true" :interval="3000" :circular="true">
			<swiper-item v-for="(item, index) in banners" :key="index">
				<image class="swiper-image" :src="item.image" mode="aspectFill" />
			</swiper-item>
		</swiper>

		<!-- 快捷入口 -->
		<view class="quick-entries">
			<view class="entry" v-for="(item, index) in entries" :key="index" @click="navigateTo(item.path)">
				<image class="entry-icon" :src="item.icon" mode="aspectFit" />
				<text class="entry-text">{{ item.text }}</text>
			</view>
		</view>

		<!-- 推荐菜品 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">招牌推荐</text>
				<text class="section-more" @click="navigateTo('/pages/menu/menu')">查看更多 ></text>
			</view>
			<scroll-view class="recommend-scroll" scroll-x>
				<view class="recommend-item" v-for="(item, index) in recommends" :key="index"
					@click="navigateTo(`/pages/detail/detail?id=${item.id}`)">
					<image class="recommend-image" :src="item.image" mode="aspectFill" />
					<text class="recommend-name">{{ item.name }}</text>
					<text class="recommend-price">¥{{ item.price }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 特产推荐 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">东江特产</text>
				<text class="section-more" @click="navigateTo('/pages/special/special')">查看更多 ></text>
			</view>
			<view class="special-list">
				<view class="special-item" v-for="(item, index) in specials" :key="index"
					@click="navigateTo(`/pages/detail/detail?id=${item.id}&type=special`)">
					<image class="special-image" :src="item.image" mode="aspectFill" />
					<view class="special-info">
						<text class="special-name">{{ item.name }}</text>
						<text class="special-desc">{{ item.desc }}</text>
						<text class="special-price">¥{{ item.price }}</text>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'

	const banners = ref([{
			image: '/static/images/banner1.jpg'
		},
		{
			image: '/static/images/banner2.jpg'
		},
		{
			image: '/static/images/banner3.jpg'
		}
	])

	const entries = ref([{
			icon: '/static/icons/menu.png',
			text: '点餐',
			path: '/pages/menu'
		},
		{
			icon: '/static/icons/special.png',
			text: '特产',
			path: '/pages/special'
		},
		{
			icon: '/static/icons/discount.png',
			text: '优惠',
			path: '/pages/discount'
		},
		{
			icon: '/static/icons/order.png',
			text: '订单',
			path: '/pages/order'
		}
	])

	const recommends = ref([{
			id: 1,
			name: '东江鱼头王',
			price: 128,
			image: '/static/images/fish1.jpg'
		},
		{
			id: 2,
			name: '清蒸东江鱼',
			price: 98,
			image: '/static/images/fish2.jpg'
		},
		{
			id: 3,
			name: '香辣鱼块',
			price: 88,
			image: '/static/images/fish3.jpg'
		},
		{
			id: 4,
			name: '鱼丸汤',
			price: 58,
			image: '/static/images/fish4.jpg'
		}
	])

	const specials = ref([{
			id: 1,
			name: '东江鱼干',
			desc: '传统工艺制作，味道鲜美',
			price: 68,
			image: '/static/images/special1.jpg'
		},
		{
			id: 2,
			name: '东江鱼酱',
			desc: '秘制配方，下饭佳品',
			price: 38,
			image: '/static/images/special2.jpg'
		}
	])

	const navigateTo = (url) => {
		uni.navigateTo({
			url
		})
	}
</script>

<style scoped>
	.page {
		padding-bottom: 100rpx;
	}
	
	.header-bg {
	  position: relative;
	  height: 280rpx;
	}
	
	.wave-bg {
	  width: 100%;
	  height: 280rpx;
	}
	
	.slogan {
	  position: absolute;
	  bottom: 40rpx;
	  left: 0;
	  right: 0;
	  text-align: center;
	  color: white;
	  font-size: 36rpx;
	  font-weight: bold;
	  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
	}

	.swiper {
		width: 100%;
		height: 350rpx;
	}

	.swiper-image {
		width: 100%;
		height: 100%;
	}

	.quick-entries {
		display: flex;
		justify-content: space-around;
		padding: 30rpx 0;
		background-color: #fff;
		margin: 20rpx 0;
	}

	.entry {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.entry-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}

	.entry-text {
		font-size: 24rpx;
		color: #666;
	}

	.section {
		background-color: #fff;
		margin: 20rpx 0;
		padding: 20rpx;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
	}

	.section-more {
		font-size: 24rpx;
		color: #999;
	}

	.recommend-scroll {
		white-space: nowrap;
		width: 100%;
	}

	.recommend-item {
		display: inline-block;
		width: 200rpx;
		margin-right: 20rpx;
	}

	.recommend-image {
		width: 200rpx;
		height: 200rpx;
		border-radius: 10rpx;
	}

	.recommend-name {
		display: block;
		font-size: 28rpx;
		margin-top: 10rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.recommend-price {
		display: block;
		font-size: 26rpx;
		color: #f40;
	}

	.special-list {
		display: flex;
		flex-direction: column;
	}

	.special-item {
		display: flex;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #eee;
	}

	.special-image {
		width: 180rpx;
		height: 180rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
	}

	.special-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.special-name {
		font-size: 28rpx;
		font-weight: bold;
	}

	.special-desc {
		font-size: 24rpx;
		color: #999;
		margin: 10rpx 0;
	}

	.special-price {
		font-size: 26rpx;
		color: #f40;
	}
</style>