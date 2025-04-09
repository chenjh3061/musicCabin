<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import GlobalFooterVue from './pages/components/GlobalFooter.vue'

onLaunch(() => {
  console.log('App Launch')
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
	  background-color: #f7f7f7;
	  font-size: 14px;
	  color: #333;
	  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}
	
	/* 主题色 */
	.theme-color {
	  color: #07c160;
	}
	
	.theme-bg {
	  background-color: #07c160;
	}
</style>