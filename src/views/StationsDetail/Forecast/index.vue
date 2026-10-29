<template>
  <div class="voltage-class forecast">
    <!-- 表格区域 -->
    <div class="forecast__content">
      <!-- 表格工具栏 -->
      <div class="forecast__toolbar">
        <div class="forecast__toolbar-left">
          <div class="forecast__toolbar-left-title">Forecast Dashboard</div>
        </div>

        <div class="forecast__toolbar-right">
          <div class="forecast__toolbar-time-btns" @click="handleTimeBtnClick">
            <div
              v-for="btn in timeBtnList"
              :key="btn.value"
              class="forecast__toolbar-time-btn"
              :class="{ 'is-active': selectedHorizon === btn.value }"
              :data-value="btn.value"
            >
              {{ btn.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="forecast__charts">
        <div class="forecast__chart-item">
          <ModuleCard title="PV Power Forecast" :loading="!stationLoading && chart1Loading">
            <ForecastLineChart
              :xAxiosOption="pvXAxiosOption"
              :yAxiosOption="poweryAxiosOption"
              :series="chart1Series"
              :splitLines="pvSplitLines"
              :showAreaStyle="false"
            />
          </ModuleCard>
        </div>
        <div class="forecast__chart-item">
          <ModuleCard title="Load Power Forecast" :loading="!stationLoading && chart2Loading">
            <ForecastLineChart
              :xAxiosOption="loadXAxiosOption"
              :yAxiosOption="energyyAxiosOption"
              :series="chart2Series"
              :splitLines="loadSplitLines"
              :showAreaStyle="false"
            />
          </ModuleCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import axios from 'axios'
import ForecastLineChart, {
  type ForecastSeriesData,
  type SplitLineConfig,
} from '@/components/charts/ForecastLineChart.vue'
import { format } from '@/utils/time'

defineProps<{
  stationLoading: boolean
}>()

const route = useRoute()

// 预测 API 配置（使用代理解决跨域问题）
const FORECAST_API_URL = '/forecast-api/forecast'
const MODEL_VERSION = 'MLWT_symlet_20251118T030507Z'

// 时间按钮列表：超短期、短期、中期
type HorizonType = 'ultra_short' | 'short_term' | 'medium_term'
const timeBtnList: { label: string; value: HorizonType }[] = [
  { label: 'Ultra Short', value: 'ultra_short' },
  { label: 'Short Term', value: 'short_term' },
  { label: 'Medium Term', value: 'medium_term' },
]

// 当前选中的预测周期
const selectedHorizon = ref<HorizonType>('ultra_short')
const stationId = ref<number | string>(route.params.stationId as string | number)
const chart1Loading = ref(false)
const chart2Loading = ref(false)

// 用于取消请求的 AbortController
let pvAbortController: AbortController | null = null
let loadAbortController: AbortController | null = null

// PV 功率预测图表数据（分段数据）
const chart1Series = ref<ForecastSeriesData[]>([
  {
    name: 'PV Power',
    segments: [
      {
        name: 'History',
        data: [] as number[],
        color: '#91CC75', // 历史数据使用绿色
        lineType: 'solid',
      },
      {
        name: 'Forecast',
        data: [] as number[],
        color: '#ee6666', // 预测数据使用红色
        lineType: 'dashed',
      },
    ],
  },
])

// PV 分界线配置
const pvSplitLines = ref<SplitLineConfig[]>([])

const poweryAxiosOption = {
  yUnit: 'kW',
}

// 负载预测图表数据（分段数据）
const chart2Series = ref<ForecastSeriesData[]>([
  {
    name: 'Load',
    segments: [
      {
        name: 'History',
        data: [] as number[],
        color: '#fc8452', // 历史数据使用橙色
        lineType: 'solid',
      },
      {
        name: 'Forecast',
        data: [] as number[],
        color: '#1d86ff', // 预测数据使用蓝色
        lineType: 'dashed',
      },
    ],
  },
])

// Load 分界线配置
const loadSplitLines = ref<SplitLineConfig[]>([])

const energyyAxiosOption = {
  yUnit: 'kW',
}

// PV 预测的 X 轴配置
const pvXAxiosOption = ref({
  xAxiosData: [] as string[],
})

// 负载预测的 X 轴配置
const loadXAxiosOption = ref({
  xAxiosData: [] as string[],
})

/**
 * 获取 as_of 时间
 * 目前使用固定时间，预留切换为当前时间的代码
 */
const getAsOfTime = (): string => {
  // 固定时间（用于测试）
  return '2019-10-17 23:55:00'

  // 切换为当前时间时，取消下面的注释：
  // const now = new Date()
  // const year = now.getFullYear()
  // const month = String(now.getMonth() + 1).padStart(2, '0')
  // const day = String(now.getDate()).padStart(2, '0')
  // const hours = String(now.getHours()).padStart(2, '0')
  // const minutes = String(now.getMinutes()).padStart(2, '0')
  // const seconds = String(now.getSeconds()).padStart(2, '0')
  // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化时间戳为显示格式
 * 格式：YYYY-MM-DD \n HH:MM:SS
 */
// 事件代理处理时间按钮点击
const handleTimeBtnClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const btn = target.closest('.forecast__toolbar-time-btn') as HTMLElement | null
  if (btn && btn.dataset.value) {
    selectedHorizon.value = btn.dataset.value as HorizonType
    // 取消当前正在进行的请求
    cancelAllRequests()
    getAllForecastData()
  }
}

/**
 * 取消所有正在进行的请求
 */
const cancelAllRequests = () => {
  if (pvAbortController) {
    pvAbortController.abort()
    pvAbortController = null
  }
  if (loadAbortController) {
    loadAbortController.abort()
    loadAbortController = null
  }
}

/**
 * 处理预测数据，将数据分为历史和预测两段
 * @param predictions 原始预测数据
 * @returns 处理后的分段数据和分界点索引
 */
const processDataSegments = (predictions: { ts: string; value: number }[]) => {
  const totalLength = predictions.length
  // 四分之一作为历史数据（模拟）
  const splitIndex = Math.floor(totalLength * 0.25)

  // 时间轴数据
  const xAxisData = predictions.map((item) => format(item.ts, 'YYYY-MM-DD\nHH:mm:ss'))

  // 历史数据（前四分之一 + 分界点）
  const historyData = predictions.map((item, idx) =>
    idx <= splitIndex ? Math.round(item.value * 100) / 100 : null,
  )

  // 预测数据（从分界点开始）
  const forecastData = predictions.map((item, idx) =>
    idx >= splitIndex ? Math.round(item.value * 100) / 100 : null,
  )

  return {
    xAxisData,
    historyData,
    forecastData,
    splitIndex,
  }
}

/**
 * 获取 PV 功率预测数据
 */
const fetchPvForecastData = async () => {
  try {
    chart1Loading.value = true
    // 清空现有数据
    chart1Series.value[0].segments[0].data = []
    chart1Series.value[0].segments[1].data = []
    pvXAxiosOption.value.xAxiosData = []
    pvSplitLines.value = []

    // 创建新的 AbortController
    pvAbortController = new AbortController()

    const requestBody = {
      plants: 'debug',
      forecast_type: 'pv_forecast',
      horizon: selectedHorizon.value,
      as_of: getAsOfTime(),
      model_version: MODEL_VERSION,
    }

    const response = await axios.post(FORECAST_API_URL, requestBody, {
      signal: pvAbortController.signal,
    })

    if (response.data?.statusCode === 200 && response.data?.body) {
      // 解析 body（body 是 JSON 字符串）
      const bodyData = JSON.parse(response.data.body)

      if (bodyData.predictions && Array.isArray(bodyData.predictions)) {
        const { xAxisData, historyData, forecastData, splitIndex } = processDataSegments(
          bodyData.predictions,
        )

        // 更新图表数据
        pvXAxiosOption.value.xAxiosData = xAxisData
        chart1Series.value[0].segments[0].data = historyData as number[]
        chart1Series.value[0].segments[1].data = forecastData as number[]

        // 设置分界线
        pvSplitLines.value = [
          {
            index: splitIndex,
            label: 'Now',
          },
        ]
      }
    }
  } catch (error: any) {
    if (axios.isCancel(error)) {
      console.log('[Forecast] PV 预测请求已取消')
    } else {
      console.error('[Forecast] 获取 PV 预测数据失败:', error)
    }
  } finally {
    chart1Loading.value = false
    pvAbortController = null
  }
}

/**
 * 获取负载预测数据
 */
const fetchLoadForecastData = async () => {
  try {
    chart2Loading.value = true
    // 清空现有数据
    chart2Series.value[0].segments[0].data = []
    chart2Series.value[0].segments[1].data = []
    loadXAxiosOption.value.xAxiosData = []
    loadSplitLines.value = []

    // 创建新的 AbortController
    loadAbortController = new AbortController()

    const requestBody = {
      plants: 'debug',
      forecast_type: 'load_forecast',
      horizon: selectedHorizon.value,
      as_of: getAsOfTime(),
      model_version: MODEL_VERSION,
    }

    const response = await axios.post(FORECAST_API_URL, requestBody, {
      signal: loadAbortController.signal,
    })

    if (response.data?.statusCode === 200 && response.data?.body) {
      // 解析 body（body 是 JSON 字符串）
      const bodyData = JSON.parse(response.data.body)

      if (bodyData.predictions && Array.isArray(bodyData.predictions)) {
        const { xAxisData, historyData, forecastData, splitIndex } = processDataSegments(
          bodyData.predictions,
        )

        // 更新图表数据
        loadXAxiosOption.value.xAxiosData = xAxisData
        chart2Series.value[0].segments[0].data = historyData as number[]
        chart2Series.value[0].segments[1].data = forecastData as number[]

        // 设置分界线
        loadSplitLines.value = [
          {
            index: splitIndex,
            label: 'Now',
          },
        ]
      }
    }
  } catch (error: any) {
    if (axios.isCancel(error)) {
      console.log('[Forecast] 负载预测请求已取消')
    } else {
      console.error('[Forecast] 获取负载预测数据失败:', error)
    }
  } finally {
    chart2Loading.value = false
    loadAbortController = null
  }
}

// 用于存储 setTimeout 的 ID，以便在需要时清除
let fetchTimeoutId: ReturnType<typeof setTimeout> | null = null

/**
 * 获取所有预测数据
 * 使用 setTimeout 延迟执行，确保在取消旧请求后再发起新请求
 */
const getAllForecastData = () => {
  // 清除之前的延迟任务（如果存在）
  if (fetchTimeoutId) {
    clearTimeout(fetchTimeoutId)
    fetchTimeoutId = null
  }

  // 清空现有数据
  chart1Series.value[0].segments[0].data = []
  chart1Series.value[0].segments[1].data = []
  chart2Series.value[0].segments[0].data = []
  chart2Series.value[0].segments[1].data = []
  pvXAxiosOption.value.xAxiosData = []
  loadXAxiosOption.value.xAxiosData = []
  pvSplitLines.value = []
  loadSplitLines.value = []

  // 延迟执行，确保 cancelAllRequests 已完成
  fetchTimeoutId = setTimeout(() => {
    fetchPvForecastData()
    fetchLoadForecastData()
  }, 100)
}

// 监听路由 params 变化触发，并在首次进入时立即执行（使用动态路由参数）
watch(
  () => route.params.stationId,
  (id) => {
    if (id) {
      stationId.value = id as string | number
    }
    // 取消之前的请求
    cancelAllRequests()
    getAllForecastData()
  },
  { immediate: true },
)

// 组件卸载时取消所有请求和清除延迟任务
onUnmounted(() => {
  if (fetchTimeoutId) {
    clearTimeout(fetchTimeoutId)
    fetchTimeoutId = null
  }
  cancelAllRequests()
})
</script>

<style scoped lang="scss">
.forecast {
  height: 100%;
  width: 100%;

  .forecast__content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .forecast__toolbar {
    padding-bottom: 0.2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 0.01rem solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0.2rem;

    .forecast__toolbar-left {
      display: flex;
      align-items: center;
      gap: 0.16rem;

      .forecast__toolbar-left-title {
        font-size: 0.2rem;
        line-height: 0.22rem;
        color: #ffffff;
      }
    }

    .forecast__toolbar-right {
      display: flex;
      align-items: center;
      gap: 0.2rem;

      .forecast__toolbar-time-btns {
        position: relative;
        height: 0.32rem;
        display: flex;
        align-items: center;

        .forecast__toolbar-time-btn {
          background-color: rgba(255, 255, 255, 0.4);
          height: 0.32rem;
          line-height: 0.32rem;
          padding: 0 0.1rem;
          font-size: 0.14rem;
          background: transparent;
          border-right: 0.01rem solid rgba(255, 255, 255, 0.2);
          cursor: pointer;

          &:last-child {
            border-right: none;
          }

          &.is-active {
            background: rgba(255, 255, 255, 0.2);
          }
        }
      }
    }
  }

  .forecast__charts {
    height: calc(100% - 0.72rem);
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    .forecast__chart-item {
      width: 100%;
      height: calc(50% - 0.1rem);
    }
  }
}
</style>
