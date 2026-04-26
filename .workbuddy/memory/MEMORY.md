# MEMORY.md - 工作记忆

## 项目：musicCabin 小程序
- **路径**：`f:\tools\HBuilderX 3.1.22\src\musicCabin`
- **框架**：UniApp + Vue 3 (Composition API)，微信小程序端
- **AppID**：wx2b2cb4241032c6c0
- **当前版本**：已改造为个人工具集小程序

## 最新架构（2026-04-26 改造后）
- **主题色**：#4A90D9（蓝色系）
- **数据存储**：微信云开发云数据库（免费额度）+ 本地存储降级缓存
- **云开发环境ID**：App.vue 中 `CLOUD_ENV_ID = 'your-env-id'`（待用户替换）
- **云数据库集合**：todos / events / items（需在云开发控制台手动创建）

## 页面结构
| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | pages/index/index.vue | 工具箱导航，今日概览 |
| 待办 | pages/todo/todo.vue + todoEdit.vue | 增删改查，优先级/截止/标签 |
| 日历 | pages/calendar/calendar.vue + eventEdit.vue | 月历视图，事件颜色标记 |
| 物品 | pages/items/items.vue + itemDetail.vue | 过期提醒分组 + 贵重物品位置 |
| 我的 | pages/userPage/userPage.vue | 统计/菜单/缓存清理 |

## 工具函数
- `utils/db.js`：云数据库 CRUD 封装（含降级本地存储）
- `utils/helper.js`：formatDate、getExpiryStatus、PRIORITY_MAP 等

## 用户偏好
- 文件操作使用绝对路径
- 数据存储使用微信云开发免费额度，不使用 unicloud
- 允许未来扩展新工具模块（在 pages.json 和首页工具网格中添加即可）
