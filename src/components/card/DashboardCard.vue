<template>
  <div
    class="dashboard-card"
    :style="{ backgroundColor: props.bgColor || 'var(--vt-bg-input)' }"
  >
    <div class="card-main">
      <div class="card-left">
        <div
          class="card-icon"
          :style="{ backgroundColor: props.iconBgColor || 'var(--vt-bg-input)' }"
        >
          <img :src="dashboardData.icon" alt="" />
        </div>
        <div class="card-content">
          <div class="card-title">{{ dashboardData.title }}</div>
          <div class="card-value-box">
            <div
              class="card-value"
              :style="{
                color: props.valueColor || 'var(--vt-text-primary)',
                fontSize: props.isDesc ? '0.22rem' : '0.3rem',
              }"
            >
              {{ dashboardData.value }}&nbsp;<span v-if="dashboardData.unit">{{
                dashboardData.unit
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-right">
        <slot name="right-action"></slot>
      </div>
    </div>
    <div class="card-footer">
      <slot name="bottom-action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DashboardItem {
  title?: string
  value?: string | number
  unit?: string
  icon?: string
}
export interface DashboardProps {
  dashboardData: DashboardItem
  bgColor?: string
  valueColor?: string
  iconBgColor?: string
  isDesc?: boolean
  id?: number
}
const props = defineProps<DashboardProps>()
const { dashboardData } = props
</script>

<style scoped lang="scss">
.dashboard-card {
  width: 100%;
  height: 100%;
  // background-color: rgba(84, 98, 140, 0.2); // 已由内联样式动态控制
  border: 0.01rem solid;
  border-image: linear-gradient(
      117.64deg,
      var(--vt-border-color) 2.73%,
      rgba(148, 166, 197, 0) 31.73%,
      rgba(148, 166, 197, 0.103266) 71.62%,
      var(--vt-border-color) 97.67%
    )
    1;
  backdrop-filter: blur(0.1rem);
  padding: 0.1rem;

  .card-main {
    width: 100%;
    height: 0.8rem;
    display: flex;
    justify-content: space-between;

    .card-left,
    .card-right {
      height: 100%;
      display: flex;
      align-items: center;
      gap: 0.2rem;

      .card-icon {
        height: 100%;
        width: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 0.4rem;
          height: 0.4rem;
          object-fit: contain;
          object-position: center;
        }
      }

      .card-content {
        padding: 0.1rem 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .card-title {
          font-family: Arimo;
          font-weight: 400;
          font-size: 0.16rem;
          line-height: 0.22rem;
          letter-spacing: 0%;
          color: var(--vt-white-60);
        }

        .card-value-box {
          display: flex;
          align-items: flex-end;

          .card-value {
            font-family: Arimo;
            font-weight: 700;
            font-size: 0.3rem;
            line-height: 0.32rem;
            letter-spacing: 0%;
            color: var(--vt-text-primary);

            span {
              font-family: Arimo;
              font-weight: 400;
              font-size: 0.14rem;
              line-height: 0.16rem;
              letter-spacing: 0%;
              color: var(--vt-white-60);
            }
          }
        }
      }
    }
    .card-right {
      padding-right: 0.2rem;
    }
  }

  .card-footer {
    width: 100%;
  }
}
</style>
