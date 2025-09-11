<template>
  <div class="system-and-general">
    <HeaderCard title="System & General Settings" desc="Configure system-wide settings and general preferences" />
    <div class="system-and-general__body">
      <SettingCard title="Company Information">
        <!-- <template #control>
          <el-button type="primary">submit</el-button>
        </template> -->
        <el-form :model="companyInfoForm" label-width="1rem" label-position="top" inline class="company-info-form">
          <el-form-item label="Company Name" style="margin-right: 1.08rem;">
            <el-input v-model="companyInfoForm.companyName" placeholder="Enter Company Name" style="width: 7.52rem !important;"/>
          </el-form-item>
          <el-form-item label="Time cone" style="margin-right: 0;">
            <div class="form-item-time-cone" ref="timeConeRef">
              <el-select v-model="companyInfoForm.timeCone" placeholder="Select Time Cone" :append-to="timeConeRef" style="width: 7.52rem;">
                <el-option label="UTC-8(Pacific Time)" value="UTC-8" />
                <el-option label="UTC+8(China Standard Time)" value="UTC+8" />
                <el-option label="UTC+9(Japan Standard Time)" value="UTC+9" />
                <el-option label="UTC+10(Australia Standard Time)" value="UTC+10" />
              </el-select>

            </div>
          </el-form-item>
          <el-form-item label="Language" style="margin-right: 1.08rem;">
            <div class="form-item-language" ref="languageRef">
              <el-select v-model="companyInfoForm.language" placeholder="Select Language" :append-to="languageRef" style="width: 7.52rem;">
                <el-option label="English" value="en" />
                <el-option label="Chinese" value="zh" />
              </el-select>
            </div>
          </el-form-item>
          <el-form-item label="Currency" style="margin-right: 0;">
            <div class="form-item-currency" ref="currencyRef" style="margin-right:0;">
              <el-select v-model="companyInfoForm.currency" placeholder="Select Currency" :append-to="currencyRef" style="width: 7.52rem;">
                <el-option label="USD" value="USD" />
                <el-option label="CNY" value="CNY" />
              </el-select>
            </div>
          </el-form-item>
        </el-form>
        <div class="company-info-form__submit-btn">
          <el-button type="primary">submit</el-button>
        </div>
      </SettingCard>
      <SettingCard title="Display Preferences">
        <!-- <template #control>
          <el-button type="primary">submit</el-button>
        </template> -->
        <SettingItem title="Dark mode">
          <el-switch v-model="displayPreferencesForm.darkMode" style="margin-right: 2.04rem;"/>
        </SettingItem>
        <SettingItem title="Show grid lines on charts">
          <el-switch v-model="displayPreferencesForm.showGridLines" style="margin-right: 2.0rem;"/>
        </SettingItem>
        <SettingItem title="Auto-refresh dashboard (minutes)">
          <el-switch v-model="displayPreferencesForm.autoRefresh" style="margin-right: 2.0rem;"/>
        </SettingItem>
        <div class="display-preferences-form__submit-btn">
          <el-button type="primary">submit</el-button>
        </div>
      </SettingCard>
      <SettingCard title="Data Retention">
        <!-- <template #control>
          <el-button type="primary">submit</el-button>
        </template> -->
        <SettingItem title="Historical data retention (months)">
          <el-input v-model="dataRetentionForm.historicalDataRetention" placeholder="Enter Historical Data Retention" />
        </SettingItem>
        <SettingItem title="Log retention (days)">
          <el-input v-model="dataRetentionForm.logRetention" placeholder="Enter Log Retention" />
        </SettingItem>
        <div class="data-retention-form__submit-btn">
          <el-button type="primary">submit</el-button>
        </div>
      </SettingCard>
      <SettingCard title="Backup & Recovery">
        <!-- <template #control>
          <el-button type="primary">submit</el-button>
        </template> -->
        <SettingItem title="Automatic daily backups">
          <el-switch v-model="backupAndRecoveryForm.automaticDailyBackups" style="margin-right: 2.0rem;"/>
        </SettingItem>
        <SettingItem title="Backup retention (days)">
          <el-input v-model="backupAndRecoveryForm.backupRetention" placeholder="Enter Backup Retention" />
        </SettingItem>
        <div class="backup-and-recovery-form__submit-btn">
          <el-button type="primary">submit</el-button>
        </div>
      </SettingCard>
      <div class="system-and-general__download-btn">
        <IconButton :icon="downloadIcon" text="Download System Backup" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SettingItem from '@/components/card/settingItem.vue';
import SettingCard from '@/components/card/settingCard.vue';
import downloadIcon from '@/assets/icons/button-download.svg';
import { ref } from 'vue';
const companyInfoForm = ref({
  companyName: '',
  timeCone: '',
  language: '',
  currency: '',
})
const displayPreferencesForm = ref({
  darkMode: false,
  showGridLines: false,
  autoRefresh: '',
})
const languageRef = ref<HTMLElement | null>(null)
const currencyRef = ref<HTMLElement | null>(null)
const timeConeRef = ref<HTMLElement | null>(null)
const dataRetentionForm = ref({
  historicalDataRetention: '',
  logRetention: '',
})
const backupAndRecoveryForm = ref({
  automaticDailyBackups: false,
  backupRetention: '',
})
</script>

<style scoped lang="scss">
.system-and-general {
  height: 100%;
  width: 100%;

  .system-and-general__body {
    width: 100%;
    height: calc(100% - 1.22rem);
    overflow-y: auto;

    &>div {
      margin-bottom: 0.2rem;
    }
    .form-item-language,
    .form-item-time-cone,
    .form-item-currency{
      display: flex;
      position: relative;
    }

    .company-info-form {
      padding: 0.2rem 0.2rem 0 0.2rem;

    }
    .company-info-form__submit-btn,
    .display-preferences-form__submit-btn,
    .data-retention-form__submit-btn,
    .backup-and-recovery-form__submit-btn,
    .system-and-general__download-btn {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      margin-top: 0.2rem;
      padding-right: 0.2rem;
    }
    .system-and-general__download-btn{
      border-top: 0.01rem solid rgba(255, 255, 255, 0.4);
      padding-top: 0.2rem;
    }
  }

  // :deep(.el-input) {
  //   width: 7.52rem !important;
  // }

  // :deep(.el-select) {
  //   width: 7.52rem !important;
  // }
}
</style>
