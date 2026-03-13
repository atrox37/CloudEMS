<template>
  <div class="voltage-class main-layout">
    <div class="main-layout__left">
      <!-- 侧边导航栏 -->
      <Sidebar />
    </div>
    <div class="main-layout__right" :class="{ collapse: globalStore.isCollapse }">
      <!-- 头部 -->
      <Header />
      <!-- 主内容区域 -->
      <main class="main-layout__content" :class="{ collapse: globalStore.isCollapse }">
        <router-view />
      </main>
    </div>
    <!-- AI助手全局组件 -->
    <AIAssistant />
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import stompManager from '@/utils/stomp'
import { useGlobalStore } from '@/stores/global'
import { useUserStore } from '@/stores/user'
import { useStationStore } from '@/stores/station'

const router = useRouter()
const route = useRoute()
const globalStore = useGlobalStore()

// 主布局挂载完成后关闭全局骨架屏
onMounted(() => {
  globalStore.appInitializing = false
})
const userStore = useUserStore()
const stationStore = useStationStore()

// 定义响应式变量，动态切换背景色
const isHomePage: Ref<boolean> = computed(() => {
  return route.name === 'home' ? true : false
})

// 轮询定时器
let stationPollingTimer: number | null = null

// 处理告警详情跳转（通过事件对象获取 deviceId）
const handleAlarmDetail = (event: Event) => {
  const target = event.currentTarget as HTMLElement
  const deviceId = target.dataset.deviceId
  ElMessage.closeAll()
  if (deviceId) {
    router.push({ name: 'Alarm', params: { stationId: deviceId } })
  }
}

// 告警消息ID计数器
let alarmIdCount = 0
// 告警消息映射：alarm_id -> ElMessage 实例
const alarmMap = new Map<string, any>()
// 告警状态记录：alarm_id -> status，用于去重
const alarmStatusSet = new Set<string>()

/**
 * 根据站点ID获取站点名称
 * @param stationId 站点ID
 * @returns 站点名称，如果未找到则返回站点ID
 */
const getStationName = (stationId: number): string => {
  const station = stationStore.getStationById(stationId)
  return station?.stationName || String(stationId)
}

// 告警回调函数（定义在外层，可复用）
const alarmCb = (alarm: any) => {
  alarm.forEach((item: any) => {
    const alarmNumflag = item.property == 'N0'
    const alarmMsgflag = item.property == 'N1M' || item.property == 'N2M' || item.property == 'N3M'
    
    // 处理告警消息提示
    if (
      alarmMsgflag &&
      item.rawValue !== null &&
      item.rawValue !== '' &&
      item.rawValue !== undefined
    ) {
      try {
        const rowData = JSON.parse(item.rawValue)
        const alarmId = rowData.alarm_id
        const status = rowData.status
        
        // 提前判断 status，合并处理逻辑
        if (status !== 0 && status !== 1) {
          console.warn(`[MainLayout] 未知的告警状态: ${status}, alarm_id: ${alarmId}`)
          return
        }

        const alarmKey = `${alarmId}_${status}` // 使用 alarm_id + status 作为唯一标识

        // 检查是否已经存在相同 alarm_id 和 status 的告警（去重）
        if (alarmStatusSet.has(alarmKey)) {
          console.log(`[MainLayout] 告警 ${alarmId} 状态 ${status} 已存在，忽略重复告警`)
          return // 忽略重复告警
        }

        // 如果存在相同 alarm_id 但不同 status 的告警，先关闭旧消息
        const existingKeys = Array.from(alarmStatusSet).filter((key) => key.startsWith(`${alarmId}_`))
        if (existingKeys.length > 0) {
          const oldMessage = alarmMap.get(alarmId)
          if (oldMessage) {
            oldMessage.close()
            alarmMap.delete(alarmId)
            console.log(`[MainLayout] 关闭告警 ${alarmId} 的旧消息（状态变化）`)
          }
          // 清除旧的状态记录
          existingKeys.forEach((key) => {
            alarmStatusSet.delete(key)
          })
        }

        if (status == 1) {
          // 告警触发状态：显示告警消息
          const currentId = alarmIdCount++
          const stationName = getStationName(item.deviceId)
          const message = ElMessage({
            type: 'error',
            showClose: true,
            dangerouslyUseHTMLString: true,
            message: `
            <div style="display: flex; align-items: center; gap: 0.08rem;">
              <span>${stationName}</span>&nbsp;&nbsp;
              <span>${rowData.msg}</span>
              <button id="stomp-to-detail-btn-${currentId}" data-device-id="${item.deviceId}" style="padding:0.04rem 0.1rem;background-color: #ff6900; color: #fff; border: none; cursor: pointer; font-size:0.14rem; border-radius: 0.02rem;">to detail</button>
            </div>
          `,
            duration: 0,
            onClose: () => {
              // 清理事件监听器
              const buttonId = `stomp-to-detail-btn-${currentId}`
              const eventInfo = document.getElementById(buttonId)
              if (eventInfo) {
                eventInfo.removeEventListener('click', handleAlarmDetail)
                console.log(`[MainLayout] 清理STOMP告警按钮事件监听: ${buttonId}`)
              }
              // 从 Map 和 Set 中移除
              alarmMap.delete(alarmId)
              alarmStatusSet.delete(alarmKey)
            },
          })

          // 存储告警消息和状态
          alarmMap.set(alarmId, message)
          alarmStatusSet.add(alarmKey)
          console.log(`[MainLayout] 新增告警消息: ${alarmId}, 状态: ${status}`)

          // 添加按钮点击事件
          nextTick(() => {
            const buttonId = `stomp-to-detail-btn-${currentId}`
            const btn = document.getElementById(buttonId)
            if (btn) {
              btn.addEventListener('click', handleAlarmDetail)
            }
          })
        } else if (status == 0) {
          // 告警恢复状态：关闭告警消息并显示恢复提示
          // 关闭对应的告警消息（如果存在）
          const existingMessage = alarmMap.get(alarmId)
          if (existingMessage) {
            existingMessage.close()
            alarmMap.delete(alarmId)
            console.log(`[MainLayout] 关闭告警消息: ${alarmId}`)
          }

          // 从 Set 中移除所有相关状态（包括 status 1 和其他状态）
          const keysToRemove = Array.from(alarmStatusSet).filter((key) => key.startsWith(`${alarmId}_`))
          keysToRemove.forEach((key) => {
            alarmStatusSet.delete(key)
            console.log(`[MainLayout] 从状态记录中移除: ${key}`)
          })

          // 添加恢复状态到 Set（防止重复显示恢复消息）
          alarmStatusSet.add(alarmKey)

          // 显示恢复消息
          const stationName = getStationName(item.deviceId)
          ElMessage.success({
            message: `${stationName}: ${rowData.msg}`,
            duration: 3000,
          })
        }
      } catch (error) {
        console.error('[MainLayout] 解析告警消息失败:', error, item.rawValue)
      }
    }
    
    // 当收到告警数量变化时，更新对应站点的告警数量
    if (alarmNumflag) {
      // item.deviceId 对应站点ID，item.numberValue 对应告警数量
      stationStore.updateStationAlarmCount(item.deviceId, item.numberValue)
      console.log(`[MainLayout] 更新站点 ${item.deviceId} 告警数量: ${item.numberValue}`)
    }
  })

  console.log('[MainLayout] STOMP告警:', alarm)
}

// 清除站点轮询定时器
const clearStationPolling = () => {
  if (stationPollingTimer) {
    clearInterval(stationPollingTimer)
    stationPollingTimer = null
    console.log('[MainLayout] 清除站点列表轮询定时器')
  }
}

// 获取站点列表（store 会自动处理订阅）
const fetchStationsAndSubscribe = async () => {
  try {
    console.log('[MainLayout] 尝试获取站点列表...')
    // 使用 stationStore 的方法获取站点数据
    // store 会自动检测站点变化并更新 STOMP 订阅
    const res = await stationStore.fetchStationsSkipCancel()

    if (res.code === 200 && res.data && res.data.length > 0) {
      console.log('[MainLayout] 获取站点列表成功，数量:', res.data.length)
      // 清除轮询定时器
      clearStationPolling()
      return true
    } else {
      console.warn('[MainLayout] 获取站点列表成功但数据为空')
      return false
    }
  } catch (error) {
    console.error('[MainLayout] 获取站点列表失败:', error)
    return false
  }
}

// 启动站点列表轮询
const startStationPolling = () => {
  // 避免重复启动轮询
  if (stationPollingTimer) {
    console.log('[MainLayout] 站点列表轮询已在进行中')
    return
  }

  console.log('[MainLayout] 启动站点列表轮询，间隔: 10秒')

  // 每10秒尝试获取一次站点列表
  stationPollingTimer = setInterval(async () => {
    console.log('[MainLayout] 轮询：尝试获取站点列表...')
    await fetchStationsAndSubscribe()
  }, 10000) as unknown as number
}

// 初始化 STOMP 连接（只在用户登录后）
const initStomp = async () => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn || !userStore.token) {
    console.log('[MainLayout] 用户未登录，跳过STOMP连接')
    return
  }

  // 设置告警回调函数到 store（必须在获取站点列表之前设置）
  stationStore.setAlarmCallback(alarmCb)
  console.log('[MainLayout] 已设置告警回调函数到 store')

  // 设置全局监听器（无论连接成功与否都要设置）
  stompManager.setGlobalListeners({
    onConnect: () => {
      console.log('[MainLayout] STOMP已连接')
    },
    onDisconnect: () => {
      console.log('[MainLayout] STOMP连接断开')
    },
    onReconnect: () => {
      console.log('[MainLayout] STOMP正在重连...')
    },
    onError: (error) => {
      console.error('[MainLayout] STOMP错误:', error)
    },
  })

  // 获取站点列表（store 会自动处理订阅）
  const success = await fetchStationsAndSubscribe()

  // 如果首次获取失败，启动轮询机制
  if (!success) {
    console.log('[MainLayout] 首次获取站点列表失败，启动轮询机制')
    startStationPolling()
  }

  // 尝试连接 STOMP（即使失败也会自动重连，订阅已经在队列中）
  try {
    await stompManager.connect()
    console.log('[MainLayout] STOMP连接成功')
  } catch (error) {
    console.error('[MainLayout] STOMP首次连接失败，将自动重连:', error)
    // 不需要额外处理，STOMP会自动重连，订阅已经在待订阅队列中
  }
}

// 监听用户登录状态变化
watch(
  () => userStore.isLoggedIn,
  async (isLoggedIn, oldIsLoggedIn) => {
    // 避免初始化时 undefined -> false 触发断开逻辑
    if (isLoggedIn) {
      // 用户登录成功，连接WebSocket和STOMP
      console.log('[MainLayout] 用户登录成功，尝试连接WebSocket和STOMP')
      initStomp()
    } else if (oldIsLoggedIn === true) {
      // 仅当从已登录变为未登录时才执行清理（避免初始化时误触发）
      console.log('[MainLayout] 用户登出，断开WebSocket和STOMP连接')

      // 清除轮询定时器
      clearStationPolling()
      
      // 清空站点数据（会自动清除所有订阅）
      stationStore.clearStations()

      // 断开 STOMP 连接（异步，加 try/catch 防止异常冒泡）
      try {
        await stompManager.disconnect()
      } catch (e) {
        console.error('[MainLayout] 断开STOMP连接失败（已忽略）：', e)
      }
    }
  },{
    immediate: true,
  }
)

// 组件卸载时清理资源
onUnmounted(() => {
  console.log('[MainLayout] MainLayout组件卸载，清理资源')
  clearStationPolling()
})
</script>

<style lang="scss" scoped>
.voltage-class.main-layout {
  height: 100%;
  width: 100%;
  display: flex;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  // background: transparent;
  background-image: url('../assets/images/simple-bg.png');
  // z-index: -99;
  .main-layout__left {
    z-index: 99;
  }
  .main-layout__right {
    transition: width 0.3s ease-in-out;
    width: calc(100% - 2.2rem);
    // z-index: 99;
    &.collapse {
      width: calc(100% - 0.85rem);
    }
    .main-layout__content {
      padding: 0.2rem;
      height: calc(100% - 0.85rem);
      width: 100%;
    }
  }
}
</style>
