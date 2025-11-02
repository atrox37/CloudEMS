<template>
  <div class="voltage-class usamap-chart">
    <div class="usamap-chart__header">
      <el-button v-if="currentView === 'state'" @click="backToUSA" type="warning"> Back </el-button>
    </div>

    <div class="usamap-chart__container">
      <div ref="chartRef" class="usamap-chart__map usamap-chart__map--usa"></div>
      <!-- 过渡动画指示器 -->
      <div v-if="isTransitioning" class="usamap-chart__loading">
        <div class="usamap-chart__loading-spinner"></div>
        <span class="usamap-chart__loading-text">map loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { pxToResponsive } from '@/utils/responsive'

const mapPointImage = new URL('@/assets/icons/map-point.svg', import.meta.url).href

// 定义发电站数据接口
export interface PowerStation {
  id: string
  name: string
  // type: 'solar' | 'wind' | 'nuclear' | 'hydro' | 'thermal'
  // capacity: number
  status: 'online' | 'offline' | 'maintenance'
  coordinates: [number, number]
  state: string
  powerValue: number
  powerUnit: string
  socValue: number
  socUnit: string
  Alarm: string | number
}

// 定义ECharts点击事件参数类型
interface EChartsClickParams {
  componentType: string
  name: string
  [key: string]: any
}

// 定义州地图数据类型
interface StateMapData {
  [key: string]: any
}

// 定义组件Props
interface Props {
  powerStations: PowerStation[]
}

// 接收父组件传递的props
const props = withDefaults(defineProps<Props>(), {
  powerStations: () => [],
})

// 组件状态
const chartRef = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)
const currentView = ref<'usa' | 'state'>('usa')
const currentState = ref<string>('')
const isTransitioning = ref<boolean>(false)
// 导入生成的州地图数据
const statesData = ref<StateMapData | null>(null)

// 使用父组件传递的发电站数据

// 定义Alaska和Hawaii的真实边界范围（完全基于USAOutlineMap.json中的实际坐标数据）
// Alaska: 从文件中提取的精确边界值
const ALASKA_BOUNDS = {
  minLng: -187.357983,  // 最西端（阿留申群岛）
  maxLng: -129.986323,  // 最东端（东南部）
  minLat: 51.678463,    // 最南端
  maxLat: 71.351633,    // 最北端
}

// Hawaii: 从文件中提取的精确边界值
const HAWAII_BOUNDS = {
  minLng: -159.764448,  // 最西端岛屿
  maxLng: -154.807817,  // 最东端（大岛）
  minLat: 18.948267,    // 最南端
  maxLat: 22.228955,    // 最北端
}

// 判断坐标是否在指定区域内
const isInRegion = (
  coord: [number, number],
  bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number },
): boolean => {
  const [lng, lat] = coord
  return lng >= bounds.minLng && lng <= bounds.maxLng && lat >= bounds.minLat && lat <= bounds.maxLat
}

// 转换Alaska和Hawaii的坐标以适配ECharts的布局变换
const transformCoordinatesForLayout = (
  coordinates: [number, number],
): [number, number] => {
  const [lng, lat] = coordinates

  // 判断是否在Alaska范围内
  if (isInRegion(coordinates, ALASKA_BOUNDS)) {
    // Alaska布局参数: { left: -130, top: 20, width: 25 }
    // 原始Alaska经度范围约50度,被压缩到25度宽
    const scale = 25 / (ALASKA_BOUNDS.maxLng - ALASKA_BOUNDS.minLng)
    // 计算相对于原始边界的位置比例
    const relativeX = (lng - ALASKA_BOUNDS.minLng) / (ALASKA_BOUNDS.maxLng - ALASKA_BOUNDS.minLng)
    const relativeY = (lat - ALASKA_BOUNDS.minLat) / (ALASKA_BOUNDS.maxLat - ALASKA_BOUNDS.minLat)
    
    // 应用布局变换: left: -130表示新的左边界, width: 25表示新的宽度
    const newLng = -130 + relativeX * 25
    // top: 20表示向下移动, 需要保持纵横比
    const newLat = 20 + relativeY * 25 * ((ALASKA_BOUNDS.maxLat - ALASKA_BOUNDS.minLat) / (ALASKA_BOUNDS.maxLng - ALASKA_BOUNDS.minLng))
    
    return [newLng, newLat]
  }

  // 判断是否在Hawaii范围内
  if (isInRegion(coordinates, HAWAII_BOUNDS)) {
    // Hawaii布局参数: { left: -95, top: 20, width: 5 }
    const scale = 5 / (HAWAII_BOUNDS.maxLng - HAWAII_BOUNDS.minLng)
    const relativeX = (lng - HAWAII_BOUNDS.minLng) / (HAWAII_BOUNDS.maxLng - HAWAII_BOUNDS.minLng)
    const relativeY = (lat - HAWAII_BOUNDS.minLat) / (HAWAII_BOUNDS.maxLat - HAWAII_BOUNDS.minLat)
    
    const newLng = -95 + relativeX * 5
    const newLat = 20 + relativeY * 5 * ((HAWAII_BOUNDS.maxLat - HAWAII_BOUNDS.minLat) / (HAWAII_BOUNDS.maxLng - HAWAII_BOUNDS.minLng))
    
    return [newLng, newLat]
  }

  // 其他区域保持原始坐标
  return coordinates
}

// 获取指定州的发电站
const getStateStations = (stateName: string): PowerStation[] => {
  return props.powerStations.filter((station) => station.state === stateName)
}

// 返回美国地图
const backToUSA = () => {
  if (currentView.value === 'usa' || isTransitioning.value) {
    return
  }
  isTransitioning.value = true
  if (chartRef.value) {
    chartRef.value.style.transition = 'opacity 0.3s ease-out'
    chartRef.value.style.opacity = '0'
  }
  setTimeout(() => {
    currentView.value = 'usa'
    currentState.value = ''
    if (chartRef.value) {
      chartRef.value.classList.remove('usamap-chart__map--state')
      chartRef.value.classList.add('usamap-chart__map--usa')
    }
    nextTick(() => {
      initUSAMap()
      setTimeout(() => {
        if (chartRef.value) {
          chartRef.value.style.opacity = '1'
        }
        isTransitioning.value = false
      }, 50)
    })
  }, 300)
}

// 修复点位tooltip不显示的核心：
// 1. 必须在series中为scatter类型单独配置tooltip.show: true
// 2. geo层的tooltip.show要为false，避免地图区域tooltip覆盖点位
// 3. option.tooltip.trigger建议为'item'，但series.tooltip优先级更高

const initUSAMap = async () => {
  if (!chartRef.value) return

  try {
    const usaOutlineData = await import('@/assets/jsons/USAOutlineMap.json')
    const usaShadowData = await import('@/assets/jsons/USAOutlineMapShadow.json')

    if (!statesData.value) {
      const statesDataImport = await import('@/assets/jsons/USAStatesSeparated.json')
      statesData.value = statesDataImport.default
    }

    echarts.registerMap('USA', usaOutlineData.default as any, {
      Alaska: { left: -130, top: 20, width: 25 },
      Hawaii: { left: -95, top: 20, width: 5 },
    })
    echarts.registerMap('USA_SHADOW', usaShadowData.default as any, {
      Alaska: { left: -130, top: 20, width: 25 },
      Hawaii: { left: -95, top: 20, width: 5 },
    })

    const option = {
      backgroundColor: 'transparent',
      // animation: true,
      // animationDuration: 800,
      // animationEasing: 'cubicOut',
      // animationDelay: 0,
      // 全局tooltip配置
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(84, 98, 140, 0.5)',
        borderColor: 'rgba(84, 98, 140, 0.8)',
        padding: 0,
        borderWidth: 0,
        textStyle: {
          color: '#fff',
          fontSize: pxToResponsive(12),
        },
        // 这里不需要formatter，series里会单独配置
      },
      geo: [
        {
          map: 'USA_SHADOW',
          roam: false,
          zoom: 1.2,
          center: [-97.6, 35 + 0.3],
          itemStyle: {
            areaColor: '#152e5a',
            borderColor: '#223e71',
            borderWidth: pxToResponsive(1.2),
          },
          emphasis: { disabled: true },
          silent: true,
        },
        {
          map: 'USA',
          roam: false,
          zoom: 1.2,
          center: [-98, 35],
          itemStyle: {
            areaColor: '#5984CF',
            borderColor: '#70B3FF',
            borderWidth: pxToResponsive(1.2),
          },
          emphasis: {
            label: {
              color: '#fff',
              fontSize: pxToResponsive(12),
            },
            itemStyle: {
              areaColor: '#ff6900',
              borderColor: '#ff6900',
              borderWidth: pxToResponsive(3),
            },
          },
          tooltip: {
            show: false, // 关键：地图区域不显示tooltip，避免覆盖点位
          },
        },
      ],
      series: [
        {
          name: 'solar',
          type: 'scatter',
          coordinateSystem: 'geo',
          geoIndex: 1,
          data: props.powerStations.map((station) => ({
            name: station.name,
            value: transformCoordinatesForLayout(station.coordinates),
            station: station,
          })),
          symbol: `image://${mapPointImage}`,
          symbolSize: pxToResponsive(14),
          label: { show: false },
          // 关键：为点位单独配置tooltip
          tooltip: {
            show: true,
            trigger: 'item',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            padding: 0,
            borderWidth: 0,
            textStyle: {
              color: '#fff',
              fontSize: pxToResponsive(12),
            },
            formatter: (params: any) => {
              const station = params.data.station
              return `
                <div style="width:2.48rem;padding: ${pxToResponsive(20)}px;background:rgba(84, 98, 140, 0.2);border: 0.01rem solid #7a8db2;backdrop-filter: blur(0.1rem);border-radius: ${pxToResponsive(10)}px;">
                  <div style="word-break: break-word;overflow-wrap: break-word;white-space: normal;margin: 0 0 ${pxToResponsive(8)}px 0; color: #fff; font-weight:700; line-height:1.2;font-size: ${pxToResponsive(24)}px ">${station.name}</div>
                  <p style="margin: ${pxToResponsive(12)}px 0; color: rgba(245, 255, 255, 1); line-height:1.2;font-size: ${pxToResponsive(18)}px;">PV Power: &nbsp;<span style="font-weight: 700;font-size: ${pxToResponsive(24)}px;color: #fff;">${station.powerValue}</span>&nbsp;<span style="font-size:${pxToResponsive(12)}px;color:rgba(245, 247, 255, 1);">${station.powerUnit}</span></p>
                  <p style="margin: ${pxToResponsive(12)}px 0; color: rgba(245, 255, 255, 1); line-height:1.2;font-size: ${pxToResponsive(18)}px;">ESS SOC: &nbsp;<span style="font-weight: 700;font-size: ${pxToResponsive(24)}px;color: #fff;">${station.socValue}</span>&nbsp;<span style="font-size:${pxToResponsive(12)}px;color:rgba(245, 247, 255, 1);">${station.socUnit}</span></p>
                  <p style="margin: ${pxToResponsive(12)}px 0 0 0; line-height:1.2;color: rgba(245, 255, 255, 1); font-size: ${pxToResponsive(18)}px;">Alarms: &nbsp;<span style="font-weight: 700;font-size: ${pxToResponsive(24)}px;color: #fff;">${station.Alarm}</span></p>
                </div>
              `
            },
          },
        },
      ],
    }

    chart.value?.setOption(option as any)
    
    chart.value?.off('click')
    chart.value?.on('click', (params: EChartsClickParams) => {
      if (params.componentType === 'geo' && params.name) {
        drillDownToState(params.name)
      }
    })
  } catch (error) {
    console.error('load USA map data failed:', error)
  }
}

let isDrilling = false

const drillDownToState = async (stateName: string) => {
  if (isDrilling || currentState.value === stateName || isTransitioning.value) {
    return
  }
  isDrilling = true
  isTransitioning.value = true
  if (chartRef.value) {
    chartRef.value.style.transition = 'opacity 0.3s ease-out'
    chartRef.value.style.opacity = '0'
  }
  setTimeout(async () => {
    try {
      if (!statesData.value) {
        const statesDataImport = await import('@/assets/jsons/USAStatesSeparated.json')
        statesData.value = statesDataImport.default
      }
      const statesOutlineData = await import('@/assets/jsons/USAStatesOutlineMaps.json')
      if (!statesData.value[stateName]) {
        throw new Error(`state "${stateName}" map data not found`)
      }
      const stateMapData = statesData.value[stateName]
      const stateOutlineData =
        statesOutlineData.default[stateName as keyof typeof statesOutlineData.default]
      if (!echarts.getMap(stateName)) {
        echarts.registerMap(stateName, stateMapData)
      }
      const shadowMapName = `${stateName}_SHADOW`
      if (!echarts.getMap(shadowMapName)) {
        echarts.registerMap(shadowMapName, stateOutlineData as any)
      }
      const stateStations = getStateStations(stateName)
      const bounds = getStateBoundsFromGeoJSON(stateMapData)
      const center = getStateCenterFromGeoJSON(stateMapData)
      const zoom = calculateOptimalZoom(bounds)

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(84, 98, 140, 0.5)',
          borderColor: 'rgba(84, 98, 140, 0.8)',
          padding: 0,
          borderWidth: 0,
          textStyle: {
            color: '#fff',
            fontSize: pxToResponsive(12),
          },
        },
        geo: [
          {
            map: shadowMapName,
            roam: false,
            zoom: zoom,
            center: [center[0] + 0.4, center[1] - 0.05],
            itemStyle: {
              areaColor: '#152e5a',
              borderColor: '#223E71',
              borderWidth: pxToResponsive(1.2),
            },
            emphasis: { disabled: true },
            silent: true,
          },
          {
            map: stateName,
            roam: false,
            zoom: zoom,
            center: center,
            itemStyle: {
              areaColor: '#5984CF',
              borderColor: '#70B3FF',
              borderWidth: pxToResponsive(1.2),
            },
            emphasis: {
              disabled: true,
            },
            tooltip: {
              show: false, // 关键：地图区域不显示tooltip，避免覆盖点位
            },
          },
        ],
        series: [
          {
            name: 'solar',
            type: 'scatter',
            coordinateSystem: 'geo',
            geoIndex: 1,
            data: stateStations.map((station) => ({
              name: station.name,
              value: [...station.coordinates],
              station: station,
            })),
            label: { show: false },
            // emphasis: {
            //   symbolSize: pxToResponsive(100),
            // },
            tooltip: {
              symbol: `image://${mapPointImage}`,
              symbolSize: pxToResponsive(14),
              label: { show: false },
              // 关键：为点位单独配置tooltip
              tooltip: {
                show: true,
                trigger: 'item',
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                padding: 0,
                borderWidth: 0,
                textStyle: {
                  color: '#fff',
                  fontSize: pxToResponsive(12),
                },
                formatter: (params: any) => {
                  const station = params.data.station
                  return `
                <div style="width:2.48rem;padding: ${pxToResponsive(20)}px;background:rgba(84, 98, 140, 0.2);border: 0.01rem solid #7a8db2;backdrop-filter: blur(0.1rem);border-radius: ${pxToResponsive(10)}px;">
                  <div style="word-break: break-word;overflow-wrap: break-word;white-space: normal;margin: 0 0 ${pxToResponsive(8)}px 0; color: #fff; font-weight:700; line-height:1.2;font-size: ${pxToResponsive(24)}px ">${station.name}</div>
                  <p style="margin: ${pxToResponsive(12)}px 0; color: rgba(245, 255, 255, 1); line-height:1.2;font-size: ${pxToResponsive(18)}px;">PV Power: &nbsp;<span style="font-weight: 700;font-size: ${pxToResponsive(24)}px;color: #fff;">${station.powerValue}</span>&nbsp;<span style="font-size:${pxToResponsive(12)}px;color:rgba(245, 247, 255, 1);">${station.powerUnit}</span></p>
                  <p style="margin: ${pxToResponsive(12)}px 0; color: rgba(245, 255, 255, 1); line-height:1.2;font-size: ${pxToResponsive(18)}px;">ESS SOC: &nbsp;<span style="font-weight: 700;font-size: ${pxToResponsive(24)}px;color: #fff;">${station.socValue}</span>&nbsp;<span style="font-size:${pxToResponsive(12)}px;color:rgba(245, 247, 255, 1);">${station.socUnit}</span></p>
                  <p style="margin: ${pxToResponsive(12)}px 0 0 0; line-height:1.2;color: rgba(245, 255, 255, 1); font-size: ${pxToResponsive(18)}px;">Alarms: &nbsp;<span style="font-weight: 700;font-size: ${pxToResponsive(24)}px;color: #fff;">${station.Alarm}</span></p>
                </div>
              `
                },
              },
            },
          },
        ],
      }

      chart.value?.setOption(option as any)
      currentView.value = 'state'
      currentState.value = stateName
      if (chartRef.value) {
        chartRef.value.classList.remove('usamap-chart__map--usa')
        chartRef.value.classList.add('usamap-chart__map--state')
      }
      setTimeout(() => {
        chart.value?.resize()
        if (chartRef.value) {
          chartRef.value.style.opacity = '1'
        }
        isTransitioning.value = false
      }, 100)
    } catch (error) {
      console.error('load state map data failed:', error)
      if (chartRef.value) {
        chartRef.value.style.opacity = '1'
      }
      isTransitioning.value = false
    } finally {
      isDrilling = false
    }
  }, 300)
}

// ===============================
// 工具函数：从GeoJSON数据计算州边界框
const getStateBoundsFromGeoJSON = (
  geoJsonData: any,
): { minLng: number; maxLng: number; minLat: number; maxLat: number } => {
  if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) {
    return { minLng: -98, maxLng: -98, minLat: 39, maxLat: 39 }
  }
  let minLng = Infinity,
    maxLng = -Infinity
  let minLat = Infinity,
    maxLat = -Infinity
  geoJsonData.features.forEach((feature: any) => {
    if (feature.geometry && feature.geometry.coordinates) {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates.forEach((ring: number[][]) => {
          ring.forEach((coord: number[]) => {
            minLng = Math.min(minLng, coord[0])
            maxLng = Math.max(maxLng, coord[0])
            minLat = Math.min(minLat, coord[1])
            maxLat = Math.max(maxLat, coord[1])
          })
        })
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach((polygon: number[][][]) => {
          polygon.forEach((ring: number[][]) => {
            ring.forEach((coord: number[]) => {
              minLng = Math.min(minLng, coord[0])
              maxLng = Math.max(maxLng, coord[0])
              minLat = Math.min(minLat, coord[1])
              maxLat = Math.max(maxLat, coord[1])
            })
          })
        })
      }
    }
  })
  if (minLng === Infinity) {
    return { minLng: -98, maxLng: -98, minLat: 39, maxLat: 39 }
  }
  return { minLng, maxLng, minLat, maxLat }
}

// ===============================
// 工具函数：从GeoJSON数据计算州中心点
const getStateCenterFromGeoJSON = (geoJsonData: unknown): [number, number] => {
  const bounds = getStateBoundsFromGeoJSON(geoJsonData)
  if (bounds.minLng !== Infinity) {
    return [(bounds.minLng + bounds.maxLng) / 2, (bounds.minLat + bounds.maxLat) / 2]
  }
  return [-98, 39]
}

// ===============================
// 工具函数：根据边界框计算最佳缩放级别
const calculateOptimalZoom = (bounds: {
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number
}): number => {
  const lngRange = bounds.maxLng - bounds.minLng
  const latRange = bounds.maxLat - bounds.minLat
  const maxRange = Math.max(lngRange, latRange)
  if (maxRange > 20) return 0.8
  if (maxRange > 10) return 1.0
  if (maxRange > 5) return 1.1
  return 1.2
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  chart.value = echarts.init(chartRef.value)
  initUSAMap()
  window.addEventListener('resize', handleResize)
}

// 处理窗口大小变化
const handleResize = () => {
  chart.value?.resize()
  if (currentView.value === 'usa') {
    initUSAMap()
  } else if (currentState.value) {
    drillDownToState(currentState.value)
  }
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart.value?.dispose()
})
</script>

<style scoped lang="scss">
.voltage-class {
  .usamap-chart {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.16rem 0.2rem;

      .usamap-chart__title {
        margin: 0;
        color: #f8fafc;
        font-size: 0.18rem;
        font-weight: 600;
      }

      .usamap-chart__controls {
        display: flex;
        gap: 0.12rem;
      }
    }

    &__container {
      flex: 1;
      padding: 0.2rem;
      background: transparent;
      position: relative;
    }

    &__map {
      width: 100%;
      height: 100%;
      min-height: 6rem;
      transition:
        opacity 0.3s ease-out,
        filter 0.3s ease-out;
    }

    &__loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.12rem;
      z-index: 10;
      background: rgba(30, 41, 59, 0.9);
      padding: 0.24rem 0.32rem;
      border-radius: 0.08rem;
      backdrop-filter: blur(0.04rem);
    }

    &__loading-spinner {
      width: 0.32rem;
      height: 0.32rem;
      border: 0.03rem solid rgba(255, 255, 255, 0.3);
      border-top: 0.03rem solid #60a5fa;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    &__loading-text {
      color: #f8fafc;
      font-size: 0.14rem;
      font-weight: 500;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }

      100% {
        transform: rotate(360deg);
      }
    }
  }
}
</style>
