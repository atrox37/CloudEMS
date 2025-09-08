<template>
    <div class="voltage-class stations-detail">
        <!-- <div class="stations-detail__back">
            <IconButton type="warning" :icon="backIcon" @click="handleBack" text="Back" />
        </div> -->
        <div class="stations-detail__header">
            <div class="header-station-info">
                <div class="header-station-info__left">
                    <img :src="backIcon" @click="handleBack" />
                    <div class="station-msg">
                        <el-dropdown @command="handleUserCommand" trigger="click" :teleported="false" :z-index="3000">
                            <div class="header-station-info__name-box">
                                <div class="header-station-info__name">North Valley Solar</div>
                                <img :src="arrowDownIcon" class="header-station-info__arrow" />
                            </div>

                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item v-for="item in stationsList" :key="item.id" :command="item.id">
                                        <div class="station-detail-Item">
                                            <div class="item-info">
                                                <div class="station-detail-Item__name">{{ item.name }}</div>
                                                <div class="item-status">
                                                    <img :src="item.status ? onlineIcon : offlineIcon"
                                                        class="item-status__icon" />
                                                    <div class="item-status__text">{{ item.status ? 'Online' : 'Offline'
                                                        }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="item-description">{{ item.address }}</div>
                                        </div>

                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        <div class="header-station-info__description">
                            <div class="header-station-info__status">
                                <img :src="onlineIcon" class="header-station-info__status-icon" />
                                <div class="header-station-info__status-text">Online</div>
                            </div>
                            <div class="header-station-info__time">
                                <img :src="timeIcon" class="header-station-info__time-icon" />
                                <div class="header-station-info__time-text">12:00:00</div>
                            </div>
                            <div class="header-station-info__address">
                                <img :src="addressIcon" class="header-station-info__address-icon" />
                                <div class="header-station-info__address-text">North Valley,CA 94588</div>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="header-station-info__right">
                    <div class="header__right-weather">
                        <img :src="sunIcon" alt="sunIcon" class="header__right-weatherIcon" />
                        <div class="header__right-weatherStatus">wind</div>
                        <div class="header__right-weatherValue">67F~79F</div>
                    </div>
                    <div class="header-station-info__power">
                        <div class="header-station-info__power-value">120&nbsp;<span>kw</span></div>
                        <div class="header-station-info__power-desc">Current Output</div>
                    </div>

                </div>

            </div>
            <div class="stations-detail__tabs">
                <IconButton :type="activeTab === 'Overview' ? 'primary' : 'warning'" :icon="overviewIcon"
                    text="Overview" @click="handleTabClick('Overview')" />
                <IconButton :type="activeTab === 'Performance' ? 'primary' : 'warning'" :icon="performanceIcon"
                    text="Performance" @click="handleTabClick('Performance')" />
                <IconButton :type="activeTab === 'Analytics' ? 'primary' : 'warning'" :icon="analyticsIcon"
                    text="Analytics" @click="handleTabClick('Analytics')" />
                <IconButton :type="activeTab === 'Alarm' ? 'primary' : 'warning'" :icon="AlarmIcon" text="Alarm"
                    @click="handleTabClick('Alarm')" />
                <IconButton :type="activeTab === 'Maintenance' ? 'primary' : 'warning'" :icon="maintenanceIcon"
                    text="Maintenance" @click="handleTabClick('Maintenance')" />
                <!-- <div class="stations-detail__tabs-item" :class="{ 'active': activeTab === 'Overview' }"
                    @click="handleTabClick('Overview')"><img :src="overviewIcon" /><span>Overview</span></div>
                <div class="stations-detail__tabs-item" :class="{ 'active': activeTab === 'Performance' }"
                    @click="handleTabClick('Performance')"><img :src="performanceIcon" /><span>Performance</span></div>
                <div class="stations-detail__tabs-item" :class="{ 'active': activeTab === 'Analytics' }"
                    @click="handleTabClick('Analytics')"><img :src="analyticsIcon" /><span>Analytics</span></div>
                <div class="stations-detail__tabs-item" :class="{ 'active': activeTab === 'Alarm' }"
                    @click="handleTabClick('Alarm')"><img :src="AlarmIcon" /><span>Alarm</span></div>
                <div class="stations-detail__tabs-item" :class="{ 'active': activeTab === 'Maintenance' }"
                    @click="handleTabClick('Maintenance')"><img :src="maintenanceIcon" /><span>Maintenance</span></div> -->
            </div>

        </div>
        <div class="stations-detail__content">
            <router-view />
        </div>
    </div>
</template>

<script setup lang="ts">
// import backIcon from '@/assets/icons/button-arrow-left.svg'
import backIcon from '@/assets/icons/back.svg'
import onlineIcon from '@/assets/icons/station-status__online.svg'
import offlineIcon from '@/assets/icons/station-status__offline.svg'
import arrowDownIcon from '@/assets/icons/dropdown-arrow-down.svg'
import overviewIcon from '@/assets/icons/button-overview.svg'
import performanceIcon from '@/assets/icons/button-performance.svg'
import analyticsIcon from '@/assets/icons/button-analytics.svg'
import maintenanceIcon from '@/assets/icons/button-maintenance.svg'
import AlarmIcon from '@/assets/icons/button-Alarm.svg'
import sunIcon from '@/assets/icons/sunny.svg'
import timeIcon from '@/assets/icons/time.svg'
import addressIcon from '@/assets/icons/address.svg'

const router = useRouter()
const route = useRoute()
const activeTab = ref('Overview')
watch(() => route.name, (newName) => {
    activeTab.value = newName as string
}, { immediate: true })
const handleUserCommand = (command: string) => {
    console.log(command)
}
const stationsList = reactive([
    {
        id: 1,
        name: 'North Valley Solar',
        status: 1,
        address: 'North Valley,CA 94588'
    },
    {
        id: 2,
        name: 'South Valley Solar',
        status: 0,
        address: 'South Valley,CA 94588'
    },
    {
        id: 3,
        name: 'East Valley Solar',
        status: 1,
        address: 'East Valley,CA 94588'
    },

    {
        id: 4,
        name: 'West Valley Solar',
        status: 0,
        address: 'West Valley,CA 94588'
    },
])

const handleBack = () => {
    router.push({ name: 'stations' })
}

const handleTabClick = (tab: string) => {
    activeTab.value = tab
    router.push({ name: tab })
}
</script>

<style scoped lang="scss">
.voltage-class .stations-detail {
    width: 100%;
    height: 100%;

    .stations-detail__header {

        .header-station-info {
            position: relative;
            padding: 0.2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(84, 98, 140, 0.2);
            border: 0.01rem solid;
            border-image: linear-gradient(117.64deg, rgba(148, 166, 197, 0.3) 2.73%, rgba(148, 166, 197, 0) 31.73%, rgba(148, 166, 197, 0.103266) 71.62%, rgba(148, 166, 197, 0.3) 97.67%) 1;
            backdrop-filter: blur(0.1rem);
            z-index: 1000;



            .header-station-info__left {
                height: 100%;
                display: flex;
                align-items: center;
                gap: 0.2rem;

                &>img {
                    width: 0.4rem;
                    height: 100%;
                    object-fit: cover;
                    cursor: pointer;
                }

                .station-msg {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;

                    .header-station-info__name-box {
                        display: flex;
                        align-items: center;
                        gap: 0.1rem;

                        .header-station-info__name {
                            font-weight: 700;
                            font-size: 0.26rem;
                            line-height: 0.26rem;
                            letter-spacing: 0%;
                            color: #fff;
                        }

                        .header-station-info__arrow {
                            height: 0.2rem;
                            width: 0.2rem;
                        }
                    }


                    .station-detail-Item {
                        padding: 0.1rem 0;
                        width: 2.82rem;

                        .item-info {
                            width: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;

                            .station-detail-Item__name {
                                font-weight: 700;
                                font-size: 0.16rem;
                                line-height: 0.26rem;
                                letter-spacing: 0%;
                                color: #fff;
                            }

                            .item-status {
                                display: flex;
                                align-items: center;
                                gap: 0.06rem;

                                .item-status__icon {
                                    width: 0.16rem;
                                    height: 0.16rem;
                                }

                                .item-status__text {
                                    font-weight: 400;
                                    font-size: 0.14rem;
                                    line-height: 100%;
                                    letter-spacing: 0%;
                                    vertical-align: middle;
                                    color: #fff;
                                }
                            }
                        }

                    }

                    .header-station-info__description {
                        display: flex;
                        align-items: center;
                        gap: 0.2rem;
                        font-weight: 400;
                        font-size: 0.16rem;
                        line-height: 100%;
                        letter-spacing: 0%;
                        color: rgba(255, 255, 255, 0.6);

                        .header-station-info__time,
                        .header-station-info__address,
                        .header-station-info__status {
                            display: flex;
                            align-items: center;
                            gap: 0.06rem;

                            img {
                                width: 0.16rem;
                                height: 0.16rem;
                                object-fit: contain;
                            }
                        }

                    }
                }



            }

            .header-station-info__right {
                height: 100%;
                display: flex;
                align-items: center;
                gap: 1rem;

                .header__right-weather {
                    display: flex;
                    align-items: center;
                    gap: 0.1rem;
                    font-size: 0.2rem;
                    letter-spacing: 0%;

                    .header__right-weatherIcon {
                        width: 0.4rem;
                        height: 0.36rem;
                        object-fit: contain;
                    }

                    .header__right-weatherStatus {
                        font-weight: 500;
                        font-style: Medium;
                    }

                    .header__right-weatherValue {
                        font-weight: 700;
                        font-style: Bold;
                    }
                }

                .header-station-info__power {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;

                    .header-station-info__power-value {
                        font-weight: 700;
                        font-size: 0.3rem;
                        line-height: 0.3rem;
                        letter-spacing: 0%;
                        color: #fff;

                        span {
                            font-size: 0.14rem;
                            line-height: 0.3rem;
                            letter-spacing: 0%;
                            color: rgba(255, 255, 255, 0.6);
                        }
                    }

                    .header-station-info__power-desc {
                        font-weight: 400;
                        font-size: 0.16rem;
                        line-height: 0.16rem;
                        letter-spacing: 0%;
                        color: rgba(255, 255, 255, 0.6);
                    }
                }

            }
        }

        .stations-detail__tabs {
            display: flex;
            align-items: center;
            gap: 0.16rem;
            padding: 0.2rem 0;
            // margin-bottom: 0.2rem;
            // border-bottom: 0.01rem solid rgba(255, 255, 255, 0.1); 

            // .stations-detail__tabs-item {
            //     display: flex;
            //     align-items: center;
            //     gap: 0.06rem;
            //     cursor: pointer;
            //     height: 0.32rem;
            //     font-size: 0.14rem;
            //     padding: 0.05rem 0.16rem;
            //     border-top: 0.02rem solid rgba(255, 255, 255, 0.1);
            //     border-right: 0.02rem solid rgba(255, 255, 255, 0.1);
            //     cursor: pointer;
            //     transition: all 0.3s ease;
            //     background-color: rgba(255, 255, 255, 0.1);

            //     &::first-child {
            //         border-left: 0.02rem solid rgba(255, 255, 255, 0.1);
            //     }
            //     img {
            //         width: 0.14rem;
            //         height: 0.14rem;
            //         object-fit: contain;
            //         margin-right: 0.08rem;
            //     }


            //     &.active {
            //         background-color: rgba(255, 105, 0, 1);
            //     }

            // }


        }
    }

    .stations-detail__content {
        height: calc(100% - 1.77rem);
        width: 100%;
    }

    :deep(.el-dropdown__popper.el-popper.is-light) {
        top: 0.38rem !important;
        background-color: rgba(15, 35, 70, 0.8) !important;
        z-index: 3000 !important;
    }

    :deep(.el-dropdown-menu) {
        // background-color: rgba(43, 68, 111, 1) !important;
        backdrop-filter: blur(0.2rem) !important;
        box-shadow: 0rem 0.04rem 0.1rem 0rem rgba(0, 0, 0, 0.25) !important;

    }

    :deep(.el-dropdown-menu__item:hover) {
        border: 0.01rem solid rgba(255, 105, 0, 1) !important;
        background-color: rgba(255, 255, 255, 0.1);
    }
}
</style>
