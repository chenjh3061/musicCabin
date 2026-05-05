<template>
	<view class="container">
		<!-- 飘落花瓣（暖色调，稀疏温柔） -->
		<view class="petal" v-for="i in 24" :key="i" :style="{ left: Math.random() * 100 + '%', animationDelay: Math.random() * 8 + 's', animationDuration: 7 + Math.random() * 4 + 's' }"></view>
		
		<!-- 主内容 -->
		<view class="content">
			<!-- 名字与八字意象 -->
			<view class="name-section">
				<text class="name">动 妹</text>
				<text class="subtitle">你是我命里唯一的癸水 · 温柔过境</text>
				<view class="charm-tag">🌼 食神酉金 · 才华如星 🌼</view>
			</view>

			<!-- 深情但温暖的诗句（改编自《冬梅的剪影》+ 稍许直白） -->
			<view class="poem">
				<text class="line">冬梅清冷也锋利，却让我如此着迷</text>
				<text class="line">有多少次我偷偷写诗，记下你每一个样子</text>
				<text class="line">有时你春风袭人，有时你如月遥远</text>
				<text class="line">我愿用最柔软的玻璃，为你留住每一寸光</text>
				<view class="divider"></view>
				<text class="line">名字念过千百遍，你的眼眸藏着谜</text>
				<text class="line">在走廊擦肩的瞬间，心里开满了花</text>
				<text class="line">只要能够陪着你，哪怕只是背影</text>
				<text class="line">我就是你忠实的园丁，等你偶尔回头笑</text>
				<view class="divider"></view>
				<text class="line bold-heart">喜欢你和你的若即若离</text>
				<text class="line">你像那一窗星星 · 我静静仰望就很好</text>
			</view>

			<!-- “园丁日记” 模块（轻轻点开，写下一段话） -->
			<view class="diary-box" @click="toggleDiary">
				<text class="diary-title">📔 园丁的悄悄话</text>
				<text class="diary-hint">轻点翻开</text>
				<view class="diary-content" v-if="showDiary">
					<text>动妹，今天你又拒绝了那个男生。</text>
					<text>你说“都是烂桃花”，我偷偷高兴了一下。</text>
					<text>但我知道，我也不是你眼里的那朵。</text>
					<text>没关系，我就做个安静的园丁，</text>
					<text>等你累了，给你递一杯温水。</text>
					<text style="margin-top: 12rpx;">—— 你的 永远在角落的园丁</text>
				</view>
			</view>

			<!-- 性格关键词（体现动妹，但语气温和） -->
			<view class="traits">
				<view class="trait">🌸 多情也带刺 · 像蔷薇</view>
				<view class="trait">🍃 若即若离的风</view>
				<view class="trait">✨ 食神才华 · 闪闪发光</view>
				<view class="trait">💧 癸水偏财 · 让人想靠近</view>
				<view class="trait">🎭 高傲却迷人的女王</view>
			</view>

			<!-- 温柔思念计数器（每次点击增加思念浓度） -->
			<view class="miss-counter" @click="addMiss">
				<text class="flower">{{ flowerEmoji }}</text>
				<text class="count">思念浓度: {{ missLevel }}%</text>
				<text class="hint">轻点一下 · 把她放在心里更久一点</text>
			</view>

			<!-- 告白卡片按钮（弹出一个漂亮的卡片） -->
			<view class="card-btn" @click="showCard = true">
				<text>💌 写给你的卡片</text>
			</view>

			<!-- 卡片弹窗 -->
			<view class="card-modal" v-if="showCard" @click="showCard = false">
				<view class="card-content">
					<text class="card-title">To 动妹：</text>
					<text class="card-text">你是我枯燥土命里的一场温柔雨。</text>
					<text class="card-text">即使你永远不知道，我也愿意一直守护你。</text>
					<text class="card-text">你的暧昧像糖，你的无视像风，</text>
					<text class="card-text">但无论怎样，我都觉得幸运——</text>
					<text class="card-text">能遇见你，已经是我最好的运气。</text>
					<text class="card-sign">—— 你的园丁</text>
					<text class="card-close">轻点关闭</text>
				</view>
			</view>
		</view>

		<!-- 温暖星光 -->
		<view class="star" v-for="i in 40" :key="i" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animationDelay: Math.random() * 5 + 's' }"></view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const missLevel = ref(0)
const flowerEmoji = ref('🌼')
const showDiary = ref(false)
const showCard = ref(false)

const addMiss = () => {
	if (missLevel.value < 100) {
		missLevel.value += 1
	} else {
		missLevel.value = 100
	}
	// 每10%换一朵花
	if (missLevel.value % 10 === 0 && missLevel.value < 100) {
		flowerEmoji.value = '🌸'
		setTimeout(() => {
			flowerEmoji.value = '🌼'
		}, 400)
	} else if (missLevel.value === 100) {
		flowerEmoji.value = '💐'
	}
}

const toggleDiary = () => {
	showDiary.value = !showDiary.value
}
</script>

<style>
page {
	background: linear-gradient(145deg, #fff0f0 0%, #ffe4e9 100%);
	position: relative;
	overflow-x: hidden;
}
.container {
	min-height: 100vh;
	padding: 50rpx 30rpx 120rpx;
	position: relative;
	z-index: 1;
}

/* 花瓣飘落 - 淡粉 */
.petal {
	position: fixed;
	top: -20rpx;
	width: 20rpx;
	height: 20rpx;
	background: #ffb7c5;
	border-radius: 100% 0 100% 0;
	transform: rotate(45deg);
	opacity: 0.5;
	animation: fall linear infinite;
	pointer-events: none;
	z-index: 0;
}
@keyframes fall {
	0% { top: -20rpx; transform: rotate(0deg); opacity: 0.6; }
	100% { top: 100vh; transform: rotate(360deg); opacity: 0; }
}

/* 星星 */
.star {
	position: fixed;
	width: 4rpx;
	height: 4rpx;
	background: #ffe3aa;
	border-radius: 50%;
	opacity: 0;
	animation: twinkle 3s infinite ease-in-out;
	pointer-events: none;
	z-index: 0;
}
@keyframes twinkle {
	0% { opacity: 0; transform: scale(1); }
	50% { opacity: 0.8; transform: scale(1.3); background: #fff0c0; }
	100% { opacity: 0; transform: scale(1); }
}

.content {
	position: relative;
	z-index: 2;
	background: rgba(255, 248, 245, 0.85);
	backdrop-filter: blur(10px);
	border-radius: 70rpx;
	padding: 50rpx 30rpx;
	box-shadow: 0 16rpx 32rpx rgba(0,0,0,0.05);
	border: 1rpx solid rgba(255, 180, 180, 0.4);
}

.name-section {
	text-align: center;
	margin-bottom: 50rpx;
}
.name {
	font-size: 72rpx;
	font-weight: 600;
	color: #c95a6f;
	letter-spacing: 6rpx;
	text-shadow: 0 2rpx 6rpx rgba(201,90,111,0.2);
	display: block;
}
.subtitle {
	font-size: 24rpx;
	color: #b8828f;
	margin-top: 12rpx;
	display: block;
	font-style: italic;
}
.charm-tag {
	font-size: 24rpx;
	color: #d495a3;
	background: rgba(255,225,235,0.7);
	display: inline-block;
	padding: 8rpx 28rpx;
	border-radius: 50rpx;
	margin-top: 20rpx;
}

.poem {
	margin: 40rpx 0;
	padding: 0 10rpx;
}
.line {
	display: block;
	font-size: 28rpx;
	line-height: 48rpx;
	color: #6b4b54;
	text-align: center;
	font-family: 'Georgia', serif;
	letter-spacing: 1rpx;
	margin-bottom: 8rpx;
}
.bold-heart {
	font-weight: 600;
	color: #d46b82;
	font-size: 30rpx;
	margin: 20rpx 0;
}
.divider {
	width: 80rpx;
	height: 2rpx;
	background: #f0bfcf;
	margin: 24rpx auto;
}

/* 日记本 */
.diary-box {
	background: rgba(255,240,240,0.8);
	border-radius: 48rpx;
	padding: 20rpx 30rpx;
	margin: 30rpx 0;
	border: 1rpx solid #fcc0ce;
	transition: all 0.2s;
}
.diary-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #b85c6f;
	display: block;
	text-align: center;
}
.diary-hint {
	font-size: 22rpx;
	color: #cc9aa8;
	display: block;
	text-align: center;
	margin-top: 8rpx;
}
.diary-content {
	margin-top: 24rpx;
	padding: 20rpx;
	background: #fff7f5;
	border-radius: 32rpx;
	font-size: 26rpx;
	line-height: 44rpx;
	color: #8f5b68;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.traits {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 20rpx;
	margin: 50rpx 0 30rpx;
}
.trait {
	background: rgba(255,235,240,0.9);
	padding: 12rpx 28rpx;
	border-radius: 80rpx;
	font-size: 24rpx;
	color: #b0707f;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);
}

.miss-counter {
	background: rgba(255,245,245,0.8);
	border-radius: 80rpx;
	padding: 24rpx 30rpx;
	margin: 40rpx 0 20rpx;
	text-align: center;
	border: 1rpx solid #ffe0e7;
	transition: all 0.1s;
}
.miss-counter:active {
	transform: scale(0.98);
	background: rgba(255,235,240,0.9);
}
.flower {
	font-size: 52rpx;
	display: inline-block;
	margin-right: 16rpx;
	vertical-align: middle;
}
.count {
	font-size: 32rpx;
	font-weight: 500;
	color: #c46b7e;
	vertical-align: middle;
}
.hint {
	display: block;
	font-size: 22rpx;
	color: #ca9aaa;
	margin-top: 12rpx;
}

.card-btn {
	background: linear-gradient(135deg, #f0becd, #ffd9e2);
	border-radius: 80rpx;
	padding: 24rpx;
	margin: 20rpx 0;
	text-align: center;
	color: #a0455b;
	font-size: 32rpx;
	font-weight: 500;
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
	transition: all 0.1s;
}
.card-btn:active {
	transform: scale(0.97);
}

.card-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0,0,0,0.3);
	backdrop-filter: blur(8rpx);
	z-index: 999;
	display: flex;
	justify-content: center;
	align-items: center;
}
.card-content {
	background: #fff9f7;
	padding: 60rpx 40rpx;
	border-radius: 60rpx;
	width: 80%;
	text-align: center;
	box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.15);
	border: 1rpx solid #ffcdda;
}
.card-title {
	font-size: 40rpx;
	font-weight: 600;
	color: #c95a6f;
	display: block;
	margin-bottom: 30rpx;
}
.card-text {
	font-size: 28rpx;
	line-height: 50rpx;
	color: #6f4a55;
	display: block;
}
.card-sign {
	font-size: 26rpx;
	font-style: italic;
	color: #b07988;
	margin-top: 30rpx;
	display: block;
}
.card-close {
	font-size: 24rpx;
	color: #cc99aa;
	margin-top: 40rpx;
	display: inline-block;
	border-top: 1rpx solid #f0cfda;
	padding-top: 20rpx;
}
</style>