<template>
    <div class="Alarm-card" :class="`${levelList[AlarmData.level]}`">
        <div class="Alarm-card__header">
            <div class="header-icon" :class="`${levelList[AlarmData.level]}`"></div>
            <div class="header-level" :class="`${levelList[AlarmData.level]}`">{{ levelList[AlarmData.level] }}</div>
            <div class="header-title">{{ AlarmData.title }}</div>
        </div>
        <div class="Alarm-card__content">
            <div class="card-left">
                <div class="Alarm-detail">{{ AlarmData.detail }}</div>

                <div class="Alarm-time">{{ AlarmData.time }}</div>

            </div>
            <!-- <div v-if="AlarmData.level !== 2" class="card-right">
                <el-button v-if="AlarmData.level === 0" type="primary">Urgent Action</el-button>
                <el-button v-else-if="AlarmData.level === 1" type="primary">Investigate</el-button>
            </div> -->
        </div>
    </div>
</template>
<script setup lang="ts">

interface AlarmData {
    title: string,
    level: number,
    detail: string,
    requirement: string,
    time: string,
}
interface AlarmProps {
    AlarmData: AlarmData,
}
const props = defineProps<AlarmProps>()

const levelList = ['Critical', 'Warning', 'Info']
</script>
<style scoped lang="scss">
.Alarm-card {
    height: 100%;
    width: 100%;
    padding: 0.2rem;

    &.Critical {
        background-color: rgba(218, 51, 51, 0.1);
    }

    &.Warning {
        background-color: rgba(201, 178, 63, 0.1);
    }

    &.Info {
        background-color: rgba(29, 134, 255, 0.1);
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
                color: rgba(249, 59, 58, 1);
            }

            &.Warning {
                color: rgba(255, 214, 0, 1);
            }

            &.Info {
                color: rgba(29, 134, 255, 1);
            }
        }

        .header-title {
            font-size: 0.16rem;
            line-height: 0.2133rem;
            letter-spacing: 0%;
            color: rgba(255, 255, 255, 0.6);

        }
    }

    .Alarm-card__content {
        width: 100%;
        display: flex;
        justify-content: space-between;

        .card-left {
            display: flex;
            flex-direction: column;

            .Alarm-detail {
                font-weight: 700;
                font-size: 0.22rem;
                line-height: 100%;
                letter-spacing: 0%;
                color: #fff;
                margin-bottom: 0.1rem;
            }

            .Alarm-requirement {
                font-size: 0.18rem;
                line-height: 0.2133rem;
                letter-spacing: 0%;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 0.04rem;
            }

            .Alarm-time {
                font-size: 0.16rem;
                line-height: 0.2133rem;
                letter-spacing: 0%;
                color: rgba(255, 255, 255, 0.6);
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
