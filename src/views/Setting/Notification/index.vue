<template>
  <div class="voltage-class notification">
    <HeaderCard title="Notification" desc="Configure system alerts and notifications" />
    <div class="notification__body">
      <SettingCard title="Email Notifications" :icon="mailIcon">
        <template #control>
          <div class="notification__switch">
            <div class="notification__switch-title">Enable All</div>
            <el-switch v-model="emailAll" :active-value="true" :inactive-value="false" @change="onEmailAllChange" />
          </div>
        </template>
        <SettingItem v-for="item in emailList" :key="item.id" :title="item.title" :desc="item.desc">
          <el-switch v-model="emailForm[item.value as keyof typeof emailForm]" @change="onEmailItemChange" style="margin-right: 2.04rem;" />
        </SettingItem>
      </SettingCard>
      <SettingCard title="SMS Notifications" :icon="smsIcon">
        <template #control>
          <div class="notification__switch">
            <div class="notification__switch-title">Enable All</div>
            <el-switch v-model="smsAll" :active-value="true" :inactive-value="false" @change="onSmsAllChange" />
          </div>
        </template>
        <SettingItem v-for="item in smsList" :key="item.id" :title="item.title" :desc="item.desc">
          <el-switch v-model="smsForm[item.value as keyof typeof smsForm]" @change="onSmsItemChange" style="margin-right: 2.04rem;" />
        </SettingItem>
      </SettingCard>
      <SettingCard title="Push Notifications" :icon="pushIcon">
        <template #control>
          <div class="notification__switch">
            <div class="notification__switch-title">Enable All</div>
            <el-switch v-model="pushAll" :active-value="true" :inactive-value="false" @change="onPushAllChange" />
          </div>
        </template>
        <SettingItem v-for="item in pushList" :key="item.id" :title="item.title" :desc="item.desc">
          <el-switch v-model="pushForm[item.value as keyof typeof pushForm]" @change="onPushItemChange" style="margin-right: 2.04rem;" />
        </SettingItem>
      </SettingCard>
      <SettingCard title="Notification Schedule">
        <SettingItem isCustom>
          <template #custom>
          <el-form :model="scheduleForm" label-width="1rem" label-position="top" inline>
            <el-form-item label="Quiet Hours Start" style="margin-right: 0;">
              <el-time-picker
               :teleported="false"
                v-model="scheduleForm.startTime"
                :disabled-hours="disabledStartHours"
                :disabled-minutes="disabledStartMinutes"
                :disabled-seconds="disabledStartSeconds"
                @change="onStartTimeChange"
              />
            </el-form-item>
            <div class="notification__schedule-divider"></div>
            <el-form-item label="Quiet Hours End" style="margin-right: 0;">
              <el-time-picker
                :teleported="false"
                v-model="scheduleForm.endTime"
                :disabled-hours="disabledEndHours"
                :disabled-minutes="disabledEndMinutes"
                :disabled-seconds="disabledEndSeconds"
                @change="onEndTimeChange"
              />
            </el-form-item>
          </el-form>
          </template>
        </SettingItem>
        <SettingItem title="Apply quiet hours to non-critical notifications only">
          <el-switch v-model="quietHours" style="margin-right: 2.04rem;" />
        </SettingItem>
      </SettingCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderCard from '@/components/card/headerCard.vue'
import SettingCard from '@/components/card/settingCard.vue'
import SettingItem from '@/components/card/settingItem.vue'
import mailIcon from '@/assets/icons/header-mail.svg'
import smsIcon from '@/assets/icons/header-phone.svg'
import pushIcon from '@/assets/icons/header-notifications.svg'
import { ref } from 'vue'
import { useTimePickerLimits } from '@/utils/timePicker'

const quietHours = ref(false)
const scheduleForm = ref({
  startTime: '',
  endTime: '',
})

// 使用时间选择器限制工具
const {
  onStartTimeChange,
  onEndTimeChange,
  disabledStartHours,
  disabledStartMinutes,
  disabledStartSeconds,
  disabledEndHours,
  disabledEndMinutes,
  disabledEndSeconds,
} = useTimePickerLimits(scheduleForm.value)

// 邮件通知
const emailAll = ref(true)
const emailForm = ref({
  systemAlerts: true,
  stationStatusChanges: true,
  batteryAlerts: true,
  maintenanceReminders: true,
  dailyReports: true,
  weeklyReports: true,
})
const emailList = ref([
  {
    id: 1,
    title: 'System Alerts',
    desc: 'critical system Tailures and errors',
    value: 'systemAlerts',
  },
  {
    id: 2,
    title: 'Station Status Changes',
    desc: 'Online/offline status updates',
    value: 'stationStatusChanges',
  },
  {
    id: 3,
    title: 'battery Alerts',
    desc: 'Low battery and charging issues',
    value: 'batteryAlerts',
  },
  {
    id: 4,
    title: 'Maintenance Reminders',
    desc: 'Scheduled maintenance notifications',
    value: 'maintenanceReminders',
  },
  {
    id: 5,
    title: 'Daily Reports',
    desc: 'Daily energy production summaries',
    value: 'dailyReports',
  },
  {
    id: 6,
    title: 'Weekly Reports',
    desc: 'Weekly performance analysis',
    value: 'weeklyReports',
  },
])

// 短信通知
const smsAll = ref(true)
const smsForm = ref({
  systemAlerts: true,
  stationOffline: true,
  fireOrSafetyAlerts: true,
  batteryCriticalLow: true,
})
const smsList = ref([
  {
    id: 1,
    title: 'Critical System Alerts',
    desc: 'Emergency system failures only',
    value: 'systemAlerts',
  },
  {
    id: 2,
    title: 'Station Offline',
    desc: 'When stations go offline unexpectedly',
    value: 'stationOffline',
  },
  {
    id: 3,
    title: 'Fire or Safety Alerts',
    desc: 'Emergency safety notifications',
    value: 'fireOrSafetyAlerts',
  },
  {
    id: 4,
    title: 'Battery Critical Low',
    desc: 'When battery reaches critical levels',
    value: 'batteryCriticalLow',
  },
])

// 推送通知
const pushAll = ref(true)
const pushForm = ref({
  realTimeAlerts: true,
  performanceUpdates: true,
  taskReminders: true,
})
const pushList = ref([
  {
    id: 1,
    title: 'Real-time Alerts',
    desc: 'Instant notifications for all alerts',
    value: 'realTimeAlerts',
  },
  {
    id: 2,
    title: 'Performance Updates',
    desc: 'Efficiency and output changes',
    value: 'performanceUpdates',
  },
  {
    id: 3,
    title: 'Task Reminders',
    desc: 'Scheduled tasks and maintenance',
    value: 'taskReminders',
  }
])

// 关联总开关和子开关逻辑
function setAll(form: any, value: boolean) {
  Object.keys(form).forEach((key) => {
    form[key] = value
  })
}

// 邮件总开关变化
function onEmailAllChange(val: boolean) {
  setAll(emailForm.value, val)
}
// 邮件子开关变化
function onEmailItemChange() {
  // 如果所有子项都为true，则总开关为true，否则为false
  emailAll.value = Object.values(emailForm.value).every(Boolean)
}

// 短信总开关变化
function onSmsAllChange(val: boolean) {
  setAll(smsForm.value, val)
}
function onSmsItemChange() {
  smsAll.value = Object.values(smsForm.value).every(Boolean)
}

// 推送总开关变化
function onPushAllChange(val: boolean) {
  setAll(pushForm.value, val)
}
function onPushItemChange() {
  pushAll.value = Object.values(pushForm.value).every(Boolean)
}
</script>

<style scoped lang="scss">
.voltage-class .notification {
  position: relative;
  width: 100%;
  height: 100%;

  .notification__body {
    .notification__switch {
      display: flex;
      align-items: center;
      gap: 0.2rem;

      .notification__switch-title {
        font-size: 0.16rem;
        line-height: 100%;
        letter-spacing: 0%;

      }
    }

    width: 100%;
    height: calc(100% - 1.22rem);
    overflow-y: auto;

    &>div {
      margin-bottom: 0.2rem;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  .notification__schedule-divider{
    width: 0.68rem;
    height: 0.01rem;
    background-color: rgba(255, 255, 255, 0.2);
    margin: 0.2rem 0.115rem 0 0.115rem;
  }
  :deep(.el-input){
    // width:calc(50% - 46px) !important;
    width: 7.52rem !important;
  }
  :deep(.el-form--inline.el-form--label-top){
    align-items: center;
  }
}
</style>
