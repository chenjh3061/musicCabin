<template>
	<view class="container">
		<!-- 漂浮爱心 -->
		<view
			class="heart-float"
			v-for="i in 18"
			:key="'h'+i"
			:style="{
				left: (i * 5.5 + Math.sin(i) * 4) % 100 + '%',
				animationDelay: (i * 0.45) + 's',
				animationDuration: (6 + i % 4) + 's',
				fontSize: (20 + i % 16) + 'rpx',
				opacity: 0.18 + (i % 5) * 0.06
			}"
		>{{ i % 3 === 0 ? '💗' : i % 3 === 1 ? '✦' : '🌸' }}</view>

		<!-- 主内容卡片 -->
		<view class="content">
			<!-- 名字与意象 -->
			<view class="name-section">
				<view class="name-halo"></view>
				<text class="name">动 妹</text>
				<text class="subtitle">你是我命里唯一的癸水 · 温柔过境</text>
				<view class="charm-tag">🌼 食神酉金 · 才华如星 🌼</view>
			</view>

			<!-- 诗句 -->
			<view class="poem">
				<text class="line">冬梅清冷也锋利，却让我如此着迷</text>
				<text class="line">有多少次我偷偷写诗，记下你每一个样子</text>
				<text class="line">有时你春风袭人，有时你如月遥远</text>
				<text class="line">我愿用最柔软的玻璃，为你留住每一寸光</text>
				<view class="divider">
					<view class="divider-dot"></view>
					<view class="divider-line"></view>
					<view class="divider-dot"></view>
				</view>
				<text class="line">名字念过千百遍，你的眼眸藏着谜</text>
				<text class="line">在走廊擦肩的瞬间，心里开满了花</text>
				<text class="line">只要能够陪着你，哪怕只是背影</text>
				<text class="line">我就是你忠实的园丁，等你偶尔回头笑</text>
				<view class="divider">
					<view class="divider-dot"></view>
					<view class="divider-line"></view>
					<view class="divider-dot"></view>
				</view>
				<text class="line bold-heart">喜欢你和你的若即若离</text>
				<text class="line">你像那一窗星星 · 我静静仰望就很好</text>
			</view>

			<!-- 性格关键词 -->
			<view class="traits">
				<view class="trait">🌸 多情也带刺 · 像蔷薇</view>
				<view class="trait">🍃 若即若离的风</view>
				<view class="trait">✨ 食神才华 · 闪闪发光</view>
				<view class="trait">💧 癸水偏财 · 让人想靠近</view>
				<view class="trait">🎭 高傲却迷人的女王</view>
			</view>

			<!-- 园丁日记 -->
			<view class="diary-box" @click="toggleDiary">
				<text class="diary-title">📔 园丁的悄悄话</text>
				<text class="diary-hint">{{ showDiary ? '轻点合上' : '轻点翻开' }}</text>
				<view class="diary-content" v-if="showDiary">
					<text>动妹，今天你又拒绝了那个男生。</text>
					<text>你说"都是烂桃花"，我偷偷高兴了一下。</text>
					<text>但我知道，我也不是你眼里的那朵。</text>
					<text>没关系，我就做个安静的园丁，</text>
					<text>等你累了，给你递一杯温水。</text>
					<text class="diary-sign">—— 你的 永远在角落的园丁</text>
				</view>
			</view>

			<!-- 思念计数器 -->
			<view class="miss-counter" @click="addMiss">
				<text class="flower" :class="{ bloom: blooming }">{{ flowerEmoji }}</text>
				<view class="miss-info">
					<text class="count">思念浓度  {{ missLevel }}%</text>
					<view class="miss-bar">
						<view class="miss-fill" :style="{ width: missLevel + '%' }"></view>
					</view>
					<text class="hint">轻点一下 · 把她放在心里更久一点</text>
				</view>
			</view>

			<!-- 告白卡片按钮 -->
			<view class="card-btn" @click="showCard = true">
				<text>💌 写给你的卡片</text>
			</view>
		</view>

		<!-- 星星 -->
		<view
			class="star"
			v-for="i in 36"
			:key="'s'+i"
			:style="{
				left: (i * 2.8 + Math.cos(i) * 5) % 100 + '%',
				top: (i * 2.7 + Math.sin(i) * 8) % 100 + '%',
				animationDelay: (i * 0.14) + 's',
				width: (2 + i % 4) + 'rpx',
				height: (2 + i % 4) + 'rpx'
			}"
		></view>

		<!-- 卡片弹窗 -->
		<view class="card-modal" v-if="showCard" @click="showCard = false">
			<view class="card-content" @click.stop>
				<view class="card-flowers">🌸 🌺 🌸</view>
				<text class="card-title">To 动妹：</text>
				<text class="card-text">你是我枯燥土命里的一场温柔雨。</text>
				<text class="card-text">即使你永远不知道，我也愿意一直守护你。</text>
				<text class="card-text">你的暧昧像糖，你的无视像风，</text>
				<text class="card-text">但无论怎样，我都觉得幸运——</text>
				<text class="card-text">能遇见你，已经是我最好的运气。</text>
				<text class="card-sign">—— 你的园丁</text>
				<view class="card-close-area" @click="showCard = false">
					<text class="card-close">轻点关闭 ✦</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const missLevel = ref(0)
const flowerEmoji = ref('🌼')
const blooming = ref(false)
const showDiary = ref(false)
const showCard = ref(false)

const addMiss = () => {
	if (missLevel.value < 100) {
		missLevel.value = Math.min(100, missLevel.value + 1)
	}
	blooming.value = true
	setTimeout(() => { blooming.value = false }, 400)

	if (missLevel.value % 10 === 0 && missLevel.value < 100) {
		flowerEmoji.value = '🌸'
		setTimeout(() => { flowerEmoji.value = '🌼' }, 500)
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
	background: linear-gradient(160deg, #fff0f5 0%, #fde8f0 40%, #f0e8ff 100%);
	position: relative;
	overflow-x: hidden;
}
</style>

<style scoped>
/* ===========================
   容器
   =========================== */
.container {
	min-height: 100vh;
	padding: 60rpx 28rpx 140rpx;
	position: relative;
	z-index: 1;
}

/* ===========================
   漂浮粒子（爱心/花/星）
   =========================== */
.heart-float {
	position: fixed;
	top: -40rpx;
	animation: floatUp linear infinite;
	pointer-events: none;
	z-index: 0;
	line-height: 1;
}
@keyframes floatUp {
	0%   { top: 110vh; transform: translateX(0) rotate(0deg); opacity: 0; }
	10%  { opacity: 1; }
	90%  { opacity: 0.7; }
	100% { top: -10vh;  transform: translateX(20rpx) rotate(30deg); opacity: 0; }
}

/* 星星 */
.star {
	position: fixed;
	background: #f9c8e0;
	border-radius: 50%;
	animation: twinkle 3s infinite ease-in-out;
	pointer-events: none;
	z-index: 0;
}
@keyframes twinkle {
	0%   { opacity: 0; transform: scale(0.8); }
	50%  { opacity: 0.9; transform: scale(1.5); background: #ffdde8; }
	100% { opacity: 0; transform: scale(0.8); }
}

/* ===========================
   主内容卡片
   =========================== */
.content {
	position: relative;
	z-index: 2;
	background: rgba(255, 250, 252, 0.90);
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	border-radius: 72rpx;
	padding: 56rpx 36rpx 48rpx;
	box-shadow: 0 20rpx 60rpx rgba(200, 100, 140, 0.12), 0 4rpx 16rpx rgba(200, 100, 140, 0.08);
	border: 1rpx solid rgba(255, 190, 210, 0.5);
}

/* ===========================
   名字区域
   =========================== */
.name-section {
	text-align: center;
	margin-bottom: 48rpx;
	position: relative;
}
.name-halo {
	position: absolute;
	top: 50%; left: 50%;
	transform: translate(-50%, -50%);
	width: 200rpx; height: 200rpx;
	background: radial-gradient(circle, rgba(255,190,210,0.4) 0%, transparent 70%);
	border-radius: 50%;
	animation: haloBreath 3s ease-in-out infinite;
	pointer-events: none;
}
@keyframes haloBreath {
	0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
	50%       { transform: translate(-50%,-50%) scale(1.25); opacity: 1; }
}
.name {
	font-size: 76rpx;
	font-weight: 700;
	color: #c1527a;
	letter-spacing: 8rpx;
	text-shadow: 0 4rpx 20rpx rgba(193, 82, 122, 0.28);
	display: block;
	position: relative;
	animation: nameShimmer 4s ease-in-out infinite;
}
@keyframes nameShimmer {
	0%, 100% { color: #c1527a; }
	50%       { color: #d4688d; }
}
.subtitle {
	font-size: 24rpx;
	color: #c28ba0;
	margin-top: 14rpx;
	display: block;
	font-style: italic;
	letter-spacing: 1rpx;
}
.charm-tag {
	font-size: 22rpx;
	color: #d095aa;
	background: rgba(255, 220, 235, 0.65);
	display: inline-block;
	padding: 8rpx 32rpx;
	border-radius: 50rpx;
	margin-top: 20rpx;
	border: 1rpx solid rgba(255, 185, 210, 0.5);
}

/* ===========================
   诗句
   =========================== */
.poem {
	margin: 36rpx 0;
	padding: 0 8rpx;
}
.line {
	display: block;
	font-size: 27rpx;
	line-height: 52rpx;
	color: #7d4d5e;
	text-align: center;
	font-family: 'Georgia', 'PingFang SC', serif;
	letter-spacing: 1rpx;
	margin-bottom: 4rpx;
}
.bold-heart {
	font-weight: 700;
	color: #d46b82;
	font-size: 30rpx;
	margin: 16rpx 0;
}
.divider {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	margin: 28rpx auto;
}
.divider-line {
	width: 100rpx; height: 1rpx;
	background: linear-gradient(90deg, transparent, #f0bfcf, transparent);
}
.divider-dot {
	width: 10rpx; height: 10rpx;
	background: #f0bfcf; border-radius: 50%;
}

/* ===========================
   性格标签
   =========================== */
.traits {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 18rpx;
	margin: 40rpx 0 28rpx;
}
.trait {
	background: rgba(255, 230, 240, 0.85);
	padding: 12rpx 24rpx; border-radius: 60rpx;
	font-size: 22rpx; color: #b07080;
	border: 1rpx solid rgba(240, 190, 210, 0.5);
	box-shadow: 0 2rpx 8rpx rgba(200,100,130,0.07);
}

/* ===========================
   园丁日记
   =========================== */
.diary-box {
	background: rgba(255, 240, 245, 0.85);
	border-radius: 48rpx; padding: 24rpx 32rpx;
	margin: 28rpx 0;
	border: 1rpx solid #fcc0ce;
	transition: all 0.25s;
}
.diary-box:active { transform: scale(0.99); }
.diary-title {
	font-size: 30rpx; font-weight: 600; color: #c06070;
	display: block; text-align: center;
}
.diary-hint {
	font-size: 22rpx; color: #cc9aa8;
	display: block; text-align: center; margin-top: 8rpx;
}
.diary-content {
	margin-top: 24rpx; padding: 20rpx;
	background: rgba(255, 250, 252, 0.9);
	border-radius: 32rpx;
	font-size: 26rpx; line-height: 48rpx; color: #8f5b68;
	display: flex; flex-direction: column; gap: 8rpx;
}
.diary-sign {
	color: #b085a0; font-style: italic; margin-top: 12rpx;
	font-size: 24rpx; display: block;
}

/* ===========================
   思念计数器
   =========================== */
.miss-counter {
	background: rgba(255, 245, 248, 0.85);
	border-radius: 48rpx; padding: 24rpx 28rpx;
	margin: 24rpx 0 16rpx;
	display: flex; align-items: center; gap: 24rpx;
	border: 1rpx solid #ffe0e7; transition: all 0.1s;
}
.miss-counter:active { transform: scale(0.98); background: rgba(255, 235, 242, 0.9); }
.flower {
	font-size: 56rpx; flex-shrink: 0;
	transition: transform 0.2s;
}
.flower.bloom { transform: scale(1.35) rotate(10deg); }
.miss-info { flex: 1; }
.count { font-size: 30rpx; font-weight: 600; color: #c46b7e; display: block; margin-bottom: 12rpx; }
.miss-bar {
	height: 8rpx; background: #ffe4ec; border-radius: 8rpx; overflow: hidden;
}
.miss-fill {
	height: 100%;
	background: linear-gradient(90deg, #f9a8c0, #e87aad);
	border-radius: 8rpx; transition: width 0.3s ease;
}
.hint { display: block; font-size: 22rpx; color: #ca9aaa; margin-top: 10rpx; }

/* ===========================
   告白按钮
   =========================== */
.card-btn {
	background: linear-gradient(135deg, #f0a8c0, #e87aad, #f0becd);
	background-size: 200% 200%;
	animation: btnGlow 3s ease infinite;
	border-radius: 80rpx; padding: 26rpx;
	margin: 16rpx 0 0; text-align: center;
	color: #fff; font-size: 32rpx; font-weight: 700;
	letter-spacing: 2rpx;
	box-shadow: 0 6rpx 24rpx rgba(230, 100, 150, 0.30);
	transition: all 0.1s;
}
@keyframes btnGlow {
	0%, 100% { background-position: 0% 50%; }
	50%       { background-position: 100% 50%; }
}
.card-btn:active { transform: scale(0.97); }

/* ===========================
   卡片弹窗
   =========================== */
.card-modal {
	position: fixed; top: 0; left: 0; right: 0; bottom: 0;
	background: rgba(80, 20, 40, 0.38);
	backdrop-filter: blur(12px);
	z-index: 999;
	display: flex; justify-content: center; align-items: center;
}
.card-content {
	background: linear-gradient(160deg, #fff5f8 0%, #fff0f5 100%);
	padding: 56rpx 44rpx 44rpx;
	border-radius: 64rpx; width: 80%;
	text-align: center;
	box-shadow: 0 24rpx 60rpx rgba(180, 60, 100, 0.22);
	border: 1rpx solid rgba(255, 190, 210, 0.6);
}
.card-flowers { font-size: 44rpx; margin-bottom: 20rpx; display: block; }
.card-title {
	font-size: 40rpx; font-weight: 700;
	color: #c95a6f; display: block; margin-bottom: 28rpx;
}
.card-text {
	font-size: 28rpx; line-height: 54rpx;
	color: #7a4a58; display: block; font-style: italic;
}
.card-sign {
	font-size: 26rpx; font-style: italic; color: #c090a0;
	margin-top: 32rpx; display: block;
}
.card-close-area {
	margin-top: 36rpx; border-top: 1rpx solid #f5d0de;
	padding-top: 24rpx;
}
.card-close { font-size: 24rpx; color: #d4a0b0; }
</style>
