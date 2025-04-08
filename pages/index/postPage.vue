<template>
	<view>
		<view>往期文章</view>
		<view class="search">
			<input type="text" 
					@focus="isActive = true" @blur="isActive=false" 
					v-model="searchText" @confirm="doSearch"/>
			<image class="pic" src="../../static/logo.png" 
					:class="isActive ? 'active':''"></image>
			<view>预览：{{ searchText }}</view>
		</view>
		<view class="post-list" v-for="(post, index) in postList" :key="post.id">
			<view>{{ post.id }}</view>
			<view>{{ post.text }}</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref, watchEffect
	} from 'vue';
 
	const postList = ref([{
			id: 1,
			text: "123123123"
		},
		{
			id: 2,
			text: "123123123"
		},
		{
			id: 3,
			text: "123123123"
		},
		{
			id: 4,
			text: "123123123"
		},
	])

	const searchText = ref("")

	const isActive = ref(false);
	
	const doSearch = (e) => {
		console.log(e)
	};
	
	watchEffect(() => {
		searchText.value
	});
	
</script>

<style lang="scss" scoped>
	.post-list {
		border: 1rpx;
	}

	.search {
		padding: 0 20px;
		margin-top: 40px;
		margin-left: 2vw;
		position: relative;

		input {
			border: 1px solid #00ff7f;
			height: 40px;
			width: 80vw;
			position: relative;
			z-index: 2;
			background: #fff;
		}

		.pic {
			width: 24px;
			height: 24px;
			z-index: 1;
			position: absolute;
			left: calc(50% - 12px);
			transition: top 0.3s;
		}
		.pic.active{
			top: -24;
		}

	}
</style>