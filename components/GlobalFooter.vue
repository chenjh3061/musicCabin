<template>
	<view class="foot-container">
		<view id="index">
			<navigator url="../index/index" hover-class="navigator-hover">
				<view id="index-logo"></view>
				<view>首页</view>
			</navigator>
		</view>
		<view id="posts">
			<navigator url="../index/postPage" hover-class="navigator-hover">
				<view id="posts-logo"></view>
				<view>文字</view>
			</navigator>
		</view>
		<view id="mall">
			<navigator url="../demo1/demo1" hover-class="navigator-hover">
				<view id="mall-logo"></view>
				<view>商城</view>
			</navigator>
		</view>
		<view id="user">
			<navigator url="" hover-class="navigator-hover">
				<view id="user-logo"></view>
				<view>我的</view>
			</navigator>
		</view>
	</view>

</template>

<script setup>
</script>

<style scoped>
	.foot-container {
		border: 1cap;
		width: 100vw;
		margin: auto;
		height: 10vh;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		background-color: #55ff00;
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 999;
	}
	navigator {
		border: 1cap;
	}
	#index {
		border: 1cap;
		width: 25vw;
		height: 100%;
		float: left;
	}
	#posts {
		border: 1cap;
		width: 25vw;
		height: 100%;
		float: left;
	}
	#mall {
		border: 1cap;
		width: 25vw;
		height: 100%;
		float: left;
	}
	#user {
		border: 1cap;
		width: 25vw;
		height: 100%;
		float: left;
	}
</style>