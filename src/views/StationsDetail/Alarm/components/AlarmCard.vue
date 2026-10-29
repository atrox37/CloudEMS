<template>
  <div class="Alarm-card" :class="`${levelList[level - 1]}`">
    <div class="Alarm-card__header">
      <div class="header-icon" :class="`${levelList[level - 1]}`"></div>
      <div class="header-level" :class="`${levelList[level - 1]}`">{{ levelList[level - 1] }}</div>
      <div class="header-device">{{ AlarmData.deviceName ?? '' }}</div>
    </div>
    <div class="Alarm-card__content">
      <div class="card-left">
        <div class="Alarm-message">{{ AlarmData.message }}</div>

        <div class="Alarm-time">{{ format(AlarmData.timestamp) }}</div>
      </div>
      <!-- <div v-if="AlarmData.level !== 2" class="card-right">
                <el-button v-if="AlarmData.level === 0" type="primary">Urgent Action</el-button>
                <el-button v-else-if="AlarmData.level === 1" type="primary">Investigate</el-button>
            </div> -->
    </div>
  </div>
</template>
<script setup lang="ts">
import type { StationAlarmItem } from '@/types/Stations'
import { format } from '@/utils/time'
interface AlarmProps {
  AlarmData: StationAlarmItem
  level: number
}
defineProps<AlarmProps>()

const levelList = ['Critical', 'Warning', 'Info']
</script>
<style scoped lang="scss">
.Alarm-card {
  height: 100%;
  width: 100%;
  padding: 0.2rem;

  &.Critical {
    background-color: var(--vt-bg-danger-soft-30);
  }

  &.Warning {
    background-color: var(--vt-bg-warning-soft);
  }

  &.Info {
    background-color: var(--vt-bg-accent-blue-soft-30);
  }

  .Alarm-card__header {
    width: 100%;
    margin-bottom: 0.2rem;
    display: flex;
    align-items: center;

    .header-icon {
      height: 0.2rem;
      width: 0.2rem;
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      margin-right: 0.1rem;

      &.Critical {
        background-image: url('@/assets/icons/critical-Alarm.svg');
      }

      &.Warning {
        background-image: url('@/assets/icons/warning-Alarm.svg');
      }

      &.Info {
        background-image: url('@/assets/icons/info-Alarm.svg');
      }
    }

    .header-level {
      font-size: 0.16rem;
      line-height: 0.2133rem;
      letter-spacing: 0%;
      margin-right: 0.2rem;

      &.Critical {
        color: var(--vt-status-danger);
      }

      &.Warning {
        color: var(--vt-status-warning);
      }

      &.Info {
        color: var(--vt-accent-blue);
      }
    }

    .header-device {
      font-size: 0.16rem;
      line-height: 0.21rem;
      letter-spacing: 0%;
      color: var(--vt-white-60);
    }
  }

  .Alarm-card__content {
    width: 100%;
    display: flex;
    justify-content: space-between;

    .card-left {
      display: flex;
      flex-direction: column;

      .Alarm-message {
        font-weight: 700;
        font-size: 0.22rem;
        line-height: 100%;
        letter-spacing: 0%;
        color: var(--vt-text-primary);
        margin-bottom: 0.1rem;
      }

      .Alarm-requirement {
        font-size: 0.18rem;
        line-height: 0.2133rem;
        letter-spacing: 0%;
        color: var(--vt-white-60);
        margin-bottom: 0.04rem;
      }

      .Alarm-time {
        font-size: 0.16rem;
        line-height: 0.2133rem;
        letter-spacing: 0%;
        color: var(--vt-white-60);
      }
    }

    .card-right {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
