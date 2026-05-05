<template>
	<view>在线商城</view>
	<navigator animation-type="pop-out" animation-duration="300" open-type="navigateBack">
		<button type="primary">返回主页</button>
	</navigator>
	<swiper indicator-dots="true" 
			indicator-active-color="#007aff"
			indicator-color="white"
			circular="true"
			autoplay="true" interval="2000">
		<swiper-item>
			<image src="../../static/logo.png"
					class="pic1"
					mode="widthFix"></image>
		</swiper-item>
		<swiper-item>2</swiper-item>
		<swiper-item>3</swiper-item>
	</swiper>
	<view id="time">
		{{ localDate }}
	</view>
	<view></view>
</template>

<script setup>
import { ref } from 'vue'

const localDate = ref(new Date().toLocaleString());
console.log(localDate) 
</script>

<style scoped>
swiper{
	width: 100vw;
	height: 150px;
	border: 1px solid red;
}
swiper-item{
	width: 100%;
	height: 100%;
	background: pink;
}
.pic1{
	width: 150px;
	height: 150px;
	position: fixed;
	top: 0;
	left: 20vw;
}
</style>