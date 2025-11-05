<template>
  <div class="voltage-class stations-detail">
    <!-- 页面主容器 -->
    <!-- <div class="stations-detail__back">
            <IconButton type="warning" :icon="backIcon" @click="handleBack" text="Back" />
        </div> -->
    <!-- 加载背景组件，loading时显示遮罩 -->
    <LoadingBg :loading="stationLoading">
      <div class="stations-detail__header">
        <!-- 头部信息区域 -->
        <div class="header-station-info">
          <div class="header-station-info__left">
            <!-- 返回按钮 -->
            <img :src="backIcon" @click="handleBack" />
            <div class="station-msg">
              <!-- 电站下拉选择 -->
              <el-dropdown
                @command="handleUserCommand"
                trigger="click"
                :teleported="false"
                :z-index="3000"
                @visible-change="handleDropdownChange"
              >
                <div class="header-station-info__name-box">
                  <div class="header-station-info__name">
                    {{ stationDetail.deviceInstancePo.name }}
                  </div>
                  <img
                    :src="arrowDownIcon"
                    class="header-station-info__arrow"
                    :class="{ rotate: isDropdownVisible }"
                  />
                </div>

                <template #dropdown>
                  <el-dropdown-menu>
                    <!-- 电站列表下拉项 -->
                    <el-dropdown-item
                      v-for="item in stationsList"
                      :key="item.id"
                      :command="item.id"
                    >
                      <div
                        class="station-detail-Item"
                        :class="{ active: currentStationId === item.id }"
                      >
                        <div class="item-info">
                          <div class="station-detail-Item__name">{{ item.name }}</div>
                          <div class="item-status">
                            <!-- 在线/离线状态图标 -->
                            <img
                              :src="item.status === 'online' ? onlineIcon : offlineIcon"
                              class="item-status__icon"
                            />
                            <div class="item-status__text">{{ item.status }}</div>
                          </div>
                        </div>
                        <div class="item-description">{{ item.address }}</div>
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <!-- 电站描述信息 -->
              <div class="header-station-info__description">
                <div class="header-station-info__status">
                  <img
                    :src="
                      stationDetail.deviceInstancePo.status === 'online' ? onlineIcon : offlineIcon
                    "
                    class="header-station-info__status-icon"
                  />
                  <div class="header-station-info__status-text">
                    {{ stationDetail.deviceInstancePo.status }}
                  </div>
                </div>
                <div class="header-station-info__time">
                  <img :src="timeIcon" class="header-station-info__time-icon" />
                  <div class="header-station-info__time-text">
                    {{ stationDetail.deviceInstancePo.statusTime }}
                  </div>
                </div>
                <div class="header-station-info__address">
                  <img :src="addressIcon" class="header-station-info__address-icon" />
                  <div class="header-station-info__address-text">
                    {{
                      stationDetail.wgTags.find((tag) => tag.tagKey === 'Location')?.tagValue || '-'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="header-station-info__right">
            <!-- 天气信息（静态展示） -->
            <div class="header__right-weather">
              <img :src="sunIcon" alt="sunIcon" class="header__right-weatherIcon" />
              <div class="header__right-weatherStatus">wind</div>
              <div class="header__right-weatherValue">67F~79F</div>
            </div>
            <!-- 当前功率信息（静态展示） -->
            <div class="header-station-info__power">
              <div class="station-card__power-display-item">
                <img :src="pvIcon" alt="pv-icon" />
                <div class="station-card__current-power">{{ pvPower }} <span>kW</span></div>
              </div>

              <div class="station-card__power-display-item">
                <img :src="essIcon" alt="ess-icon" />
                <div class="station-card__current-power">{{ cnRatePower }} <span>kW</span></div>
                /
                <div class="station-card__current-power">{{ cnRateCapacity }} <span>kWh</span></div>
              </div>
            </div>
          </div>
        </div>
        <!-- 头部Tab切换栏 -->
        <div class="stations-detail__tabs">
          <IconButton
            :type="activeTab === 'Overview' ? 'primary' : 'warning'"
            :icon="overviewIcon"
            text="Overview"
            @click="handleTabClick('Overview')"
          />
          <IconButton
            :type="activeTab === 'Performance' ? 'primary' : 'warning'"
            :icon="performanceIcon"
            text="Performance"
            @click="handleTabClick('Performance')"
          />
          <IconButton
            :type="activeTab === 'Analytics' ? 'primary' : 'warning'"
            :icon="analyticsIcon"
            text="Analytics"
            @click="handleTabClick('Analytics')"
          />
          <IconButton
            :type="activeTab === 'Alarm' ? 'primary' : 'warning'"
            :icon="AlarmIcon"
            text="Alarm"
            @click="handleTabClick('Alarm')"
          />
          <IconButton
            :type="activeTab === 'Maintenance' ? 'primary' : 'warning'"
            :icon="maintenanceIcon"
            text="Maintenance"
            @click="handleTabClick('Maintenance')"
          />
          <!-- 旧版Tab切换样式，已注释 -->
          <!-- <div class="stations-detail__tabs-item" :class="{ 'active': activeTab === 'Overview' }"
                    @click="handleTabClick('Overview')"><img :src="overviewIcon" /><span>Overview</span></div>
                <div class="stations-detail__tabs-item" :class="{ 'active': activeTab === 'Performance' }"
                    @click="handleTabClick('Performance')"><img :src="performanceIcon" /><span>Performance</span></div>
                <div class="stations-detail__tabs-item" :class="{ 'active': activeTab === 'Analytics' }"
                    @click="handleTabClick('Analytics')"><img :src="analyticsIcon" /><span>Analytics</span></div>
                <div class="stations-detail__tabs-item" :class="{ 'active': activeTab === 'Alarm' }"
                    @click="handleTabClick('Alarm')"><img :src="AlarmIcon" /><span>Alarm</span></div>
                <div class="stations-detail__tabs-item" :class="{ 'active': activeTab === 'Maintenance' }"
                    @click="handleTabClick('Maintenance')"><img :src="maintenanceIcon" /><span>Maintenance</span></div> -->
        </div>
      </div>
      <!-- 主内容区域，嵌套路由 -->
      <div class="stations-detail__content">
        <router-view :stationLoading="stationLoading" />
      </div>
    </LoadingBg>
  </div>
</template>

<script setup lang="ts">
// 资源引入
// import backIcon from '@/assets/icons/button-arrow-left.svg'
import pvIcon from '@/assets/icons/station-pv.svg'
import essIcon from '@/assets/icons/station-ess.svg'
import backIcon from '@/assets/icons/back.svg' // 返回按钮图标
import onlineIcon from '@/assets/icons/station-status__online.svg' // 在线状态图标
import offlineIcon from '@/assets/icons/station-status__offline.svg' // 离线状态图标
import arrowDownIcon from '@/assets/icons/dropdown-arrow-down.svg' // 下拉箭头图标
import overviewIcon from '@/assets/icons/button-overview.svg' // 概览Tab图标
import performanceIcon from '@/assets/icons/button-performance.svg' // 性能Tab图标
import analyticsIcon from '@/assets/icons/button-analytics.svg' // 分析Tab图标
import maintenanceIcon from '@/assets/icons/button-maintenance.svg' // 维护Tab图标
import AlarmIcon from '@/assets/icons/button-Alarm.svg' // 告警Tab图标
import sunIcon from '@/assets/icons/sunny.svg' // 天气图标
import timeIcon from '@/assets/icons/time.svg' // 时间图标
import addressIcon from '@/assets/icons/address.svg' // 地址图标
import LoadingBg from '@/components/common/LoadingBg.vue' // 加载背景组件

import { getStationDetail, getStationList } from '@/api/station' // API方法
// import { useStationStore } from '@/stores/station' // Pinia电站store
import type { StationInformation, StationListItem } from '@/types/Stations' // 类型定义

// 电站列表项类型
interface StationList {
  id: number
  name: string
  status: string
  address: string
}
const pvPower = computed(() => {
  if (stationDetail.value.gfTags.length > 0) {
    return stationDetail.value.gfTags
      .filter((tag) => tag.tagKey === 'ratepower')
      .reduce((acc, tag) => acc + Number(tag.tagValue), 0)
  } else {
    return '-'
  }
})
const cnRatePower = computed(() => {
  if (stationDetail.value.cnTags.length > 0) {
    return stationDetail.value.cnTags
      .filter((tag) => tag.tagKey === 'ratepower')
      .reduce((acc, tag) => acc + Number(tag.tagValue), 0)
  } else {
    return '-'
  }
})
const cnRateCapacity = computed(() => {
  if (stationDetail.value.cnTags.length > 0) {
    return stationDetail.value.cnTags
      .filter((tag) => tag.tagKey === 'ratecapacity')
      .reduce((acc, tag) => acc + Number(tag.tagValue), 0)
  } else {
    return '-'
  }
})
const stationDetail = ref<StationInformation>({
  wgTags: [],
  gfTags: [],
  cnTags: [],
  deviceInstancePo: {
    id: 1,
    name: '-----',
    sn: '-',
    status: '-', //在线online离线 offline
    statusTime: '-', //在线或者离线的时间
    creatorId: 1,
    productId: 1,
    gatewayId: 1,
    orgId: 1,
    parentId: 1,
    treeNode: null,
    createTime: '-',
    updateTime: '-',
    metadata: {
      tags: [],
      properties: [],
      functions: [],
      propertyTags: [],
      trees: [],
      rules: [],
    },
    description: {
      address: '-',
      installationate: '-',
      nextMaintenance: '-',
      assign: '-',
      system: '-',
      netEthernet: '-',
      netWifi: '-',
      netCellular: '-',
    },
  },
})
// 当前选中的电站ID
const currentStationId = ref<number | string>()
// 响应式获取store中的stationDetail
// let { stationDetail } = storeToRefs(useStationStore())
// 路由相关
const router = useRouter()
const route = useRoute()
// 当前激活的Tab
const activeTab = ref('Overview')
// 电站列表
const stationsList = ref<StationList[]>([])
// 加载状态
const stationLoading = ref(true)
const isDropdownVisible = ref(false)
// 监听路由变化，切换Tab和电站
watch(
  () => route,
  async (newRoute) => {
    activeTab.value = newRoute.name as string
    // 如果没有stationId参数，提示并跳转回电站列表页
    if (!newRoute.query.stationId && newRoute.query.stationId !== '0') {
      ElMessage.error('Please select a station first')
      const timer = setTimeout(() => {
        clearTimeout(timer)
        router.push({ name: 'stations' })
      }, 1000)
    } else {
      // 有stationId则设置当前电站ID
      currentStationId.value = parseInt(newRoute.query.stationId as string)
    }
  },
  { immediate: true, deep: true },
)

// 处理电站下拉选择
const handleUserCommand = (command: string) => {
  if (command === currentStationId.value) {
    return
  }
  router.push({ path: route.path, query: { stationId: command } })
}

// 返回按钮处理
const handleBack = () => {
  router.push({ name: 'stations' })
}

// Tab切换处理
const handleTabClick = (tab: string) => {
  activeTab.value = tab
  router.push({ name: tab, query: { stationId: route.query.stationId } })
}

// 电站下拉选择处理
const handleDropdownChange = (visible: boolean) => {
  isDropdownVisible.value = visible
}

// 页面挂载时获取电站列表和详情
// 拆分：获取电站列表
const fetchStationList = async () => {
  const res = await getStationList()
  if (res.code === 200) {
    stationsList.value = res.data.map((item: StationListItem) => ({
      id: item.deviceInstancePo.id,
      name: item.deviceInstancePo.name,
      status: item.deviceInstancePo.status,
      address:
        item.deviceInstancePo.metadata.tags.find((tag) => tag.tagKey === 'Location')?.tagValue ||
        '',
    }))
  }
}

// 拆分：根据路由参数获取电站详情
const fetchStationDetailByRoute = async () => {
  const stationId = route.query.stationId as string | number
  if (!stationId) return
  const res = await getStationDetail(stationId)
  if (res.code === 200) {
    stationDetail.value = res.data
  }
}

// 首次挂载：分别请求列表与详情
// 移除 onMounted，改为监听路由变化触发，并在首次进入时立即执行

// 监听路由变化：仅重新拉取详情
watch(
  () => route.query.stationId,
  async () => {
    stationLoading.value = true
    try {
      if (stationsList.value.length === 0) {
        await fetchStationList()
      }
      await fetchStationDetailByRoute()
    } finally {
      stationLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
/* 页面整体样式 */
.voltage-class .stations-detail {
  width: 100%;
  height: 100%;

  .stations-detail__header {
    .header-station-info {
      position: relative;
      padding: 0.2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(84, 98, 140, 0.2);
      border: 0.01rem solid;
      border-image: linear-gradient(
          117.64deg,
          rgba(148, 166, 197, 0.3) 2.73%,
          rgba(148, 166, 197, 0) 31.73%,
          rgba(148, 166, 197, 0.103266) 71.62%,
          rgba(148, 166, 197, 0.3) 97.67%
        )
        1;
      backdrop-filter: blur(0.1rem);
      z-index: 10;

      .header-station-info__left {
        height: 100%;
        display: flex;
        align-items: center;
        gap: 0.2rem;

        & > img {
          width: 0.4rem;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
        }

        .station-msg {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;

          .header-station-info__name-box {
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.1rem;

            .header-station-info__name {
              font-weight: 700;
              font-size: 0.26rem;
              line-height: 0.26rem;
              letter-spacing: 0%;
              color: #fff;
            }

            .header-station-info__arrow {
              height: 0.2rem;
              width: 0.2rem;
              transition: all 0.3s ease;

              &.rotate {
                transform: rotate(180deg);
              }
            }
          }

          .station-detail-Item {
            padding: 0.1rem;
            width: 2.82rem;

            &.active {
              border: 0.01rem solid rgba(255, 105, 0, 1) !important;
              background-color: rgba(255, 255, 255, 0.1);
            }

            .item-info {
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;

              .station-detail-Item__name {
                font-weight: 700;
                font-size: 0.16rem;
                line-height: 0.26rem;
                letter-spacing: 0%;
                color: #fff;
              }

              .item-status {
                display: flex;
                align-items: center;
                gap: 0.06rem;

                .item-status__icon {
                  width: 0.16rem;
                  height: 0.16rem;
                }

                .item-status__text {
                  font-weight: 400;
                  font-size: 0.14rem;
                  line-height: 100%;
                  letter-spacing: 0%;
                  vertical-align: middle;
                  color: #fff;
                }
              }
            }
          }

          .header-station-info__description {
            display: flex;
            align-items: center;
            gap: 0.2rem;
            font-weight: 400;
            font-size: 0.16rem;
            line-height: 100%;
            letter-spacing: 0%;
            color: rgba(255, 255, 255, 0.6);

            .header-station-info__time,
            .header-station-info__address,
            .header-station-info__status {
              display: flex;
              align-items: center;
              gap: 0.06rem;

              img {
                width: 0.16rem;
                height: 0.16rem;
                object-fit: contain;
              }
            }
          }
        }
      }

      .header-station-info__right {
        height: 100%;
        display: flex;
        align-items: center;
        gap: 1rem;

        .header__right-weather {
          display: flex;
          align-items: center;
          gap: 0.1rem;
          font-size: 0.2rem;
          letter-spacing: 0%;

          .header__right-weatherIcon {
            width: 0.4rem;
            height: 0.36rem;
            object-fit: contain;
          }

          .header__right-weatherStatus {
            font-weight: 500;
            font-style: Medium;
          }

          .header__right-weatherValue {
            font-weight: 700;
            font-style: Bold;
          }
        }

        .header-station-info__power {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          .station-card__power-display-item {
            display: flex;
            align-items: center;
            gap: 0.08rem;

            img {
              width: 0.24rem;
              height: 0.24rem;
              object-position: center;
              object-fit: contain;
            }
          }

          .station-card__current-power {
            font-weight: 700;
            font-size: 0.3rem;
            line-height: 0.3rem;
            letter-spacing: 0%;
            color: #ffffff;

            span {
              font-size: 0.16rem;
              color: rgba(255, 255, 255, 0.6);
            }
          }

          .station-card__total-capacity {
            font-weight: 400;
            font-size: 0.16rem;
            line-height: 0.16rem;
            letter-spacing: 0%;
            color: rgba(255, 255, 255, 0.6);
          }

          .header-station-info__power-value {
            font-weight: 700;
            font-size: 0.3rem;
            line-height: 0.3rem;
            letter-spacing: 0%;
            color: #fff;

            span {
              font-size: 0.14rem;
              line-height: 0.3rem;
              letter-spacing: 0%;
              color: rgba(255, 255, 255, 0.6);
            }
          }

          .header-station-info__power-desc {
            font-weight: 400;
            font-size: 0.16rem;
            line-height: 0.16rem;
            letter-spacing: 0%;
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }
    }

    .stations-detail__tabs {
      display: flex;
      align-items: center;
      gap: 0.16rem;
      padding: 0.2rem 0;
      // margin-bottom: 0.2rem;
      // border-bottom: 0.01rem solid rgba(255, 255, 255, 0.1);

      // .stations-detail__tabs-item {
      //     display: flex;
      //     align-items: center;
      //     gap: 0.06rem;
      //     cursor: pointer;
      //     height: 0.32rem;
      //     font-size: 0.14rem;
      //     padding: 0.05rem 0.16rem;
      //     border-top: 0.02rem solid rgba(255, 255, 255, 0.1);
      //     border-right: 0.02rem solid rgba(255, 255, 255, 0.1);
      //     cursor: pointer;
      //     transition: all 0.3s ease;
      //     background-color: rgba(255, 255, 255, 0.1);

      //     &::first-child {
      //         border-left: 0.02rem solid rgba(255, 255, 255, 0.1);
      //     }
      //     img {
      //         width: 0.14rem;
      //         height: 0.14rem;
      //         object-fit: contain;
      //         margin-right: 0.08rem;
      //     }

      //     &.active {
      //         background-color: rgba(255, 105, 0, 1);
      //     }

      // }
    }
  }

  .stations-detail__content {
    height: calc(100% - 1.77rem);
    width: 100%;
  }

  /* 下拉菜单样式调整 */
  :deep(.el-dropdown__popper.el-popper.is-light) {
    top: 0.38rem !important;
    background-color: rgba(15, 35, 70, 0.7) !important;
    z-index: 3000 !important;
  }

  :deep(.el-dropdown-menu) {
    // background-color: rgba(43, 68, 111, 1) !important;
    backdrop-filter: blur(1rem) !important;
    // box-shadow: 0rem 0.04rem 0.1rem 0rem rgba(0, 0, 0, 0.25) !important;
  }

  :deep(.el-dropdown-menu__item) {
    padding: 0 !important;
  }

  :deep(.el-dropdown-menu__item:hover) {
    border: 0.01rem solid rgba(255, 105, 0, 1) !important;
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
