/**
 * websocket.ts 测试文件
 * 测试WebSocket连接管理器的核心功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { SubscriptionConfig, ListenerConfig } from '@/types/websocket'

// Mock依赖
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    isLoggedIn: true,
    token: 'mock-token',
    clearUserData: vi.fn(),
  })),
}))

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  public readyState = MockWebSocket.CONNECTING
  public onopen: ((event: Event) => void) | null = null
  public onclose: ((event: CloseEvent) => void) | null = null
  public onmessage: ((event: MessageEvent) => void) | null = null
  public onerror: ((event: Event) => void) | null = null

  constructor(public url: string) {
    // 模拟异步连接
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 10)
  }

  send(data: string) {
    // Mock发送消息
    console.log('Mock WebSocket send:', data)
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }))
    }
  }
}

// 替换全局WebSocket
Object.defineProperty(global, 'WebSocket', {
  writable: true,
  value: MockWebSocket,
})

describe('WebSocketManager', () => {
  let wsManager: any
  let mockUserStore: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // 重置mock user store
    mockUserStore = {
      isLoggedIn: true,
      token: 'mock-token',
      clearUserData: vi.fn(),
    }
    vi.mocked(useUserStore).mockReturnValue(mockUserStore)

    // 动态导入WebSocketManager
    const { default: WebSocketManagerClass } = await import('../websocket')
    
    // 创建WebSocket管理器实例
    wsManager = new (WebSocketManagerClass as any)({
      url: 'ws://localhost:8080/ws',
      reconnectInterval: 1000,
      maxReconnectAttempts: 3,
      heartbeatInterval: 5000,
      heartbeatTimeout: 3000,
    })
  })

  afterEach(() => {
    wsManager.disconnect()
  })

  describe('连接管理', () => {
    it('应该能够建立连接', async () => {
      await wsManager.connect()
      
      expect(wsManager.isConnected.value).toBe(true)
      expect(wsManager.status.value).toBe('connected')
    })

    it('应该处理连接失败', async () => {
      // 模拟用户未登录
      mockUserStore.isLoggedIn = false
      mockUserStore.token = null

      await expect(wsManager.connect()).rejects.toThrow('User not logged in or token invalid')
    })

    it('应该处理重复连接', async () => {
      await wsManager.connect()
      await wsManager.connect() // 重复连接应该直接成功
      
      expect(wsManager.isConnected.value).toBe(true)
    })
  })

  describe('订阅管理', () => {
    beforeEach(async () => {
      await wsManager.connect()
    })

    it('应该能够全局订阅', () => {
      const config: SubscriptionConfig = {
        channels: [1, 2, 3],
        dataTypes: ['data' as any, 'alarm' as any],
        interval: 1000,
      }

      wsManager.subscribe(config)

      // 验证订阅被添加到待订阅队列
      expect(wsManager.getStats().pageSubscriptions).toBe(0) // 全局订阅不计入页面订阅
    })

    it('应该能够页面订阅', () => {
      const config: SubscriptionConfig = {
        channels: [1, 2, 3],
        dataTypes: ['data' as any, 'alarm' as any],
        interval: 1000,
      }

      const listeners = {
        onDataUpdate: vi.fn(),
        onBatchDataUpdate: vi.fn(),
        onAlarm: vi.fn(),
      }

      const subscriptionId = wsManager.subscribePage('test-page', config, listeners)

      expect(subscriptionId).toBeDefined()
      expect(wsManager.getStats().pageSubscriptions).toBe(1)
    })

    it('应该能够取消订阅', () => {
      const config: SubscriptionConfig = {
        channels: [1, 2, 3],
        dataTypes: ['data' as any, 'alarm' as any],
        interval: 1000,
      }

      wsManager.subscribe(config)
      wsManager.unsubscribe([1, 2])

      // 验证取消订阅请求被添加到队列
      expect(wsManager.getStats().pageSubscriptions).toBe(0)
    })

    it('应该能够取消页面订阅', () => {
      const config: SubscriptionConfig = {
        channels: [1, 2, 3],
        dataTypes: ['data' as any, 'alarm' as any],
        interval: 1000,
      }

      const listeners = {
        onDataUpdate: vi.fn(),
        onBatchDataUpdate: vi.fn(),
        onAlarm: vi.fn(),
      }

      wsManager.subscribePage('test-page', config, listeners)
      wsManager.unsubscribePage('test-page', [1, 2])

      expect(wsManager.getStats().pageSubscriptions).toBe(0)
    })
  })

  describe('消息处理', () => {
    beforeEach(async () => {
      await wsManager.connect()
    })

    it('应该处理数据更新消息', () => {
      const mockData = {
        channel_id: 1,
        data: { value: 100 },
        timestamp: '2024-01-01T10:00:00Z',
      }

      const globalListener = {
        onDataUpdate: vi.fn(),
      }
      wsManager.setGlobalListeners(globalListener)

      // 模拟收到消息
      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'data_update',
          data: mockData,
        }),
      })

      // 手动触发消息处理
      const ws = (wsManager as any).ws
      if (ws && ws.onmessage) {
        ws.onmessage(messageEvent)
      }

      expect(globalListener.onDataUpdate).toHaveBeenCalledWith(mockData)
    })

    it('应该处理批量数据更新消息', () => {
      const mockBatchData = {
        updates: [
          { channel_id: 1, data: { value: 100 } },
          { channel_id: 2, data: { value: 200 } },
        ],
      }

      const globalListener = {
        onBatchDataUpdate: vi.fn(),
      }
      wsManager.setGlobalListeners(globalListener)

      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'data_batch',
          data: mockBatchData,
        }),
      })

      const ws = (wsManager as any).ws
      if (ws && ws.onmessage) {
        ws.onmessage(messageEvent)
      }

      expect(globalListener.onBatchDataUpdate).toHaveBeenCalledWith(mockBatchData)
    })

    it('应该处理告警消息', () => {
      const mockAlarm = {
        id: 1,
        level: 'critical',
        message: 'System error',
        timestamp: '2024-01-01T10:00:00Z',
      }

      const globalListener = {
        onAlarm: vi.fn(),
      }
      wsManager.setGlobalListeners(globalListener)

      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'alarm',
          data: mockAlarm,
        }),
      })

      const ws = (wsManager as any).ws
      if (ws && ws.onmessage) {
        ws.onmessage(messageEvent)
      }

      expect(globalListener.onAlarm).toHaveBeenCalledWith(mockAlarm)
    })

    it('应该处理订阅确认消息', () => {
      const mockAck = {
        request_id: 'test-request-id',
        subscribed: [1, 2, 3],
        failed: [],
      }

      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'subscribe_ack',
          data: mockAck,
        }),
      })

      const ws = (wsManager as any).ws
      if (ws && ws.onmessage) {
        ws.onmessage(messageEvent)
      }

      // 验证没有错误消息
      expect(ElMessage.warning).not.toHaveBeenCalled()
    })

    it('应该处理取消订阅确认消息', () => {
      const mockAck = {
        request_id: 'test-request-id',
        unsubscribed: [1, 2, 3],
        failed: [],
      }

      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'unsubscribe_ack',
          data: mockAck,
        }),
      })

      const ws = (wsManager as any).ws
      if (ws && ws.onmessage) {
        ws.onmessage(messageEvent)
      }

      // 验证没有错误消息
      expect(ElMessage.warning).not.toHaveBeenCalled()
    })

    it('应该处理服务器错误消息', () => {
      const mockError = {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
      }

      const globalListener = {
        onError: vi.fn(),
      }
      wsManager.setGlobalListeners(globalListener)

      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'error',
          data: mockError,
        }),
      })

      const ws = (wsManager as any).ws
      if (ws && ws.onmessage) {
        ws.onmessage(messageEvent)
      }

      expect(globalListener.onError).toHaveBeenCalledWith(mockError)
      expect(ElMessage.error).toHaveBeenCalledWith(`WebSocket错误: ${mockError.message}`)
    })
  })

  describe('控制命令', () => {
    beforeEach(async () => {
      await wsManager.connect()
    })

    it('应该能够发送控制命令', () => {
      const sendSpy = vi.spyOn((wsManager as any), 'sendMessage')

      wsManager.sendControlCommand(1, 2, 'start', 100, 'admin', 'Test command')

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'control',
          data: {
            channel_id: 1,
            point_id: 2,
            command_type: 'start',
            value: 100,
            operator: 'admin',
            reason: 'Test command',
          },
        })
      )
    })

    it('应该能够发送心跳ping', () => {
      const sendSpy = vi.spyOn((wsManager as any), 'sendMessage')

      wsManager.sendPing()

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ping',
        })
      )
    })
  })

  describe('连接状态和统计', () => {
    it('应该提供正确的连接状态', () => {
      expect(wsManager.status.value).toBe('disconnected')
      expect(wsManager.isConnected.value).toBe(false)
      expect(wsManager.isConnecting.value).toBe(false)
    })

    it('应该提供连接统计信息', () => {
      const stats = wsManager.getStats()

      expect(stats).toHaveProperty('status')
      expect(stats).toHaveProperty('isConnected')
      expect(stats).toHaveProperty('pageSubscriptions')
      expect(stats).toHaveProperty('connectTime')
      expect(stats).toHaveProperty('disconnectTime')
      expect(stats).toHaveProperty('messageCount')
      expect(stats).toHaveProperty('errorCount')
      expect(stats).toHaveProperty('latency')
    })
  })

  describe('断开连接', () => {
    beforeEach(async () => {
      await wsManager.connect()
    })

    it('应该能够主动断开连接', () => {
      wsManager.disconnect()

      expect(wsManager.status.value).toBe('disconnected')
      expect(wsManager.isConnected.value).toBe(false)
    })

    it('应该清理所有订阅和监听器', () => {
      // 添加一些订阅
      wsManager.subscribe({
        channels: [1, 2, 3],
        dataTypes: ['data' as any],
        interval: 1000,
      })

      wsManager.subscribePage('test-page', {
        channels: [4, 5, 6],
        dataTypes: ['alarm' as any],
        interval: 2000,
      }, {
        onDataUpdate: vi.fn(),
      })

      const statsBefore = wsManager.getStats()
      expect(statsBefore.pageSubscriptions).toBe(1)

      wsManager.disconnect()

      const statsAfter = wsManager.getStats()
      expect(statsAfter.pageSubscriptions).toBe(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理连接错误', async () => {
      // 模拟连接错误
      const originalWebSocket = global.WebSocket
      const ErrorWebSocket = class extends MockWebSocket {
        constructor(url: string) {
          super(url)
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Event('error'))
            }
          }, 5)
        }
      }
      
      Object.defineProperty(global, 'WebSocket', {
        writable: true,
        value: ErrorWebSocket,
      })

      await expect(wsManager.connect()).rejects.toThrow('WebSocket连接错误')

      // 恢复原始WebSocket
      Object.defineProperty(global, 'WebSocket', {
        writable: true,
        value: originalWebSocket,
      })
    })

    it('应该处理消息解析错误', async () => {
      await wsManager.connect()

      const messageEvent = new MessageEvent('message', {
        data: 'invalid json',
      })

      const ws = (wsManager as any).ws
      if (ws && ws.onmessage) {
        ws.onmessage(messageEvent)
      }

      // 验证错误计数增加
      const stats = wsManager.getStats()
      expect(stats.errorCount).toBeGreaterThan(0)
    })
  })

  describe('重连机制', () => {
    it('应该尝试重连', async () => {
      await wsManager.connect()

      // 模拟连接关闭
      const ws = (wsManager as any).ws
      if (ws && ws.onclose) {
        ws.onclose(new CloseEvent('close', { code: 1006 }))
      }

      // 等待重连尝试
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证重连尝试
      expect(wsManager.status.value).toBe('disconnected')
    })
  })
})
