<template>
  <div class="voltage-class header">
    <div class="header__left">
      <div class="header__left-title">MOSS Solar</div>
    </div>

    <div class="header__right">
      <div class="header__right-avatar">
        <el-dropdown
          @command="handleUserCommand"
          trigger="click"
          :teleported="false"
          @visible-change="handleDropdownChange"
        >
          <div class="header__user">
            <div class="header__user-avatar">
              <div class="header__user-avatar-initials">
                {{ getAvatarName(userStore.userInfo?.sysUserPo?.username) }}
              </div>
            </div>
            <span class="header__user-name">{{ userStore.userInfo?.sysUserPo?.username }}</span>
            <img
              :src="arrowDownIcon"
              class="header__user-arrow"
              :class="{ rotate: isDropdownVisible }"
            />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <div class="header__user-Item">
                  <img :src="logoutIcon" class="header__user-logoutIcon" />
                  Logout
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <!-- 告警通知下拉框 -->
      <div class="header__right-notice">
        <el-dropdown
          trigger="click"
          :teleported="false"
          @command="handleAlarmCommand"
          @visible-change="handleAlarmDropdownChange"
        >
          <el-button link class="header__right-noticeBtn">
            <el-badge
              :value="stationStore.totalAlarmCount"
              :hidden="stationStore.totalAlarmCount === 0"
            >
              <img :src="noticeIcon" class="header__right-noticeIcon" />
            </el-badge>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="station in stationStore.stations"
                :key="station.stationId"
                :command="station.stationId"
              >
                <div class="header__user-Item">
                  <span class="header__alarm-item-name">{{ station.stationName }}</span>
                  <el-badge
                    :value="station.alarmCount"
                    :hidden="station.alarmCount === 0"
                    class="header__alarm-item-badge"
                  />
                </div>
              </el-dropdown-item>
              <el-dropdown-item v-if="stationStore.stations.length === 0" disabled>
                <div class="header__user-Item header__user-Item--empty">暂无站点数据</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useStationStore } from '@/stores/station'
// 正确引入头像图片，确保路径无误，推荐用import方式
import logoutIcon from '@/assets/icons/user-logout.svg'
import noticeIcon from '@/assets/icons/notice.svg'
import arrowDownIcon from '@/assets/icons/arrowDownIcon.svg'

const router = useRouter()
const userStore = useUserStore()
const stationStore = useStationStore()
const isDropdownVisible = ref(false)
const isAlarmDropdownVisible = ref(false)

// 处理告警下拉框点击，跳转到对应站点的告警页面
const handleAlarmCommand = (stationId: number) => {
  router.push({ name: 'Alarm', params: { stationId } })
}

// 用户操作
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'logout':
      userStore.logout()
      break
  }
}

const getAvatarName = (name: string | undefined): string | undefined => {
  // 纯函数：避免在渲染期间产生副作用（如触发登出）
  if (!name) {
    return 'U'
  }
  const nameStr = name.split(' ')
  if (nameStr.length === 1) {
    return name.charAt(0).toUpperCase()
  } else {
    return nameStr[0].charAt(0).toUpperCase() + nameStr[1].charAt(0).toUpperCase()
  }
}

const handleDropdownChange = (visible: boolean) => {
  isDropdownVisible.value = visible
}

const handleAlarmDropdownChange = (visible: boolean) => {
  isAlarmDropdownVisible.value = visible
}
</script>

<style lang="scss" scoped>
.voltage-class.header {
  position: relative;
  height: 0.85rem;
  background: var(--vt-bg-header);
  border-bottom: 0.01rem solid var(--vt-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem;
  z-index: 99;

  .header__left {
    display: flex;
    align-items: center;
    gap: 0.1rem;

    .header__left-title {
      font-family: Montserrat;
      font-weight: 600;
      font-style: Semi Bold;
      font-size: 0.3rem;
      line-height: 150%;
      letter-spacing: 0%;
      color: var(--vt-text-primary);
      margin-right: 0.1rem;
    }

    .header__left-status {
      border: 0.01rem solid transparent;
      width: 1rem;
      height: 0.3rem;
      padding: 0.07rem 0 0.07rem 0.1rem;
      display: flex;
      align-items: center;
      background: var(--vt-bg-header-strong);
      border-radius: 0.15rem;
      backdrop-filter: blur(0.1rem);

      .header__left-statusIcon {
        width: 0.16rem;
        height: 0.16rem;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        background-color: var(--vt-bg-success-soft);
        margin-right: 0.06rem;

        .header__left-statusIconCircle {
          width: 0.1rem;
          height: 0.1rem;
          border-radius: 50%;
          background-color: var(--vt-status-online);
        }
      }

      .header__left-statusText {
        font-family: Arimo;
        font-weight: 700;
        font-style: Bold;
        font-size: 0.16rem;
        line-height: 100%;
        letter-spacing: 0%;
        vertical-align: middle;
        color: var(--vt-text-primary);
      }
    }
  }

  .header__right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .header__right-avatar {
      cursor: pointer;
      margin-right: 0.3rem;
    }

    .header__right-notice {
      .header__right-noticeBtn {
        padding: 0.2rem 0.1rem 0.13rem 0;
        transition: all 0.3s ease;

        :deep(.el-badge__content) {
          width: 0.16rem;
          height: 0.16rem;
          border: none;
          border-radius: 50%;
          background-color: var(--vt-status-danger);
          font-family: Arimo;
          font-weight: 400;
          font-size: 0.14rem;
        }

        .header__right-noticeIcon {
          width: 0.2rem;
          height: 0.2rem;
          object-fit: contain;
        }
      }
      :deep(.el-popper.is-light) {
        top: 0.52rem !important;
      }
    }
  }
}

.header__user {
  display: flex;
  align-items: center;
  gap: 0.08rem;
  padding: 0.04rem 0.08rem;
  border-radius: 0.08rem;
  transition: all 0.3s ease;
}

.header__user-avatar {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--vt-bg-accent-blue-soft);

  .header__user-avatar-initials {
    color: var(--vt-accent-blue);
    font-weight: 700;
    font-size: 0.19rem;
    line-height: 100%;
    letter-spacing: 0%;
  }
}

.header__user-name {
  font-family: Arimo;
  font-weight: 500;
  font-style: Medium;
  font-size: 0.18rem;
  line-height: 140%;
  letter-spacing: 0%;
  color: var(--vt-text-primary);
}

.header__user-arrow {
  height: 0.08rem;
  width: 0.1rem;
  font-size: 0.12rem;
  color: var(--vt-text-secondary);
  transition: all 0.3s ease;

  &.rotate {
    transform: rotate(180deg);
  }
}

:deep(.el-badge__content.is-fixed) {
  right: 0.1rem;
  top: 0.04rem;
  padding: 0;
}

.header__user-Item {
  width: 100%;
  padding: 0.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--vt-text-primary);
  font-weight: 500;
  font-size: 0.14rem;
  line-height: 100%;
  letter-spacing: 0%;

  .header__user-logoutIcon {
    width: 0.2rem;
    height: 0.2rem;
    object-fit: contain;
    margin-right: 0.1rem;
  }

  .header__alarm-item-name {
    height: 0.2rem;
    line-height: 0.2rem;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 0.1rem;
  }

  .header__alarm-item-badge {
    :deep(.el-badge__content) {
      position: relative;
      top: auto;
      right: auto;
      transform: none;
      width: auto;
      min-width: 0.2rem;
      height: 0.2rem;
      padding: 0 0.06rem;
      border: none;
      border-radius: 0.1rem;
      background-color: var(--vt-status-danger);
      font-family: Arimo;
      font-weight: 400;
      font-size: 0.12rem;
      line-height: 0.2rem;
    }
  }

  &--empty {
    justify-content: center;
    color: var(--vt-white-50);
}
}
</style>
