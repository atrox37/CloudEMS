import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { computed, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

export interface StompConfig {
  brokerURL: string
  reconnectDelay?: number
  heartbeatIncoming?: number
  heartbeatOutgoing?: number
  connectionTimeout?: number
  debug?: boolean
  useSockJS?: boolean
}

export interface SubscriptionConfig {
  destination: string
  headers?: Record<string, string>
}

export interface MessageListener {
  (message: any): void
}

interface GlobalListeners {
  onConnect?: () => void
  onDisconnect?: () => void
  onReconnect?: () => void
  onError?: (error: any) => void
}

interface SubscriptionRecord {
  id: string
  destination: string
  config: SubscriptionConfig
  subscription: StompSubscription
  listener: MessageListener
}

export class StompManager {
  private client: Client | null = null
  private readonly config: Required<StompConfig>
  private reconnectAttempts = 0
  private connectionPromise: Promise<void> | null = null
  private readonly maxReconnectAttempts = Infinity
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private globalListeners: GlobalListeners = {}
  private subscriptions = new Map<string, SubscriptionRecord>()
  private pendingSubscriptions = new Map<
    string,
    { config: SubscriptionConfig; listener: MessageListener }
  >()

  public readonly status = ref<ConnectionStatus>('disconnected')
  public readonly isConnected = computed(() => this.status.value === 'connected')
  public readonly isConnecting = computed(() =>
    ['connecting', 'reconnecting'].includes(this.status.value),
  )
  public readonly connectionStats = reactive({
    connectTime: 0,
    disconnectTime: 0,
    messageCount: 0,
    errorCount: 0,
    reconnectCount: 0,
  })

  constructor(config: StompConfig) {
    this.config = {
      reconnectDelay: 5000,
      heartbeatIncoming: 5000,
      heartbeatOutgoing: 5000,
      connectionTimeout: 10000,
      debug: true,
      useSockJS: true,
      ...config,
    }
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }

  private createClient() {
    const userStore = useUserStore()
    return new Client({
      webSocketFactory: () =>
        this.config.useSockJS
          ? (new SockJS(this.config.brokerURL) as unknown as WebSocket)
          : new WebSocket(this.config.brokerURL),
      connectHeaders: {
        Authorization: `${userStore.token}`,
      },
      heartbeatIncoming: this.config.heartbeatIncoming,
      heartbeatOutgoing: this.config.heartbeatOutgoing,
      reconnectDelay: this.config.reconnectDelay,
      debug: this.config.debug
        ? (message: string) => console.log('[STOMP Debug]', message)
        : undefined,
      onConnect: () => {
        this.status.value = 'connected'
        this.reconnectAttempts = 0
        this.connectionStats.connectTime = Date.now()
        this.restoreSubscriptions()
        this.processPendingSubscriptions()
        this.globalListeners.onConnect?.()
      },
      onDisconnect: () => {
        this.status.value = 'disconnected'
        this.connectionStats.disconnectTime = Date.now()
        this.globalListeners.onDisconnect?.()
      },
      onWebSocketClose: (event) => {
        this.status.value = 'disconnected'
        this.connectionStats.disconnectTime = Date.now()
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      },
      onWebSocketError: (error) => {
        this.status.value = 'error'
        this.connectionStats.errorCount += 1
        this.globalListeners.onError?.(error)
      },
      onStompError: (frame) => {
        this.status.value = 'error'
        this.connectionStats.errorCount += 1
        this.globalListeners.onError?.({
          message: frame.headers['message'],
          body: frame.body,
        })
      },
    })
  }

  public connect(): Promise<void> {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn || !userStore.token) {
      return Promise.reject(new Error('User not logged in or token invalid'))
    }
    if (this.client?.connected) {
      return Promise.resolve()
    }
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.status.value = this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting'
    this.connectionStats.connectTime = Date.now()
    this.client = this.createClient()

    this.connectionPromise = new Promise((resolve, reject) => {
      const client = this.client!
      const originalConnect = client.onConnect
      const originalError = client.onWebSocketError

      client.onConnect = (frame) => {
        originalConnect?.(frame)
        this.connectionPromise = null
        resolve()
      }
      client.onWebSocketError = (error) => {
        originalError?.(error)
        this.connectionPromise = null
        reject(error)
      }

      try {
        client.activate()
      } catch (error) {
        this.status.value = 'error'
        this.connectionStats.errorCount += 1
        this.connectionPromise = null
        reject(error)
      }
    })
    return this.connectionPromise
  }

  private processPendingSubscriptions() {
    Array.from(this.pendingSubscriptions.entries()).forEach(([id, pending]) => {
      try {
        this.subscribeInternal(id, pending.config, pending.listener)
        this.pendingSubscriptions.delete(id)
      } catch (error) {
        console.error('[STOMP] failed to process pending subscription:', error)
      }
    })
  }

  /** STOMP broker subscriptions belong to a single connection; restore them after reconnect. */
  private restoreSubscriptions() {
    Array.from(this.subscriptions.values()).forEach((record) => {
      try {
        this.subscribeInternal(record.id, record.config, record.listener)
      } catch (error) {
        console.error('[STOMP] failed to restore subscription:', error)
      }
    })
  }

  private subscribeInternal(id: string, config: SubscriptionConfig, listener: MessageListener) {
    if (!this.client || !this.client.connected) {
      throw new Error('STOMP client is not connected')
    }

    const subscription = this.client.subscribe(
      config.destination,
      (message: IMessage) => {
        try {
          const parsed = JSON.parse(message.body)
          this.connectionStats.messageCount += 1
          listener(parsed)
        } catch {
          this.connectionStats.messageCount += 1
          listener(message.body)
        }
      },
      config.headers,
    )

    this.subscriptions.set(id, {
      id,
      destination: config.destination,
      config,
      subscription,
      listener,
    })
  }

  public subscribe(config: SubscriptionConfig, listener: MessageListener): string {
    const subscriptionId = this.generateSubscriptionId()
    if (this.client?.connected) {
      this.subscribeInternal(subscriptionId, config, listener)
    } else {
      this.pendingSubscriptions.set(subscriptionId, { config, listener })
    }
    return subscriptionId
  }

  public unsubscribe(subscriptionId: string): void {
    const pending = this.pendingSubscriptions.get(subscriptionId)
    if (pending) {
      this.pendingSubscriptions.delete(subscriptionId)
      return
    }

    const record = this.subscriptions.get(subscriptionId)
    if (!record) {
      return
    }
    record.subscription.unsubscribe()
    this.subscriptions.delete(subscriptionId)
  }

  public send(destination: string, body: any, headers?: Record<string, string>) {
    if (!this.client?.connected) {
      return
    }
    this.client.publish({
      destination,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers,
    })
  }

  public setGlobalListeners(listeners: GlobalListeners) {
    this.globalListeners = { ...this.globalListeners, ...listeners }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.reconnectAttempts += 1
    this.connectionStats.reconnectCount += 1
    this.status.value = 'reconnecting'
    const delay = this.config.reconnectDelay * Math.min(Math.pow(2, this.reconnectAttempts - 1), 8)

    this.reconnectTimer = setTimeout(() => {
      this.globalListeners.onReconnect?.()
      void this.connect().catch((error) => {
        console.error('[STOMP] reconnect failed:', error)
      })
    }, delay)
  }

  public async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.subscriptions.forEach((record) => {
      try {
        record.subscription.unsubscribe()
      } catch (error) {
        console.error('[STOMP] failed to unsubscribe:', error)
      }
    })
    this.subscriptions.clear()
    this.pendingSubscriptions.clear()

    if (this.client) {
      try {
        await this.client.deactivate()
      } finally {
        this.client = null
      }
    }

    this.status.value = 'disconnected'
    this.connectionPromise = null
    this.reconnectAttempts = 0
    this.connectionStats.disconnectTime = Date.now()
    this.globalListeners.onDisconnect?.()
  }

  public getStats() {
    return {
      status: this.status.value,
      isConnected: this.isConnected.value,
      subscriptionsCount: this.subscriptions.size,
      pendingSubscriptionsCount: this.pendingSubscriptions.size,
      ...this.connectionStats,
    }
  }

  public getSubscriptions(): Array<{ id: string; destination: string }> {
    return Array.from(this.subscriptions.values()).map((record) => ({
      id: record.id,
      destination: record.destination,
    }))
  }
}

const stompManager = new StompManager({
  brokerURL: '/api/register-app/socket',
  reconnectDelay: 5000,
  heartbeatIncoming: 2000,
  heartbeatOutgoing: 2000,
  debug: true,
  useSockJS: true,
})

export default stompManager

/** user-app STOMP — 站点 MQTT 实时属性经 RabbitMQ amq.topic 转发 */
export const userAppStompManager = new StompManager({
  brokerURL: '/api/user-app/socket',
  reconnectDelay: 5000,
  heartbeatIncoming: 2000,
  heartbeatOutgoing: 2000,
  debug: true,
  useSockJS: true,
})

/** 站点 MQTT 属性（property/MonarchHub/{stationSn}）对应的 STOMP 订阅地址 */
export function mqttPropertyDestination(stationSn: string): string {
  return `/topic/mqtt_property_${stationSn}`
}
