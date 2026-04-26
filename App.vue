<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { initCloud } from './utils/db.js'

// ⚠️ 请将此处替换为你的微信云开发环境 ID
// 在微信开发者工具中 -> 云开发 -> 环境ID
const CLOUD_ENV_ID = 'your-env-id'  // TODO: 替换为实际环境ID

onLaunch(() => {
  console.log('App Launch')
  // 初始化云开发
  // 如果未配置云开发，将自动降级使用本地存储
  try {
    initCloud(CLOUD_ENV_ID)
  } catch (e) {
    console.warn('云开发初始化失败，使用本地存储模式', e)
  }
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
  /* 全局样式 */
  page {
    background-color: #f2f6fc;
    font-size: 14px;
    color: #2c3e50;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Helvetica Neue', sans-serif;
  }

  /* 主题色 */
  .theme-color { color: #4A90D9; }
  .theme-bg { background-color: #4A90D9; }
  
  /* 卡片通用样式 */
  .card {
    background: #fff;
    border-radius: 16rpx;
    padding: 28rpx;
    margin: 20rpx 24rpx;
    box-shadow: 0 2rpx 16rpx rgba(74,144,217,0.08);
  }
  
  /* 通用按钮 */
  .btn-primary {
    background: #4A90D9;
    color: #fff;
    border-radius: 50rpx;
    padding: 18rpx 48rpx;
    font-size: 28rpx;
    border: none;
  }
  
  .btn-danger {
    background: #e74c3c;
    color: #fff;
    border-radius: 50rpx;
    padding: 18rpx 48rpx;
    font-size: 28rpx;
    border: none;
  }
</style>
