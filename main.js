import App from './App'
import store from './store'
import './utils/request'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif


/**
 * type	说明	示例
 * feat	新功能	feat(wage): 添加工资计算页面
 * fix	Bug修复	fix(calendar): 修复日期显示错误
 * docs	文档更新	docs(readme): 更新安装说明
 * style	代码格式（不影响功能）	style: 统一缩进为2空格
 * refactor	重构（不修bug不添功能）	refactor(api): 重构请求拦截器
 * perf	性能优化	perf(list): 优化长列表渲染
 * test	测试相关	test(wage): 添加工资计算单元测试
 * chore	构建/工具配置	chore: 升级uni-app到4.x
 * revert	回退代码	revert: 回退feat(wage)提交
 */