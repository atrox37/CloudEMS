<template>
    <div class="voltage-class station-card">
        <!-- Header Section -->
        <div class="station-card__header">
            <div class="station-card__title-section">
                <h2 class="station-card__title">{{ station.name }}</h2>
                <div class="station-card__status">
                    <img class="station-card__status-dot" :src="station.status === 'Online' ? onlineIcon : offlineIcon"
                        alt="status-dot" />
                    <span class="station-card__status-text">{{ station.status }}</span>
                </div>
            </div>
            <div class="station-card__power-display">
                <div class="station-card__current-power">{{ station.currentPower }} <span>kWh</span></div>
                <div class="station-card__total-capacity">/{{ station.totalCapacity }}kWh</div>
            </div>
        </div>

        <!-- Power Output Bar -->
        <div class="station-card__power-section">
            <div class="station-card__power-label">Power Output</div>
            <div class="station-card__power-bar">
                <div class="station-card__power-bar-fill" :style="{ width: `${station.powerPercentage}%` }"></div>
            </div>
            <div class="station-card__power-percentage">{{ station.powerPercentage }}%</div>
        </div>

        <!-- Metric Cards Grid -->
        <div class="station-card__metrics-grid">
            <div class="station-card__metric-card" v-for="card in cardData" :key="card.id">
                <ValueCard :valueCard="card.CardValue" :bgColor="card.bgColor" :titleColor="card.titleColor"
                    :icon="card.icon" />
            </div>
        </div>

        <!-- Footer Section -->
        <div class="station-card__footer">
            <div class="footer-left">
                <IconButton type="primary" :icon="buttonSyncIcon" text="Data Synced" @click="handleSync" />
                <div class="station-card__last-update">Last Update: {{ station.lastUpdate }}</div>

            </div>
            <div class="footer-right">
                <IconButton type="primary" :icon="detailIcon" text="Detail" @click="handleDetail" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import onlineIcon from '@/assets/icons/station-status__online.svg'
import offlineIcon from '@/assets/icons/station-status__offline.svg'
import batteryIcon from '@/assets/icons/station-battery.svg'
import efficiencyIcon from '@/assets/icons/station-efficiency.svg'
import todayEnergyIcon from '@/assets/icons/station-energy.svg'
import temperatureIcon from '@/assets/icons/station-temperature.svg'
import buttonSyncIcon from '@/assets/icons/button-synced.svg'
import detailIcon from '@/assets/icons/button-detail.svg'
import ValueCard from './ValueCard.vue'


interface Station {
    id: string
    name: string
    status: string
    currentPower: number
    totalCapacity: number
    powerPercentage: number
    batteryLevel: number
    efficiency: number
    todayEnergy: number
    temperature: number
    lastUpdate: string
}

interface Props {
    station: Station
}

const props = defineProps<Props>()
const router = useRouter()
const cardData = computed(() => {
    return [
        {
            id: 1,
            CardValue: {

                title: 'Battery Level',
                value: props.station.batteryLevel,
                unit: '%',

            },
            bgColor: 'rgba(3, 93, 239, 0.1)',
            titleColor: 'rgba(29, 134, 255, 1)',
            icon: batteryIcon,
        },
        {
            id: 2,
            CardValue: {

                title: 'Efficiency',
                value: props.station.efficiency,
                unit: '%',

            },
            bgColor: 'rgba(255, 105, 0, 0.1)',
            titleColor: 'rgba(255, 105, 0, 1)',
            icon: efficiencyIcon,
        },
        {
            id: 3,
            CardValue: {

                title: 'Today\'s Energy',
                value: props.station.todayEnergy,
                unit: 'KWh',

            },
            bgColor: 'rgba(211, 52, 255, 0.1)',
            titleColor: 'rgba(198, 33, 243, 1)',
            icon: todayEnergyIcon,
        },
        {
            id: 4,
            CardValue: {

                title: 'Temperature',
                value: props.station.temperature,
                unit: '℉',

            },
            bgColor: 'rgba(255, 26, 22, 0.1)',
            titleColor: 'rgba(231, 51, 48, 1)',
            icon: temperatureIcon,
        },
    ]
})

const handleSync = () => {
    console.log('handleSync')
}

const handleDetail = () => {
    router.push({ name: 'stationsDetail' })
}
</script>

<style scoped lang="scss">
.voltage-class .station-card {
    height: 100%;
    width: 100%;
    background: rgba(84, 98, 140, 0.2);
    border: 0.01rem solid;

    border-image: linear-gradient(117.06deg, rgba(148, 166, 197, 0.3) 2.78%, rgba(148, 166, 197, 0) 32.23%, rgba(148, 166, 197, 0.103266) 72.75%, rgba(148, 166, 197, 0.3) 99.21%) 1;
    padding: 0.2rem;
    color: white;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(0.1rem);

    .station-card__header {
        height: 0.79rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.2rem;
        padding-bottom: 0.2rem;
        border-bottom: 0.01rem solid rgba(255, 255, 255, 0.1);

        .station-card__title-section {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .station-card__title {
                font-weight: 700;
                font-size: 0.26rem;
                line-height: 0.26rem;
                letter-spacing: 0%;
                color: #FFFFFF;
            }

            .station-card__status {
                display: flex;
                align-items: center;
                gap: 0.08rem;

                .station-card__status-dot {
                    width: 0.16rem;
                    height: 0.16rem;
                    object-position: center;
                    object-fit: contain;
                }

                .station-card__status-text {
                    font-weight: 400;
                    font-size: 0.16rem;
                    line-height: 100%;
                    letter-spacing: 0%;
                    color: rgba(255, 255, 255, 0.6);
                }
            }
        }

        .station-card__power-display {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;

            .station-card__current-power {
                font-weight: 700;
                font-size: 0.3rem;
                line-height: 0.3rem;
                letter-spacing: 0%;
                color: #FFFFFF;

                span {
                    font-size: 0.16rem;
                    color: rgba(255, 255, 255, 0.6);
                }
            }

            .station-card__total-capacity {
                font-weight: 400;
                font-size: 0.16rem;
                line-height: 0.16rem;
                letter-spacing: 0%;
                color: rgba(255, 255, 255, 0.6);
            }
        }
    }

    .station-card__power-section {
        margin-bottom: 0.2rem;
        display: flex;
        align-items: center;
        gap: 0.2rem;
        justify-content: space-between;

        .station-card__power-label {
            font-weight: 400;
            font-size: 0.16rem;
            line-height: 0.16rem;
            letter-spacing: 0%;
            color: #fff;
        }



        .station-card__power-bar {
            flex: 1;
            height: 0.12rem;
            background: rgba(255, 255, 255, 0.1);
            overflow: hidden;

            .station-card__power-bar-fill {
                height: 100%;
                background: rgba(106, 193, 97, 1);
                transition: width 0.3s ease;
            }
        }

        .station-card__power-percentage {
            font-weight: 400;
            font-size: 0.16rem;
            line-height: 0.16rem;
            letter-spacing: 0%;
            color: rgba(255, 255, 255, 0.6);
        }

    }

    .station-card__metrics-grid {
        display: flex;
        row-gap: 0.2rem;
        height: calc(100% - 1.87rem);
        justify-content: space-between;
        flex-wrap: wrap;

        .station-card__metric-card {
            height: calc(50% - 0.1rem);
            width: calc(50% - 0.1rem);
        }
    }

    .station-card__footer {
        margin-top: 0.2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .footer-left {
            display: flex;
            align-items: center;
            gap: 0.2rem;

            .station-card__last-update {
                font-weight: 400;
                font-size: 0.16rem;
                line-height: 0.16rem;
                letter-spacing: 0%;
            }
        }



    }
}
</style>
