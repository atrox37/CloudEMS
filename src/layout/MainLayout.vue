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
const userStore = useUserStore()
const stationStore = useStationStore()

// 定义响应式变量，动态切换背景色
const isHomePage: Ref<boolean> = computed(() => {
  return route.name === 'home' ? true : false
})

// 轮询定时器
let stationPollingTimer: number | null = null
// 标记是否已成功订阅站点
let hasSubscribedStations = false

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
// 告警消息映射
const alarmMap = new Map()

// 告警回调函数（定义在外层，可复用）
const alarmCb = (alarm: any) => {
  console.log(alarm, '//////////////////////////////')
  alarm.forEach((item: any) => {
    const alarmNumflag = item.property == 'alarm_num'
    const alarmMsgflag = item.property == 'alarm_level_msg_3' || item.property == 'alarm_level_msg_2' || item.property == 'alarm_level_msg_1'
    
    // 处理告警消息提示
    if (
      alarmMsgflag &&
      item.rawValue !== null &&
      item.rawValue !== '' &&
      item.rawValue !== undefined
    ) {
      const rowData = JSON.parse(item.rawValue)
      if (rowData.status == 1) {
        // 告警触发状态，显示带跳转按钮的消息
        const currentId = alarmIdCount++
        const message = ElMessage({
          type: 'error',
          showClose: true,
          dangerouslyUseHTMLString: true,
          message: `
          <div style="display: flex; align-items: center; gap: 0.08rem;">
            <span>${item.deviceId}</span>&nbsp;&nbsp;
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
            alarmMap.delete(item.alarm_id)
          },
        })

        // 存储告警消息
        alarmMap.set(item.alarm_id, message)

        // 添加按钮点击事件
        nextTick(() => {
          const buttonId = `stomp-to-detail-btn-${currentId}`
          const btn = document.getElementById(buttonId)
          if (btn) {
            btn.addEventListener('click', handleAlarmDetail)
          }
        })
      } else {
        // 告警恢复状态
        ElMessage.success({
          message: rowData.msg,
          duration: 3000,
        })

        // 关闭对应的告警消息
        const existingMessage = alarmMap.get(item.alarm_id)
        if (existingMessage) {
          existingMessage.close()
          alarmMap.delete(item.alarm_id)
          console.log(`[MainLayout] 关闭STOMP告警消息: ${item.alarm_id}`)
        }
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

// 获取站点列表并订阅
const fetchStationsAndSubscribe = async () => {
  // 如果已经成功订阅过，不再重复订阅
  if (hasSubscribedStations) {
    console.log('[MainLayout] 已订阅站点，跳过重复订阅')
    return true
  }

  try {
    console.log('[MainLayout] 尝试获取站点列表...')
    // 使用 stationStore 的方法获取站点数据
    const res = await stationStore.fetchStationsSkipCancel()

    if (res.code === 200 && res.data && res.data.length > 0) {
      console.log('[MainLayout] 获取站点列表成功，数量:', res.data.length)
      
      const stationIdArray = res.data.map((item: any) => item.stationId)

      // 订阅所有站点的告警主题
      // 如果 STOMP 已连接，立即订阅
      // 如果 STOMP 未连接，加入待订阅队列，连接成功后自动订阅
      stationIdArray.forEach((stationId: number) => {
        stompManager.subscribe({ destination: `/topic/report_property_${stationId}` }, alarmCb)
        console.log(`[MainLayout] 订阅站点: ${stationId}`)
      })

      // 标记为已成功订阅
      hasSubscribedStations = true

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

  // 获取站点列表并订阅（无论连接成功与否都要订阅）
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

      // 重置订阅标志
      hasSubscribedStations = false
      
      // 清空站点数据
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
