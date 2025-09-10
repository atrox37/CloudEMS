<template>
  <div class="analytics">
    <!-- 表格区域 -->
    <div class="analytics__content">
      <!-- 表格工具栏 -->
      <div class="analytics__toolbar">
        <div class="analytics__toolbar-left">
          <!-- 选择框 -->
          <div class="analytics__toolbar-left-title">Analytics Dashboard</div>
        </div>

        <div class="analytics__toolbar-right" ref="toolbarRightRef">
          <el-select v-model="selectedFilter" placeholder="请选择筛选条件" @change="handleFilterChange"
            :append-to="toolbarRightRef" clearable>
            <el-option label="All" value="all" />
            <el-option label="High Priority" value="high" />
            <el-option label="Medium Priority" value="medium" />
            <el-option label="Low Priority" value="low" />
          </el-select>
          <div class="analytics__toolbar-time-btns" @click="handleTimeBtnClick">
            <div v-for="btn in timeBtnList" :key="btn.value" class="analytics__toolbar-time-btn"
              :class="{ 'is-active': selectedTimeBtn === btn.value }" :data-value="btn.value">
              {{ btn.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 表格 -->
      <div class="analytics__charts">
        <div class="analytics__chart-item">
          <div class="chart__review">
            <div class="chart__review-header">
              <div class="chart__review-header-title">Energy consumption</div>
              <div class="chart__review-header-value">
                1000 &nbsp;<span class="chart__review-header-unit">kWh</span>
              </div>
            </div>
            <div class="chart__review-content">
              <div class="chart__review-content-list">
                <div v-for="item in stationInfoList" :key="item.title" class="chart__review-content-item">
                  <EnergyCard :title="item.title" :iconUrl="item.icon" :value="item.value" :unit="item.unit" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="analytics__chart-item">
          <ModuleCard title="Energy Production (kW)">
            <LineChart :xAxiosOption="xAxiosOption" :yAxiosOption="yAxiosOption" :series="exampleSeries" />
          </ModuleCard>
        </div>
        <div class="analytics__chart-item">
          <ModuleCard title="Energy Production (kW)">
            <DoughnutChart :series="exampleDoughntSeries" />
          </ModuleCard>
        </div>
        <div class="analytics__chart-item">
          <ModuleCard title="Energy Production (kW)">
            <StackedBarChart :xAxiosOption="xAxiosOption" :yAxiosOption="yAxiosOption" :series="exampleSeries" />
          </ModuleCard>
        </div>
        <div class="analytics__chart-item">
          <ModuleCard title="Energy Production (kW)">
            <SimpleBarChar :xAxiosOption="xAxiosOption" :yAxiosOption="yAxiosOption" :series="exampleSeries" />
          </ModuleCard>
        </div>
        <div class="analytics__chart-item">
          <ModuleCard title="Energy Production (kW)">
            <LineChart :xAxiosOption="xAxiosOption" :yAxiosOption="yAxiosOption" :series="exampleSeries" />
          </ModuleCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SimpleBarChar from '@/components/charts/SimpleBarChar.vue'
import PVEnergy from '@/assets/icons/PVEnergy.svg'
import ESS from '@/assets/icons/ESSEnergy.svg'
import DG from '@/assets/icons/DGEnergy.svg'

const toolbarRightRef = ref<HTMLElement | null>(null)
const selectedFilter = ref('all')

// 时间按钮列表
const timeBtnList = [
  { label: '6 Hour', value: '6h' },
  { label: '1 Day', value: '1d' },
  { label: '1 Week', value: '1w' },
  { label: '1 Month', value: '1m' },
]
const stationInfoList = reactive([
  {
    title: 'PV',
    icon: PVEnergy,
    value: '150',
    unit: 'kWh',
  },
  {
    title: 'ESS',
    icon: ESS,
    value: '150',
    unit: 'kWh',
  },
  {
    title: 'DG',
    icon: DG,
    value: '145',
    unit: 'kWh', // 修正单位大小写
  },
])
// 当前选中的时间按钮
const selectedTimeBtn = ref('6h')

// 事件代理处理时间按钮点击
const handleTimeBtnClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  // 查找最近的按钮元素
  const btn = target.closest('.analytics__toolbar-time-btn') as HTMLElement | null
  if (btn && btn.dataset.value) {
    selectedTimeBtn.value = btn.dataset.value
    console.log(selectedTimeBtn.value)
  }
}

const handleFilterChange = () => {
  console.log('handleFilterChange')
}
const handleExport = () => {
  console.log('handleExport')
}


const exampleDoughntSeries = [
  {
    name: 'pv',
    value: 45,
    color: '#4FADF7',
  },
  {
    name: 'diesel generator',
    value: 30,
    color: '#F6C85F',
  },
  {
    name: 'ess',
    value: 25,
    color: '#6DD400',
  },
]
const exampleXAxisData = [
  '0:00',
  '2:00',
  '4:00',
  '6:00',
  '8:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
  '22:00',
]
const xAxiosOption = {
  xAxiosData: exampleXAxisData,
}
const yAxiosOption = {
  yUnit: 'kWh',
}
const exampleSeries = [
  {
    name: 'Diesel',
    data: [120, 135, 140, 160, 180, 200, 210, 190, 170, 160, 150, 140],
    color: 'rgb(3, 93, 239)',
  },
  {
    name: 'ESS',
    data: [80, 90, 100, 110, 120, 130, 140, 135, 130, 125, 120, 115],
    color: 'rgb(29, 134, 255)',
  },
  {
    name: 'PV',
    data: [0, 10, 30, 60, 100, 130, 150, 140, 120, 80, 30, 5],
    color: 'rgb(105, 203, 255)',
  },
]
</script>

<style scoped lang="scss">
.analytics {
  height: 100%;
  width: 100%;

  .analytics__content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .analytics__toolbar {
    padding-bottom: 0.2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 0.01rem solid rgba(255, 255, 255, 0.1);

    margin-bottom: 0.2rem;

    .analytics__toolbar-left {
      display: flex;
      align-items: center;
      gap: 0.16rem;

      .analytics__toolbar-left-title {
        font-size: 0.2rem;
        line-height: 0.22rem;
        color: #ffffff;
      }
    }

    .analytics__toolbar-right {
      display: flex;
      align-items: center;
      gap: 0.2rem;

      .analytics__toolbar-time-btns {
        height: 0.32rem;
        display: flex;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.04);

        .analytics__toolbar-time-btn {
          height: 0.28rem;
          line-height: 0.22rem;
          padding: 0.03rem 0.1rem;
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

  .analytics__charts {
    height: calc(100% - 0.72rem);
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;

    .analytics__chart-item {
      width: calc((100% - 0.4rem) / 3);
      height: calc(50% - 0.1rem);

      .chart__review {
        width: 100%;
        height: 100%;
        padding: 0.2rem;
        display: flex;
        flex-direction: column;
        background-color: rgba(84, 98, 140, 0.2);
        border: 0.01rem solid;

        border-image: linear-gradient(117.01deg,
            rgba(148, 166, 197, 0.3) 3.11%,
            rgba(148, 166, 197, 0) 31.6%,
            rgba(148, 166, 197, 0.103266) 70.79%,
            rgba(148, 166, 197, 0.3) 96.39%) 1;
        backdrop-filter: blur(0.1rem);

        .chart__review-header {
          height: 0.83rem;
          // padding: 0 rem;
          // background-color: rgba(84, 98, 140, 0.2);
          // border: 0.01rem solid;

          // border-image: linear-gradient(117.01deg,
          //     rgba(148, 166, 197, 0.3) 3.11%,
          //     rgba(148, 166, 197, 0) 31.6%,
          //     rgba(148, 166, 197, 0.103266) 70.79%,
          //     rgba(148, 166, 197, 0.3) 96.39%) 1;
          // backdrop-filter: blur(0.1rem);
          display: flex;
          justify-content: space-between;
          align-items: center;

          .chart__review-header-title {
            font-weight: 700;
            font-size: 0.26rem;
            line-height: 100%;
            letter-spacing: 0%;
          }

          .chart__review-header-value {
            font-weight: 700;
            font-size: 0.22rem;
            line-height: 0.3rem;
            letter-spacing: 0%;

            .chart__review-header-unit {
              font-size: 0.14rem;
              line-height: 0.3rem;
              letter-spacing: 0%;
              color: rgba(255, 255, 255, 0.6);
            }
          }
        }

        .chart__review-content {
          flex: 1;
          padding-top: 0.15rem;

          .chart__review-content-list {
            height: 100%;
            overflow-y: hidden;

            .chart__review-content-item {
              margin-bottom: 0.12rem;
              padding-bottom: 0.13rem;
              border-bottom: 0.01rem dashed rgba(255, 255, 255, 0.2);

              &:last-child {
                border-bottom: none;
                padding-bottom: 0;
                margin-bottom: 0;
              }
            }
          }
        }
      }
    }
  }

  :deep(.el-select__popper.el-popper) {
    top: 1.49rem !important;
  }
}
</style>
