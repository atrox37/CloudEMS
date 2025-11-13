<script setup lang="ts">
import en from 'element-plus/es/locale/lang/en'
import stompManager from '@/utils/stomp'
import { useRouter, useRoute } from 'vue-router'
import { useGlobalStore } from '@/stores/global'
import { useUserStore } from '@/stores/user'
import { getStationsSkipCancel } from '@/api/station'

const locale = en
const router = useRouter()
const route = useRoute()
const globalStore = useGlobalStore()
const userStore = useUserStore()

// 判断是否在登录页面
const isLoginPage = computed(() => route.name === 'login')

// 轮询定时器
let stationPollingTimer: number | null = null
// 标记是否已成功订阅站点
let hasSubscribedStations = false
// 处理告警详情跳转
const handleAlarmDetail = () => {
  ElMessage.closeAll()
  router.push({ name: 'Alarm' })
}
let idCount = 0
const alarmMap = new Map()

// 告警回调函数（定义在外层，可复用）
const alarmCb = (alarm: any) => {
  console.log(alarm, '//////////////////////////////')
  const rowData = JSON.parse(alarm.rawValue)
  if (alarm.status == 1) {
    // 告警触发状态，显示带跳转按钮的消息
    const currentId = idCount++
    const message = ElMessage({
      type: 'error',
      showClose: true,
      dangerouslyUseHTMLString: true,
      message: `
          <div style="display: flex; align-items: center; gap: 0.08rem;">
            <span>${alarm.deviceId}</span>&nbsp;&nbsp;
            <span>${rowData.msg}</span>
            <button id="stomp-to-detail-btn-${currentId}" style="padding:0.04rem 0.1rem;background-color: #ff6900; color: #fff; border: none; cursor: pointer; font-size:0.14rem; border-radius: 0.02rem;">to detail</button>
          </div>
        `,
      duration: 0,
      onClose: () => {
        // 清理事件监听器
        const buttonId = `stomp-to-detail-btn-${currentId}`
        const eventInfo = document.getElementById(buttonId)
        if (eventInfo) {
          eventInfo.removeEventListener('click', handleAlarmDetail)
          console.log(`[App] 清理STOMP告警按钮事件监听: ${buttonId}`)
        }
        alarmMap.delete(alarm.alarm_id)
      },
    })

    // 存储告警消息
    alarmMap.set(alarm.alarm_id, message)

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
    const existingMessage = alarmMap.get(alarm.alarm_id)
    if (existingMessage) {
      existingMessage.close()
      alarmMap.delete(alarm.alarm_id)
      console.log(`[App] 关闭STOMP告警消息: ${alarm.alarm_id}`)
    }
  }
  console.log('[main] STOMP告警:', alarm)
}

// 清除站点轮询定时器
const clearStationPolling = () => {
  if (stationPollingTimer) {
    clearInterval(stationPollingTimer)
    stationPollingTimer = null
    console.log('[main] 清除站点列表轮询定时器')
  }
}

// 获取站点列表并订阅
const fetchStationsAndSubscribe = async () => {
  // 如果已经成功订阅过，不再重复订阅
  if (hasSubscribedStations) {
    console.log('[main] 已订阅站点，跳过重复订阅')
    return true
  }

  try {
    console.log('[main] 尝试获取站点列表...')
    const res = await getStationsSkipCancel()

    if (res.code === 200 && res.data && res.data.length > 0) {
      console.log('[main] 获取站点列表成功，数量:', res.data.length)
      const stationIdArray = res.data.map((item: any) => item.stationId)

      // 订阅所有站点的告警主题
      // 如果 STOMP 已连接，立即订阅
      // 如果 STOMP 未连接，加入待订阅队列，连接成功后自动订阅
      stationIdArray.forEach((stationId: number) => {
        stompManager.subscribe({ destination: `/topic/report_property_${stationId}` }, alarmCb)
        console.log(`[main] 订阅站点: ${stationId}`)
      })

      // 标记为已成功订阅
      hasSubscribedStations = true

      // 清除轮询定时器
      clearStationPolling()

      return true
    } else {
      console.warn('[main] 获取站点列表成功但数据为空')
      return false
    }
  } catch (error) {
    console.error('[main] 获取站点列表失败:', error)
    return false
  }
}

// 启动站点列表轮询
const startStationPolling = () => {
  // 避免重复启动轮询
  if (stationPollingTimer) {
    console.log('[main] 站点列表轮询已在进行中')
    return
  }

  console.log('[main] 启动站点列表轮询，间隔: 10秒')

  // 每10秒尝试获取一次站点列表
  stationPollingTimer = setInterval(async () => {
    console.log('[main] 轮询：尝试获取站点列表...')
    await fetchStationsAndSubscribe()
  }, 10000) as unknown as number
}

// 初始化 STOMP 连接（只在用户登录后）
const initStomp = async () => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn || !userStore.token) {
    console.log('[main] 用户未登录，跳过STOMP连接')
    return
  }

  // 设置全局监听器（无论连接成功与否都要设置）
  stompManager.setGlobalListeners({
    onConnect: () => {
      console.log('[main] STOMP已连接')
    },
    onDisconnect: () => {
      console.log('[main] STOMP连接断开')
    },
    onReconnect: () => {
      console.log('[main] STOMP正在重连...')
    },
    onError: (error) => {
      console.error('[main] STOMP错误:', error)
    },
  })

  // 获取站点列表并订阅（无论连接成功与否都要订阅）
  const success = await fetchStationsAndSubscribe()

  // 如果首次获取失败，启动轮询机制
  if (!success) {
    console.log('[main] 首次获取站点列表失败，启动轮询机制')
    startStationPolling()
  }

  // 尝试连接 STOMP（即使失败也会自动重连，订阅已经在队列中）
  try {
    await stompManager.connect()
    console.log('[main] STOMP连接成功')
  } catch (error) {
    console.error('[main] STOMP首次连接失败，将自动重连:', error)
    // 不需要额外处理，STOMP会自动重连，订阅已经在待订阅队列中
  }
}

// 监听用户登录状态变化
watch(
  () => userStore.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      // 用户登录成功，连接WebSocket和STOMP
      console.log('[main] 用户登录成功，尝试连接WebSocket和STOMP')
      // initWebSocket()
      initStomp()
    } else {
      // 用户登出，清理所有资源
      console.log('[main] 用户登出，断开WebSocket和STOMP连接')

      // 清除轮询定时器
      clearStationPolling()

      // 重置订阅标志
      hasSubscribedStations = false

      // 断开 STOMP 连接
      stompManager.disconnect()

      // wsManager.disconnect()
    }
  },
  { immediate: true }, // 立即执行一次
)

// 组件卸载时清理资源
onUnmounted(() => {
  console.log('[main] App组件卸载，清理资源')
  clearStationPolling()
})
</script>

<template>
  <el-config-provider :locale="locale">
    <router-view />
    <!-- AI助手全局组件（登录页面不显示） -->
    <AIAssistant v-if="!isLoginPage" />
  </el-config-provider>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
}

#app {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative;
}
</style>
