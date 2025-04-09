<template>
	<view class="box" hover-class="boxHover">
		view布局标签
		<view class="inner" hover-class="innerHover" hover-stop-propagation>二号标签</view>
	</view>
</template>

<script>
</script>

<style scoped>
	.box {
		width: 200px;
		height: 200px;
		background: #ccc;
	}

	.boxHover {
		background: orange;
		width: 300px;
	}

	.inner {
		width: 150px;
		height: 150px;
		background: green;
	}

	.innerHover {
		background: greenyellow;
	}
</style>