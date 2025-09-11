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
          <el-select v-model="selectedFilter" placeholder="select filter" @change="handleFilterChange"
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
          <ModuleCard title="Energy Structure">
            <DoughnutChart :series="exampleDoughntSeries" />
          </ModuleCard>
        </div>
        <div class="analytics__chart-item">
          <ModuleCard title="Power Monitoring">
            <LineChart :xAxiosOption="xAxiosOption" :yAxiosOption="poweryAxiosOption" :series="powerSeries" />
          </ModuleCard>
        </div>
        <div class="analytics__chart-item">
          <ModuleCard title="Energy Storage Operation Status">
            <LineAndBarChart :xAxiosOption="xAxiosOption" :yAxiosOption="EssyAxiosOption"
              :lineSeries="EssSeries.lineSeries" :barSeries="EssSeries.barSeries" />
          </ModuleCard>
        </div>
        <div class="analytics__chart-item">
          <ModuleCard title="Electricity Generation Statistics">
            <SimpleBarChar :xAxiosOption="xAxiosOption" :yAxiosOption="generateyAxiosOption" :series="generateSeries" />
          </ModuleCard>
        </div>
        <div class="analytics__chart-item">
          <ModuleCard title="Energy Supply And Demand Balance">
            <SimpleBarChar :xAxiosOption="xAxiosOption" :yAxiosOption="energyyAxiosOption" :series="energySeries" />
          </ModuleCard>
        </div>
        <div class="analytics__chart-item">
          <ModuleCard title="Economic Benefit Analysis">
            <SimpleBarChar :xAxiosOption="xAxiosOption" :yAxiosOption="economicyAxiosOption" :series="economicSeries" />
          </ModuleCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PVEnergy from '@/assets/icons/PVEnergy.svg'
import ESS from '@/assets/icons/ESSEnergy.svg'
import DG from '@/assets/icons/DGEnergy.svg'
import { getTimeRangeArray } from '@/utils/time'
const toolbarRightRef = ref<HTMLElement | null>(null)
const selectedFilter = ref('all')

// 时间按钮列表
const timeBtnList = [
  { label: '6 Hour', value: '6h' },
  { label: '1 Day', value: '1d' },
  { label: '1 Week', value: '1w' },
  { label: '1 Month', value: '1m' },
]
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
const xAxiosOption = {
  xAxiosData: getTimeRangeArray('6hours'),
}
const powerSeries = [

  {
    name: 'DG',
    data: [220, 182, 191, 234, 290, 330, 250],
    color: 'rgb(3, 93, 239)',
  },
  {
    name: 'ESS',
    data: [150, 232, 201, 154, 190, 330, 250],
    color: 'rgb(29, 134, 255)',
  },
  {
    name: 'PV',
    data: [120, 132, 101, 134, 90, 230, 150],
    color: 'rgb(105, 203, 255)',
  },
]

const poweryAxiosOption = {
  yUnit: 'kW',
}

const EssSeries = {
  barSeries: [
    {
      name: 'recharge',
      data: [150, 232, 201, 154, 190, 330, 250],

      color: 'rgb(29, 134, 255)',
    },
    {
      name: 'discharge',
      data: [-120, -132, -101, -134, -90, -230, -150],
      color: 'rgb(105, 203, 255)',
    }
  ],
  lineSeries: [
    {
      name: 'SOC',
      data: [50, 70, 60, 75, 80, 90, 85],
      color: 'rgb(3, 93, 239)',
    }
  ]
}
const EssyAxiosOption = {
  yUnit: ['kw', '%'],
}


const generateSeries = [
  {
    name: 'PV',
    data: [120, 132, 101, 134, 90, 230, 150],
    color: 'rgb(105, 203, 255)',
  },
  {
    name: 'DG',
    data: [80, 90, 100, 110, 120, 130, 150],
    color: 'rgb(29, 134, 255)',
  },
]
const generateyAxiosOption = {
  yUnit: 'kWh',
}


const energySeries = [
  {
    name: 'total generation',

    data: [80, 90, 100, 110, 120, 130, 150],
    color: 'rgb(29, 134, 255)',
  },
  {
    name: 'load demand',
    data: [120, 132, 101, 134, 90, 230, 150],
    color: '#ff4e3a',
  },
]
const energyyAxiosOption = {
  yUnit: 'kWh',
}


const economicSeries = [
  {
    name: 'total revenue',
    data: [120, 132, 101, 134, 90, 230, 150],
    color: 'rgb(29, 134, 255)',
  },
]
const economicyAxiosOption = {
  yUnit: '$',
}
const exampleDoughntSeries = [
  {
    name: 'PV',
    value: 45,
    color: 'rgb(105, 203, 255)',
  },
  {
    name: 'DG',
    value: 30,
    color: 'rgb(3, 93, 239)',
  },
  {
    name: 'ESS',
    value: 25,
    color: 'rgb(29, 134, 255)',
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

      // .chart__review {
      //   width: 100%;
      //   height: 100%;
      //   padding: 0.2rem;
      //   display: flex;
      //   flex-direction: column;
      //   background-color: rgba(84, 98, 140, 0.2);
      //   border: 0.01rem solid;

      //   border-image: linear-gradient(117.01deg,
      //       rgba(148, 166, 197, 0.3) 3.11%,
      //       rgba(148, 166, 197, 0) 31.6%,
      //       rgba(148, 166, 197, 0.103266) 70.79%,
      //       rgba(148, 166, 197, 0.3) 96.39%) 1;
      //   backdrop-filter: blur(0.1rem);

      //   .chart__review-header {
      //     height: 0.83rem;
      //     // padding: 0 rem;
      //     // background-color: rgba(84, 98, 140, 0.2);
      //     // border: 0.01rem solid;

      //     // border-image: linear-gradient(117.01deg,
      //     //     rgba(148, 166, 197, 0.3) 3.11%,
      //     //     rgba(148, 166, 197, 0) 31.6%,
      //     //     rgba(148, 166, 197, 0.103266) 70.79%,
      //     //     rgba(148, 166, 197, 0.3) 96.39%) 1;
      //     // backdrop-filter: blur(0.1rem);
      //     display: flex;
      //     justify-content: space-between;
      //     align-items: center;

      //     .chart__review-header-title {
      //       font-weight: 700;
      //       font-size: 0.26rem;
      //       line-height: 100%;
      //       letter-spacing: 0%;
      //     }

      //     .chart__review-header-value {
      //       font-weight: 700;
      //       font-size: 0.22rem;
      //       line-height: 0.3rem;
      //       letter-spacing: 0%;

      //       .chart__review-header-unit {
      //         font-size: 0.14rem;
      //         line-height: 0.3rem;
      //         letter-spacing: 0%;
      //         color: rgba(255, 255, 255, 0.6);
      //       }
      //     }
      //   }

      //   .chart__review-content {
      //     flex: 1;
      //     padding-top: 0.15rem;

      //     .chart__review-content-list {
      //       height: 100%;
      //       overflow-y: hidden;

      //       .chart__review-content-item {
      //         height:calc((100% - 0.32rem) / 3);
      //         margin-bottom: 0.12rem;
      //         padding-bottom: 0.13rem;
      //         border-bottom: 0.01rem dashed rgba(255, 255, 255, 0.2);

      //         &:last-child {
      //           border-bottom: none;
      //           padding-bottom: 0;
      //           margin-bottom: 0;
      //         }
      //       }
      //     }
      //   }
      // }
    }
  }

  :deep(.el-select__popper.el-popper) {
    top: 1.49rem !important;
  }
}
</style>
