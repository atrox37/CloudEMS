# CloudEMS - 云端能源管理系统

## 项目概述

CloudEMS是一个基于Vue 3的现代化云端能源管理系统，提供实时数据监控、告警管理、设备控制等功能。

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **样式预处理**: Sass
- **图表库**: ECharts
- **网络请求**: Axios
- **国际化**: Vue I18n
- **实时通信**: WebSocket

## 项目结构

```
CloudEMS/
├── src/
│   ├── api/                 # API接口定义
│   ├── assets/             # 静态资源
│   ├── components/         # 公共组件
│   ├── composables/        # 组合式函数
│   ├── layout/             # 布局组件
│   ├── router/             # 路由配置
│   ├── stores/             # 状态管理
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   └── views/              # 页面组件
├── public/                 # 公共资源
├── package.json            # 依赖配置
└── README.md               # 项目说明
```

## 核心功能

### 1. 实时数据监控
- 多频道数据订阅
- 实时数据更新
- 批量数据处理
- 数据可视化图表

### 2. 告警管理
- 实时告警推送
- 告警级别分类
- 告警状态管理
- 告警数量统计

### 3. 设备控制
- 远程设备控制
- 控制命令确认
- 操作日志记录
- 权限验证

### 4. 用户管理
- 用户认证授权
- 角色权限管理
- 操作审计日志
- 安全策略配置

## WebSocket策略调整

### 概述
本次更新对WebSocket通信策略进行了重大调整，实现了智能的订阅队列管理，避免重复订阅和取消订阅冲突。

### 主要改进

#### 1. 基础报文结构优化
- **新增唯一标识字段**: 所有WebSocket消息现在都包含唯一的`id`字段
- **消息追踪**: 支持消息的完整生命周期追踪
- **请求响应关联**: 通过ID字段关联请求和响应消息

#### 2. 新增服务端报文类型
- **unsubscribe_ack**: 取消订阅确认消息
  ```json
  {
    "type": "unsubscribe_ack",
    "id": "unsub_001_ack",
    "timestamp": "2025-09-03T14:48:07.974090",
    "data": {
      "request_id": "unsub_001",
      "unsubscribed": [],
      "failed": [],
      "total": 0
    }
  }
  ```

#### 3. 智能订阅队列管理

##### 待取消订阅信息Map
- 管理等待取消订阅的请求
- 支持页面级别的取消订阅操作
- 自动去重和冲突检测

##### 待订阅信息Map
- 管理等待订阅的请求
- 支持页面级别的订阅配置
- 智能延迟处理机制

#### 4. 核心策略逻辑

##### 取消订阅优先级
- 当有待取消订阅请求时，优先处理取消订阅操作
- 取消订阅完成后，自动处理待订阅队列

##### 智能冲突检测
- 检测待订阅和待取消订阅的冲突
- 自动跳过不必要的取消订阅操作
- 优化网络请求效率

##### 重连后队列处理
- 连接恢复后自动处理所有待处理的操作
- 确保操作顺序的正确性
- 支持断线重连的完整恢复

### 技术实现

#### 数据结构
```typescript
// 待订阅信息结构
interface PendingSubscription {
  id: string
  pageId: string
  config: SubscriptionConfig
  listeners: any
  timestamp: number
}

// 待取消订阅信息结构
interface PendingUnsubscription {
  id: string
  pageId: string
  channels: number[]
  timestamp: number
}
```

#### 核心方法
- `processPendingUnsubscriptions()`: 处理待取消订阅队列
- `processPendingSubscriptions()`: 处理待订阅队列
- `isSameSubscription()`: 订阅配置冲突检测
- `generateMessageId()`: 生成唯一消息ID

#### 消息流程
1. **订阅请求**: 检查待取消订阅队列 → 添加到待订阅队列或直接发送
2. **取消订阅请求**: 添加到待取消订阅队列 → 立即处理或等待连接
3. **连接恢复**: 自动处理所有待处理的操作队列
4. **确认处理**: 收到确认消息后自动处理下一个队列

### 使用示例

#### 基本订阅
```typescript
// 页面订阅
const { subscribePage } = useWebSocket('home', config, listeners)
subscribePage('home', {
  channels: [1, 2, 3],
  dataTypes: ['T', 'S'],
  interval: 1000
}, listeners)
```

#### 取消订阅
```typescript
// 取消页面订阅
const { unsubscribePage } = useWebSocket('home', config, listeners)
unsubscribePage('home', [1, 2]) // 取消指定频道
unsubscribePage('home') // 取消所有频道
```

### 优势特性

1. **避免冲突**: 智能检测和处理订阅冲突
2. **队列管理**: 有序处理所有订阅和取消订阅请求
3. **断线恢复**: 支持完整的断线重连恢复
4. **性能优化**: 减少不必要的网络请求
5. **状态一致性**: 确保订阅状态的一致性

## 开发指南

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 pnpm >= 7.0.0

### 安装依赖
```bash
npm install
# 或
pnpm install
```

### 开发模式
```bash
npm run dev
# 或
pnpm dev
```

### 构建生产版本
```bash
npm run build
# 或
pnpm build
```

### 代码检查
```bash
npm run lint
# 或
pnpm lint
```

## 部署说明

### Docker部署
```bash
# 构建镜像
docker build -t cloudems .

# 运行容器
docker run -d -p 80:80 cloudems
```

### 环境变量配置
```bash
# WebSocket服务地址
VITE_WS_URL=ws://your-websocket-server.com/ws

# API服务地址
VITE_API_BASE_URL=https://your-api-server.com/api
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目维护者: AI进化论-花生
- 邮箱: [your-email@example.com]
- 项目地址: [https://github.com/your-username/CloudEMS]

---

**注意**: 本规则由 AI进化论-花生 创建，版权所有，引用请注明出处。
