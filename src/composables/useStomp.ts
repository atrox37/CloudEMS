/**
 * STOMP 连接管理 Composable
 * 提供 STOMP 连接状态管理和主题订阅功能
 */

import { computed, onMounted, onUnmounted } from 'vue'
import stompManager, { type SubscriptionConfig, type MessageListener } from '@/utils/stomp'

/**
 * STOMP 连接管理
 * @param autoConnect 是否自动连接，默认 true
 * @returns STOMP 连接状态和方法
 */
export default function useStomp(autoConnect: boolean = true) {
  // 连接状态
  const status = computed(() => stompManager.status.value)
  const isConnected = computed(() => stompManager.isConnected.value)
  const isConnecting = computed(() => stompManager.isConnecting.value)

  // 连接统计
  const stats = computed(() => stompManager.getStats())

  // 订阅列表
  const subscriptions = computed(() => stompManager.getSubscriptions())

  // 当前组件的订阅ID列表（用于自动清理）
  const componentSubscriptions: string[] = []

  /**
   * 连接到 STOMP 服务器
   */
  const connect = async () => {
    try {
      await stompManager.connect()
      console.log('[useStomp] 连接成功')
    } catch (error) {
      console.error('[useStomp] 连接失败:', error)
      throw error
    }
  }

  /**
   * 断开 STOMP 连接
   */
  const disconnect = () => {
    stompManager.disconnect()
  }

  /**
   * 订阅主题
   * @param config 订阅配置
   * @param listener 消息监听器
   * @param autoCleanup 是否自动清理（组件卸载时），默认 true
   * @returns 订阅ID
   */
  const subscribe = (
    config: SubscriptionConfig,
    listener: MessageListener,
    autoCleanup: boolean = true,
  ): string => {
    const subscriptionId = stompManager.subscribe(config, listener)

    // 如果需要自动清理，记录订阅ID
    if (autoCleanup) {
      componentSubscriptions.push(subscriptionId)
    }

    return subscriptionId
  }

  /**
   * 取消订阅
   * @param subscriptionId 订阅ID
   */
  const unsubscribe = (subscriptionId: string) => {
    stompManager.unsubscribe(subscriptionId)

    // 从组件订阅列表中移除
    const index = componentSubscriptions.indexOf(subscriptionId)
    if (index > -1) {
      componentSubscriptions.splice(index, 1)
    }
  }

  /**
   * 订阅告警主题
   * @param alarmType 告警类型（可选，用于过滤特定类型告警）
   * @param listener 消息监听器
   * @returns 订阅ID
   */
  const subscribeAlarm = (listener: MessageListener, alarmType?: string): string => {
    const destination = alarmType ? `/topic/alarm/${alarmType}` : '/topic/alarm'

    return subscribe(
      {
        destination,
      },
      listener,
    )
  }

  /**
   * 发送消息
   * @param destination 目的地
   * @param body 消息体
   * @param headers 可选的消息头
   */
  const send = (destination: string, body: any, headers?: Record<string, string>) => {
    stompManager.send(destination, body, headers)
  }

  /**
   * 设置全局监听器
   */
  const setGlobalListeners = (listeners: {
    onConnect?: () => void
    onDisconnect?: () => void
    onReconnect?: () => void
    onError?: (error: any) => void
    onAlarm?: (alarm: any) => void
  }) => {
    stompManager.setGlobalListeners(listeners)
  }

  // 组件挂载时自动连接
  if (autoConnect) {
    onMounted(() => {
      if (!isConnected.value) {
        connect()
      }
    })
  }

  // 组件卸载时清理订阅
  onUnmounted(() => {
    // 取消所有由本组件创建的订阅
    componentSubscriptions.forEach((subscriptionId) => {
      stompManager.unsubscribe(subscriptionId)
    })
    componentSubscriptions.length = 0
  })

  return {
    // 状态
    status,
    isConnected,
    isConnecting,
    stats,
    subscriptions,

    // 连接管理
    connect,
    disconnect,

    // 订阅管理
    subscribe,
    unsubscribe,
    subscribeAlarm,

    // 消息发送
    send,

    // 全局监听器
    setGlobalListeners,
  }
}

