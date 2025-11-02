# STOMP WebSocket 使用说明

## 概述

本项目已集成 STOMP 协议的 WebSocket 连接管理，提供了完整的订阅、取消订阅、心跳和断线重连功能。

## 安装的依赖

```json
{
  "@stomp/stompjs": "^7.2.1",
  "sockjs-client": "^1.6.1",
  "@types/sockjs-client": "^1.5.4"
}
```

## 核心文件

1. **`src/utils/stomp.ts`** - STOMP 管理器核心类
2. **`src/composables/useStomp.ts`** - Vue Composable，方便在组件中使用
3. **`src/App.vue`** - 全局初始化和告警订阅

## 主要功能

### ✅ 连接管理
- 自动连接和断开
- 断线自动重连（指数退避算法）
- 连接状态监控

### ✅ 心跳机制
- 自动发送和接收心跳
- 可配置心跳间隔
- 心跳超时检测

### ✅ 订阅管理
- 支持多主题订阅
- 自动管理订阅生命周期
- 组件卸载时自动清理订阅

### ✅ 断线重连
- 自动重连机制
- 指数退避策略
- 重连后自动恢复订阅

## 配置说明

### 环境变量配置

在 `.env` 文件中配置 STOMP 服务器地址：

```bash
# 开发环境 (.env.development)
VITE_STOMP_URL=ws://localhost:8080/ws

# 生产环境 (.env.production)
VITE_STOMP_URL=wss://your-domain.com/ws
```

### 默认配置

```typescript
{
  brokerURL: 'ws://localhost:8080/ws',  // WebSocket 连接地址
  reconnectDelay: 5000,                  // 重连延迟 5秒
  heartbeatIncoming: 10000,              // 接收心跳间隔 10秒
  heartbeatOutgoing: 10000,              // 发送心跳间隔 10秒
  connectionTimeout: 20000,              // 连接超时 20秒
  debug: false,                          // 调试模式（生产环境建议关闭）
  useSockJS: false                       // 是否使用 SockJS
}
```

## 使用方式

### 方式一：在 App.vue 中全局使用（推荐用于全局告警）

已经在 `App.vue` 中配置好了，会自动：
- 在用户登录后连接 STOMP
- 订阅 `/topic/alarm` 主题
- 在用户登出时断开连接

```typescript
// src/App.vue
import stompManager from '@/utils/stomp'

// 初始化连接
await stompManager.connect()

// 订阅告警主题
stompManager.subscribe(
  {
    destination: '/topic/alarm',
  },
  (alarm) => {
    console.log('收到告警:', alarm)
  },
)
```

### 方式二：在组件中使用 Composable（推荐）

```vue
<script setup lang="ts">
import useStomp from '@/composables/useStomp'

// 初始化 STOMP（自动连接）
const { 
  isConnected, 
  subscribeAlarm, 
  subscribe, 
  unsubscribe 
} = useStomp()

// 订阅告警
const alarmSubId = subscribeAlarm((alarm) => {
  console.log('收到告警:', alarm)
  ElMessage.error(alarm.message)
})

// 订阅自定义主题
const customSubId = subscribe(
  {
    destination: '/topic/custom',
  },
  (message) => {
    console.log('收到自定义消息:', message)
  },
)

// 组件卸载时会自动取消订阅，也可以手动取消
// unsubscribe(alarmSubId)
</script>
```

### 方式三：直接使用 StompManager

```typescript
import stompManager from '@/utils/stomp'

// 连接
await stompManager.connect()

// 订阅
const subId = stompManager.subscribe(
  {
    destination: '/topic/notifications',
    headers: {
      // 可选的自定义头部
      'custom-header': 'value',
    },
  },
  (message) => {
    console.log('收到通知:', message)
  },
)

// 发送消息
stompManager.send('/app/command', {
  action: 'test',
  data: 'hello',
})

// 取消订阅
stompManager.unsubscribe(subId)

// 断开连接
stompManager.disconnect()
```

## 常见主题示例

```typescript
// 告警主题
'/topic/alarm'                    // 所有告警
'/topic/alarm/critical'           // 严重告警
'/topic/alarm/warning'            // 警告告警

// 通知主题
'/topic/notifications'            // 通知
'/topic/system'                   // 系统消息

// 用户特定主题
'/user/queue/private'             // 用户私有消息

// 点对点消息
'/app/chat'                       // 发送聊天消息
'/app/command'                    // 发送命令
```

## 监听连接状态

```typescript
const { status, isConnected, stats } = useStomp()

// 监听连接状态
watch(status, (newStatus) => {
  console.log('连接状态:', newStatus)
  // 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
})

// 查看统计信息
console.log('连接统计:', stats.value)
/*
{
  status: 'connected',
  isConnected: true,
  subscriptionsCount: 2,
  pendingSubscriptionsCount: 0,
  connectTime: 1699999999999,
  disconnectTime: 0,
  messageCount: 100,
  errorCount: 0,
  reconnectCount: 0
}
*/
```

## 全局监听器

```typescript
import stompManager from '@/utils/stomp'

stompManager.setGlobalListeners({
  onConnect: () => {
    console.log('STOMP 已连接')
  },
  onDisconnect: () => {
    console.log('STOMP 已断开')
  },
  onReconnect: () => {
    console.log('STOMP 正在重连...')
  },
  onError: (error) => {
    console.error('STOMP 错误:', error)
  },
  onAlarm: (alarm) => {
    // 全局告警处理
    ElMessage.error(alarm.message)
  },
})
```

## 后端对接说明

### STOMP 服务端配置示例（Spring Boot）

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 配置消息代理
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 注册 STOMP 端点
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .withSockJS(); // 如果使用 SockJS
    }
}
```

### 发送告警消息示例

```java
@Autowired
private SimpMessagingTemplate messagingTemplate;

public void sendAlarm(Alarm alarm) {
    // 发送到 /topic/alarm 主题
    messagingTemplate.convertAndSend("/topic/alarm", alarm);
}
```

## 使用 SockJS

如果后端使用了 SockJS，需要修改配置：

```typescript
// src/utils/stomp.ts
const stompManager = new StompManager({
  brokerURL: import.meta.env.VITE_STOMP_URL || 'http://localhost:8080/ws',
  useSockJS: true, // 启用 SockJS
  // ... 其他配置
})
```

## 注意事项

1. **认证头部**：连接时会自动携带 JWT Token，确保后端正确处理
2. **消息格式**：默认使用 JSON 格式，消息体会自动解析
3. **订阅清理**：使用 `useStomp()` composable 时，组件卸载会自动清理订阅
4. **重连机制**：断线后会自动重连，并恢复所有订阅
5. **心跳超时**：如果心跳超时，会自动断开并重连

## 调试

### 开启调试模式

```typescript
// src/utils/stomp.ts
const stompManager = new StompManager({
  // ...
  debug: true, // 开启调试，会在控制台输出详细日志
})
```

### 查看连接信息

```typescript
const stats = stompManager.getStats()
console.log('连接统计:', stats)

const subscriptions = stompManager.getSubscriptions()
console.log('当前订阅:', subscriptions)
```

## 故障排查

### 连接失败
1. 检查 `VITE_STOMP_URL` 环境变量是否正确
2. 检查后端 STOMP 服务是否启动
3. 检查网络和防火墙设置
4. 查看浏览器控制台错误信息

### 收不到消息
1. 确认已成功订阅主题
2. 检查主题名称是否正确
3. 确认后端有发送消息到该主题
4. 检查消息格式是否为 JSON

### 频繁重连
1. 检查心跳配置是否合理
2. 检查网络稳定性
3. 适当增加 `reconnectDelay` 延迟

## 完整示例

```vue
<template>
  <div class="alarm-monitor">
    <div>连接状态: {{ status }}</div>
    <div>告警数量: {{ alarmCount }}</div>
    <div>
      <el-button @click="testSend">发送测试消息</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import useStomp from '@/composables/useStomp'

const alarmCount = ref(0)

const {
  status,
  isConnected,
  subscribeAlarm,
  send,
  setGlobalListeners,
} = useStomp()

// 设置全局监听器
setGlobalListeners({
  onConnect: () => {
    ElMessage.success('STOMP 连接成功')
  },
  onError: (error) => {
    ElMessage.error('STOMP 连接错误')
  },
})

// 订阅告警
subscribeAlarm((alarm) => {
  alarmCount.value++
  console.log('收到告警:', alarm)
  
  ElNotification({
    title: '新告警',
    message: alarm.message,
    type: 'error',
    duration: 0,
  })
})

// 发送测试消息
const testSend = () => {
  send('/app/test', {
    message: 'Hello STOMP',
    timestamp: Date.now(),
  })
}
</script>
```

## 总结

STOMP 已经完全集成到项目中，提供了：
- ✅ 自动连接管理
- ✅ 心跳保活
- ✅ 断线重连
- ✅ 订阅管理
- ✅ 告警处理
- ✅ 状态监控

只需根据实际后端配置修改 `VITE_STOMP_URL` 和订阅的主题即可使用。

