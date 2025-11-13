/**
 * STOMP WebSocket 连接管理器
 * 提供基于 STOMP 协议的 WebSocket 连接管理和消息订阅功能
 *
 * 主要功能：
 *  - 管理 STOMP 连接的生命周期（连接、断开、重连、心跳等）
 *  - 支持多主题订阅与取消订阅
 *  - 支持告警、通知等多种消息类型
 *  - 提供全局和局部监听器机制
 *  - 连接状态、统计信息响应式
 *  - 自动断线重连，智能订阅队列管理
 */

import { ref, reactive, computed } from 'vue'
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 连接状态类型
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

// STOMP 连接配置
interface StompConfig {
  brokerURL: string // WebSocket 连接地址
  reconnectDelay?: number // 重连延迟(ms)
  heartbeatIncoming?: number // 接收心跳间隔(ms)
  heartbeatOutgoing?: number // 发送心跳间隔(ms)
  connectionTimeout?: number // 连接超时时间(ms)
  debug?: boolean // 是否开启调试模式
  useSockJS?: boolean // 是否使用 SockJS
}

// 订阅配置
interface SubscriptionConfig {
  destination: string // 订阅目的地（主题）
  headers?: Record<string, string> // 订阅头部
}

// 消息监听器
interface MessageListener {
  (message: any): void
}

// 全局监听器配置
interface GlobalListeners {
  onConnect?: () => void
  onDisconnect?: () => void
  onReconnect?: () => void
  onError?: (error: any) => void
}

// 订阅记录
interface SubscriptionRecord {
  id: string
  destination: string
  subscription: StompSubscription
  listener: MessageListener
}

class StompManager {
  // STOMP 客户端实例
  private client: Client | null = null
  // 连接配置
  private config: Required<StompConfig>
  // 当前重连次数
  private reconnectAttempts = 0
  // 最大重连次数
  private maxReconnectAttempts = Infinity
  // 重连定时器
  private reconnectTimer: number | null = null

  // 响应式连接状态
  public readonly status = ref<ConnectionStatus>('disconnected')
  // 是否已连接
  public readonly isConnected = computed(() => this.status.value === 'connected')
  // 是否正在连接
  public readonly isConnecting = computed(
    () => this.status.value === 'connecting' || this.status.value === 'reconnecting',
  )

  // 全局监听器配置
  private globalListeners: GlobalListeners = {}

  // 订阅管理：订阅ID -> 订阅记录
  private subscriptions = new Map<string, SubscriptionRecord>()

  // 待订阅队列（连接成功后自动订阅）
  private pendingSubscriptions = new Map<
    string,
    { config: SubscriptionConfig; listener: MessageListener }
  >()

  // 连接统计信息（响应式）
  public readonly connectionStats = reactive({
    connectTime: 0, // 上次连接时间戳
    disconnectTime: 0, // 上次断开时间戳
    messageCount: 0, // 收到的消息总数
    errorCount: 0, // 错误次数
    reconnectCount: 0, // 重连次数
  })

  /**
   * 构造函数，初始化 STOMP 配置
   * @param config StompConfig
   */
  constructor(config: StompConfig) {
    // 合并默认配置和传入配置
    this.config = {
      reconnectDelay: 5000, // 默认重连延迟5秒
      heartbeatIncoming: 5000, // 默认接收心跳10秒
      heartbeatOutgoing: 5000, // 默认发送心跳10秒
      connectionTimeout: 10000, // 默认连接超时20秒
      debug: true, // 默认不开启调试
      useSockJS: true, // 默认不使用 SockJS
      ...config,
    }
  }

  /**
   * 生成唯一订阅ID
   * @returns 唯一ID字符串
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 建立 STOMP 连接
   * @returns Promise<void>
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查用户登录状态和token
      const userStore = useUserStore()
      if (!userStore.isLoggedIn || !userStore.token) {
        console.log('[STOMP] 用户未登录或token无效，跳过连接')
        reject(new Error('User not logged in or token invalid'))
        return
      }

      // 已连接则直接resolve
      if (this.client && this.client.connected) {
        resolve()
        return
      }

      // 设置状态为连接中
      this.status.value = 'connecting'
      this.connectionStats.connectTime = Date.now()

      try {
        // 创建 STOMP 客户端实例
        this.client = new Client({
          // WebSocket 工厂函数
          webSocketFactory: () => {
            if (this.config.useSockJS) {
              // 使用 SockJS
              return new SockJS(this.config.brokerURL) as any
            } else {
              // 原生 WebSocket
              return new WebSocket(this.config.brokerURL)
            }
          },

          // 连接头部（可携带认证信息）
          connectHeaders: {
            Authorization: `Bearer ${userStore.token}`,
          },

          // 心跳配置
          heartbeatIncoming: this.config.heartbeatIncoming,
          heartbeatOutgoing: this.config.heartbeatOutgoing,

          // 重连延迟
          reconnectDelay: this.config.reconnectDelay,

          // 调试函数
          debug: this.config.debug
            ? (msg: string) => {
                console.log('[STOMP Debug]', msg)
              }
            : undefined,

          // 连接成功回调
          onConnect: () => {
            console.log('[STOMP] 连接成功')
            this.status.value = 'connected'
            this.reconnectAttempts = 0
            this.connectionStats.connectTime = Date.now()

            // 触发连接成功回调
            this.globalListeners.onConnect?.()

            // 处理待订阅队列
            this.processPendingSubscriptions()

            resolve()
          },

          // 连接断开回调
          onDisconnect: () => {
            console.log('[STOMP] 连接断开')
            this.status.value = 'disconnected'
            this.connectionStats.disconnectTime = Date.now()

            // 触发断开连接回调
            this.globalListeners.onDisconnect?.()

            // 清空订阅记录（重连后会重新订阅）
            this.subscriptions.clear()
          },

          // WebSocket 关闭回调
          onWebSocketClose: (event) => {
            console.log('[STOMP] WebSocket 关闭:', event.code, event.reason)
            this.status.value = 'disconnected'
            this.connectionStats.disconnectTime = Date.now()

            // 如果不是主动关闭，触发重连
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
              this.scheduleReconnect()
            }
          },

          // WebSocket 错误回调
          onWebSocketError: (error) => {
            console.error('[STOMP] WebSocket 错误:', error)
            this.status.value = 'error'
            this.connectionStats.errorCount++

            // 触发错误回调
            this.globalListeners.onError?.(error)

            reject(error)
          },

          // STOMP 错误回调
          onStompError: (frame) => {
            console.error('[STOMP] STOMP 协议错误:', frame.headers['message'])
            console.error('[STOMP] 错误详情:', frame.body)
            this.status.value = 'error'
            this.connectionStats.errorCount++

            // 触发错误回调
            this.globalListeners.onError?.({
              message: frame.headers['message'],
              body: frame.body,
            })

            ElMessage.error(`STOMP错误: ${frame.headers['message']}`)
          },
        })

        // 激活连接
        this.client.activate()
      } catch (error) {
        console.error('[STOMP] 连接失败:', error)
        this.status.value = 'error'
        this.connectionStats.errorCount++
        reject(error)
      }
    })
  }

  /**
   * 处理待订阅队列
   * 连接成功后自动订阅所有待订阅的主题
   */
  private processPendingSubscriptions(): void {
    if (this.pendingSubscriptions.size === 0) {
      return
    }

    console.log('[STOMP] 处理待订阅队列，数量:', this.pendingSubscriptions.size)

    // 遍历所有待订阅的主题
    for (const [id, { config, listener }] of this.pendingSubscriptions) {
      try {
        this.subscribeInternal(id, config, listener)
        // 订阅成功后从待订阅队列中移除
        this.pendingSubscriptions.delete(id)
      } catch (error) {
        console.error(`[STOMP] 订阅失败: ${config.destination}`, error)
      }
    }
  }

  /**
   * 内部订阅方法
   * @param id 订阅ID
   * @param config 订阅配置
   * @param listener 消息监听器
   */
  private subscribeInternal(
    id: string,
    config: SubscriptionConfig,
    listener: MessageListener,
  ): void {
    if (!this.client || !this.client.connected) {
      throw new Error('STOMP 客户端未连接')
    }
    // 执行订阅
    const subscription = this.client.subscribe(
      config.destination,
      (message: IMessage) => {
        try {
          // 解析消息体
          
          const data = JSON.parse(message.body)
          this.connectionStats.messageCount++
            
          // 调用监听器Permit Discharge Power
          listener(data)
        } catch (error) {
          console.error('[STOMP] 消息解析失败:', error)
          this.connectionStats.errorCount++
        }
      },
      config.headers,
    )

    // 记录订阅
    this.subscriptions.set(id, {
      id,
      destination: config.destination,
      subscription,
      listener,
    })

    console.log(`[STOMP] 订阅成功: ${config.destination}`)
  }

  /**
   * 订阅主题
   * @param config 订阅配置
   * @param listener 消息监听器
   * @returns 订阅ID
   */
  public subscribe(config: SubscriptionConfig, listener: MessageListener): string {
    const subscriptionId = this.generateSubscriptionId()

    // 如果已连接，直接订阅
    if (this.client && this.client.connected) {
      try {
        this.subscribeInternal(subscriptionId, config, listener)
      } catch (error) {
        console.error(`[STOMP] 订阅失败: ${config.destination}`, error)
        throw error
      }
    } else {
      // 如果未连接，添加到待订阅队列
      console.log(`[STOMP] 添加到待订阅队列: ${config.destination}`)
      this.pendingSubscriptions.set(subscriptionId, { config, listener })
    }

    return subscriptionId
  }

  /**
   * 取消订阅
   * @param subscriptionId 订阅ID
   */
  public unsubscribe(subscriptionId: string): void {
    // 从待订阅队列中移除（如果存在）
    if (this.pendingSubscriptions.has(subscriptionId)) {
      this.pendingSubscriptions.delete(subscriptionId)
      console.log(`[STOMP] 从待订阅队列中移除: ${subscriptionId}`)
      return
    }

    // 从已订阅记录中查找并取消订阅
    const record = this.subscriptions.get(subscriptionId)
    if (!record) {
      console.warn(`[STOMP] 订阅ID不存在: ${subscriptionId}`)
      return
    }

    try {
      // 取消订阅
      record.subscription.unsubscribe()
      // 从订阅记录中移除
      this.subscriptions.delete(subscriptionId)
      console.log(`[STOMP] 取消订阅成功: ${record.destination}`)
    } catch (error) {
      console.error(`[STOMP] 取消订阅失败: ${record.destination}`, error)
    }
  }

  /**
   * 发送消息到指定目的地
   * @param destination 目的地
   * @param body 消息体
   * @param headers 可选的消息头
   */
  public send(destination: string, body: any, headers?: Record<string, string>): void {
    if (!this.client || !this.client.connected) {
      console.error('[STOMP] 客户端未连接，无法发送消息')
      return
    }

    try {
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body)
      this.client.publish({
        destination,
        body: bodyString,
        headers,
      })
      console.log(`[STOMP] 发送消息到: ${destination}`, body)
    } catch (error) {
      console.error(`[STOMP] 发送消息失败: ${destination}`, error)
      this.connectionStats.errorCount++
    }
  }

  /**
   * 设置全局监听器
   * @param listeners 监听器配置
   */
  public setGlobalListeners(listeners: GlobalListeners): void {
    this.globalListeners = { ...this.globalListeners, ...listeners }
  }

  /**
   * 安排重连
   * 使用指数退避算法延迟重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    this.connectionStats.reconnectCount++
    this.status.value = 'reconnecting'

    // 计算重连延迟（使用指数退避）
    const delay = this.config.reconnectDelay * Math.min(Math.pow(2, this.reconnectAttempts - 1), 8)

    console.log(`[STOMP] ${delay}ms后尝试重连 (第${this.reconnectAttempts}次)`)

    this.reconnectTimer = setTimeout(() => {
      this.globalListeners.onReconnect?.()
      this.connect().catch((error) => {
        console.error('[STOMP] 重连失败:', error)
      })
    }, delay)
  }

  /**
   * 主动断开 STOMP 连接
   */
  public disconnect(): void {
    console.log('[STOMP] 主动断开连接')

    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // 取消所有订阅
    this.subscriptions.forEach((record) => {
      try {
        record.subscription.unsubscribe()
      } catch (error) {
        console.error(`[STOMP] 取消订阅失败: ${record.destination}`, error)
      }
    })

    // 断开连接
    if (this.client) {
      this.client.deactivate()
      this.client = null
    }

    // 清理状态
    this.subscriptions.clear()
    this.pendingSubscriptions.clear()
    this.status.value = 'disconnected'
    this.reconnectAttempts = 0
  }

  /**
   * 获取当前连接统计信息
   * @returns 统计信息对象
   */
  public getStats() {
    return {
      status: this.status.value,
      isConnected: this.isConnected.value,
      subscriptionsCount: this.subscriptions.size,
      pendingSubscriptionsCount: this.pendingSubscriptions.size,
      ...this.connectionStats,
    }
  }

  /**
   * 获取所有订阅列表
   * @returns 订阅列表
   */
  public getSubscriptions(): Array<{ id: string; destination: string }> {
    return Array.from(this.subscriptions.values()).map((record) => ({
      id: record.id,
      destination: record.destination,
    }))
  }
}

// 默认导出配置（需要根据实际情况修改）
// 示例配置，实际使用时请根据后端地址修改
const stompManager = new StompManager({
  brokerURL: '/api/register-app/socket',
  reconnectDelay: 5000,
  heartbeatIncoming: 2000,
  heartbeatOutgoing: 2000,
  debug: true, // 开发环境开启调试
  useSockJS: true, // 如果后端使用 SockJS，设置为 true
})

export default stompManager
export { StompManager, type StompConfig, type SubscriptionConfig, type MessageListener }

