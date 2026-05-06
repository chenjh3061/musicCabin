# MEMORY.md - 工作记忆

## 项目：musicCabin 小程序
- **路径**：`f:\tools\HBuilderX 3.1.22\src\musicCabin`
- **框架**：UniApp + Vue 3 (Composition API)，微信小程序端
- **AppID**：wx2b2cb4241032c6c0
- **当前版本**：已改造为个人工具集小程序

## 最新架构（2026-05-05 重构后）
- **主题色**：#4A90D9（蓝绿音乐风），辅助色 #3ABFBF（青绿），页面底色 #F0F6FB
- **主题文件**：`styles/music-theme.scss`（全局 SCSS 变量 + 通用组件样式）
- **数据存储**：纯本地存储（`uni.setStorageSync` / `uni.getStorageSync`），不使用云数据库
- **核心工具**：`utils/storage.js`（2026-05-05 新增）统一管理所有存储 key
- **idong 专题页**：独立粉色浪漫风格（#d4688d），含漂浮粒子、光晕动画、告白弹窗

## 存储 Key 规范（utils/storage.js）
| Key | 模块 | 数据结构 |
|-----|------|----------|
| `todoList` | 待办事项 | `{ todos: [...] }` |
| `itemsData` | 物品管理 | `{ items: [...] }` |
| `countdownData` | 倒数日/纪念日 | `{ events: [...] }` |
| `dailyCheckinData` | 每日打卡 | `{ tasks: [...] }` |
| `wageCalData` | 工资计算 | `{ totalMonths, targetAvg, monthRecords }` |
| `mealOptions` | 随机午餐 | 纯文本字符串，每行一项 |
| `reminderSettings` | 提醒设置 | `{ dailyReminder, expiryReminder, countdownReminder }` |

## 页面结构
| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | pages/index/index.vue | 工具箱导航，今日概览，全局搜索 |
| 待办 | pages/todo/todo.vue + todoEdit.vue | 增删改查，优先级/截止/标签 |
| 日历 | pages/calendar/calendar.vue + eventEdit.vue | 月历视图，事件颜色标记 |
| 物品 | pages/items/items.vue + itemDetail.vue | 过期提醒分组 + 贵重物品位置 |
| 每日打卡 | pages/dailyCheckin/dailyCheckin.vue | 习惯打卡，连续天数统计 |
| 倒数日 | pages/countDown/countDown.vue | 纪念日/重要日期倒计时 |
| 随机决定 | pages/randomDecision/randomDecision.vue | 抛硬币/随机数/抽签/午餐 |
| 工资计算 | pages/wagecal/wageCal.vue | 目标薪资规划 |
| 设置 | pages/settings/settings.vue | 备份/恢复/清除数据 + 提醒设置 |

## 工具函数
- `utils/storage.js`：**主要数据操作入口**，包含 getTodos/saveTodos/getItems/saveItems 等所有模块读写函数，以及 exportAllData/importAllData/clearAllData/getDataStats 等备份相关函数
- `utils/helper.js`：formatDate、getExpiryStatus、PRIORITY_MAP、showToast、showConfirm 等通用函数
- `utils/db.js`：**已废弃**（原云数据库层，各页面已全部迁移到 storage.js）

## 用户偏好
- 文件操作使用绝对路径
- 数据存储纯本地，不使用云开发/unicloud
- 允许未来扩展新工具模块（在 pages.json 和首页工具网格中添加即可）
- 新增模块时同步在 utils/storage.js 的 BACKUP_KEYS 数组中注册存储 key
