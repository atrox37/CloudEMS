import { computed, onMounted, onUnmounted } from 'vue'
import stompManager, { type MessageListener, type SubscriptionConfig } from '@/utils/stomp'

export default function useStomp(autoConnect = true) {
  const status = computed(() => stompManager.status.value)
  const isConnected = computed(() => stompManager.isConnected.value)
  const isConnecting = computed(() => stompManager.isConnecting.value)
  const stats = computed(() => stompManager.getStats())
  const subscriptions = computed(() => stompManager.getSubscriptions())
  const componentSubscriptions: string[] = []

  const connect = async () => {
    await stompManager.connect()
  }

  const disconnect = () => {
    void stompManager.disconnect()
  }

  const subscribe = (config: SubscriptionConfig, listener: MessageListener, autoCleanup = true) => {
    const subscriptionId = stompManager.subscribe(config, listener)
    if (autoCleanup) {
      componentSubscriptions.push(subscriptionId)
    }
    return subscriptionId
  }

  const unsubscribe = (subscriptionId: string) => {
    stompManager.unsubscribe(subscriptionId)
    const index = componentSubscriptions.indexOf(subscriptionId)
    if (index >= 0) {
      componentSubscriptions.splice(index, 1)
    }
  }

  const subscribeAlarm = (listener: MessageListener, alarmType?: string) => {
    return subscribe(
      { destination: alarmType ? `/topic/alarm/${alarmType}` : '/topic/alarm' },
      listener,
    )
  }

  const send = (destination: string, body: any, headers?: Record<string, string>) => {
    stompManager.send(destination, body, headers)
  }

  const setGlobalListeners = (listeners: {
    onConnect?: () => void
    onDisconnect?: () => void
    onReconnect?: () => void
    onError?: (error: any) => void
    onAlarm?: (alarm: any) => void
  }) => {
    stompManager.setGlobalListeners(listeners)
  }

  if (autoConnect) {
    onMounted(() => {
      if (!isConnected.value) {
        void connect()
      }
    })
  }

  onUnmounted(() => {
    componentSubscriptions.forEach((subscriptionId) => {
      stompManager.unsubscribe(subscriptionId)
    })
    componentSubscriptions.length = 0
  })

  return {
    status,
    isConnected,
    isConnecting,
    stats,
    subscriptions,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    subscribeAlarm,
    send,
    setGlobalListeners,
  }
}
