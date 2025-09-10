<template>
  <div class="voltage-class notification">
    <HeaderCard title="Notification" desc="Configure system Alarm and notifications" />
    <div class="notification__body">
      <SettingCard title="Notifications Configuration" :icon="mailIcon">
        <template #control>
          <div class="notification__switch">
            <el-checkbox v-model="mailChecked" :indeterminate="isMailIndeterminate"
              @change="onMailCheckedChange">mail</el-checkbox>
            <el-checkbox v-model="smsChecked" :indeterminate="isSmsIndeterminate"
              @change="onSmsCheckedChange" style="margin-right: 1.31rem;">sms</el-checkbox>
            <el-button type="primary">submit</el-button>
          </div>
        </template>
        <SettingItem v-for="item in emailList" :key="item.id" :title="item.title" :desc="item.desc">
          <el-checkbox v-model="item.isMail" @change="onMailItemCheckedChange">mail</el-checkbox>
          <el-checkbox v-model="item.isSms" @change="onSmsItemCheckedChange" style="margin-right: 2.04rem;">sms</el-checkbox>

        </SettingItem>
      </SettingCard>
      <!-- <div class="notification__submit-btn">
        <el-button type="primary">Submit</el-button>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderCard from '@/components/card/headerCard.vue'
import SettingCard from '@/components/card/settingCard.vue'
import SettingItem from '@/components/card/settingItem.vue'
import mailIcon from '@/assets/icons/header-mail.svg'
import type { CheckboxValueType } from 'element-plus'
const mailChecked = ref(false)
const smsChecked = ref(false)
const isMailIndeterminate = ref(false)
const isSmsIndeterminate = ref(false)


const emailList = ref([
  {
    id: 1,
    title: 'System Alarm',
    desc: 'critical system Tailures and errors',
    value: 'systemAlarm',
    isMail: true,
    isSms: true,
  },
  {
    id: 4,
    title: 'Maintenance Reminders',
    desc: 'Scheduled maintenance notifications',
    value: 'maintenanceReminders',
    isMail: true,
    isSms: true,
  },
  {
    id: 5,
    title: 'Daily Reports',
    desc: 'Daily energy production summaries',
    value: 'dailyReports',
    isMail: true,
    isSms: true,
  },
  {
    id: 6,
    title: 'Weekly Reports',
    desc: 'Weekly performance analysis',
    value: 'weeklyReports',
    isMail: true,
    isSms: true,
  },
])
// 监听AllChecked变化，联动所有item.checkedGroup
function onMailCheckedChange(val: CheckboxValueType) {
  emailList.value.forEach(item => {
    item.isMail = val as boolean
  })
  isMailIndeterminate.value = false
}

function onSmsCheckedChange(val: CheckboxValueType) {
  emailList.value.forEach(item => {
    item.isSms = val as boolean
  })
  isSmsIndeterminate.value = false
}
function onMailItemCheckedChange() {
  const mailNum = emailList.value.filter(item => item.isMail).length
  mailChecked.value = mailNum === emailList.value.length
  isMailIndeterminate.value = mailNum > 0 && mailNum < emailList.value.length
}

function onSmsItemCheckedChange() {
  const smsNum = emailList.value.filter(item => item.isSms).length
  smsChecked.value = smsNum === emailList.value.length
  isSmsIndeterminate.value = smsNum > 0 && smsNum < emailList.value.length
}
onMounted(() => {
  onMailItemCheckedChange()
  onSmsItemCheckedChange()
})
</script>

<style scoped lang="scss">
.voltage-class .notification {
  position: relative;
  width: 100%;
  height: 100%;

  .notification__body {
    width: 100%;
    height: calc(100% - 1.22rem);
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .notification__switch {
      display: flex;
      align-items: center;
      // gap: 0.2rem;

      .notification-checkbox {
        margin-right: 1.11rem;
      }

      .notification__switch-title {
        font-size: 0.16rem;
        line-height: 100%;
        letter-spacing: 0%;
      }
    }

    &>div {
      margin-bottom: 0.2rem;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .notification__schedule-divider {
    width: 0.68rem;
    height: 0.01rem;
    background-color: rgba(255, 255, 255, 0.2);
    margin: 0.2rem 0.115rem 0 0.115rem;
  }

  .notification__submit-btn {
    width: 100%;
    display: flex;
    margin-top: 0.2rem;
    padding-right: 0.2rem;
    justify-content: flex-end;
  }

  :deep(.el-input) {
    width: 7.52rem !important;
  }

  :deep(.el-form--inline.el-form--label-top) {
    align-items: center;
  }
}
</style>
