<template>
  <div class="voltage-class security">
    <div class="security__header">
      <div class="security__header-left">
        <div class="security__header-left-title">Security Settings</div>
        <div class="security__header-left-desc">Configure platform security and authentication</div>
      </div>
    </div>
    <div class="security__body">
      <SettingCard title="Password Policy">
        <SettingItem title="Minimum password length">
          <el-input v-model="passwordForm.minLength" placeholder="Enter password" />
        </SettingItem>
        <SettingItem title="Require uppercase letters">
          <el-switch v-model="passwordForm.requireUppercase" style="margin-right:2.04rem"/>
        </SettingItem>
        <SettingItem title="Require lowercase letters">
          <el-switch v-model="passwordForm.requireLowercase" style="margin-right:2.04rem"/>
        </SettingItem>
        <SettingItem title="Password expiration (days)">
          <el-input v-model="passwordForm.expiration" placeholder="Enter password" />
        </SettingItem>
      </SettingCard>
      <SettingCard title="Two-Factor Authentication">
        <SettingItem title="Require 2FA for all users">
          <el-switch v-model="twoFactorForm.require2FA" style="margin-right:2.04rem"/>
        </SettingItem>
        <SettingItem title="Require 2FA for admin users">
          <el-switch v-model="twoFactorForm.require2FAAdmin" style="margin-right:2.04rem"/>
        </SettingItem>
      </SettingCard>
    </div>

  </div>
</template>

<script setup lang="ts">
import SettingCard from '@/components/card/settingCard.vue'
import SettingItem from '@/components/card/settingItem.vue'


const passwordForm = ref({
  minLength: 8,
  expiration: 90,
  requireUppercase: true,
  requireLowercase: true,
})

const twoFactorForm = ref({
  require2FA: true,
  require2FAAdmin: true,
})

</script>

<style scoped lang="scss">
.voltage-class .security {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .security__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 1.02rem;
    padding: 0.2rem;
    margin-bottom: 0.2rem;
    background-color: rgba(84, 98, 140, 0.2);
    border: 0.01rem solid;

    border-image: linear-gradient(117.64deg, rgba(148, 166, 197, 0.3) 2.73%, rgba(148, 166, 197, 0) 31.73%, rgba(148, 166, 197, 0.103266) 71.62%, rgba(148, 166, 197, 0.3) 97.67%) 1;

    backdrop-filter: blur(0.1rem);

    .security__header-left {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      gap: 0.2rem;

      .security__header-left-title {
        font-size: 0.26rem;
        line-height: 0.26rem;
        letter-spacing: 0%;
        color: #fff;
      }

      .security__header-left-desc {
        font-size: 0.16rem;
        line-height: 100%;
        letter-spacing: 0%;
        vertical-align: middle;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .security__header-right {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-right: 0.1rem;
    }
  }

  .security__body {
    width: 100%;
    height: calc(100% - 1.22rem);
    overflow-y: auto;
    &>div{
      margin-bottom: 0.2rem;
      &:last-child{
        margin-bottom: 0;
      }
    }
  }


}
</style>
