<script setup>
import { onLaunch } from '@dcloudio/uni-app'
// 如果你不需要云开发，请注释掉下面两行
// import { initCloud } from '@/utils/db.js'
// onLaunch(() => { initCloud('你的环境ID') })
</script>

<style>
/* ================= 全局蓝色音乐主题 ================= */
page {
  background: #F0F4FA;
  font-family: -apple-system, 'Helvetica Neue', Helvetica, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 主题色变量 */
:root {
  --primary: #5D9BEC;
  --primary-light: #E8F0FE;
  --primary-dark: #4A80D9;
  --primary-bg: #F5F8FF;
  --text-dark: #2C3E50;
  --text-gray: #7F8C8D;
  --border-light: #E4E9F2;
}

/* 通用卡片 */
.music-card {
  background: #FFFFFF;
  border-radius: 36rpx;
  margin: 24rpx;
  padding: 32rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

/* 通用按钮 */
.music-btn {
  background: var(--primary);
  color: white;
  border-radius: 60rpx;
  font-size: 28rpx;
  padding: 20rpx;
  text-align: center;
  border: none;
  margin: 0 auto;
  width: 60%;
  box-shadow: 0 4rpx 12rpx rgba(93, 155, 236, 0.3);
}
.music-btn::after { border: none; }

/* 次级按钮 */
.music-btn-secondary {
  background: var(--primary-light);
  color: var(--primary-dark);
  box-shadow: none;
}

/* 输入框/文本域 */
.music-input, .music-textarea {
  background: var(--primary-bg);
  border-radius: 32rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  border: 1rpx solid var(--border-light);
  width: 100%;
  box-sizing: border-box;
  height: 80%;
}

/* 导航栏（月份选择条） */
.music-navbar {
  background: white;
  border-radius: 60rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 32rpx;
  margin: 20rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.02);
}

/* 通用头部渐变 */
.music-hero {
  background: linear-gradient(135deg, #5D9BEC, #4A80D9);
  padding: 60rpx 32rpx 40rpx;
  border-radius: 0 0 48rpx 48rpx;
  text-align: center;
  color: white;
}

/* 分割线 */
.music-divider {
  height: 1rpx;
  background: var(--border-light);
  margin: 20rpx 0;
}

/* 提示文字 */
.music-tip {
  font-size: 24rpx;
  color: #95A5A6;
  text-align: center;
  margin-top: 20rpx;
}

/* 底部音符装饰 */
.music-footer {
  text-align: center;
  font-size: 24rpx;
  color: #BDC3C7;
  padding: 40rpx 0 60rpx;
}

/* 滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(93, 155, 236, 0.3);
  border-radius: 10px;
}
</style>