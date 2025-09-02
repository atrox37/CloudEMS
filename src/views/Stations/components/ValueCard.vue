<template>
    <div class="voltage-class value-card" :style="{ backgroundColor: bgColor }">
        <div class="value-card__header">
            <img v-if="icon" :src="icon" class="value-card__icon" :style="{ color: titleColor }">
            <div class="value-card__title" :style="{ color: titleColor }">{{ valueCard.title }}</div>
        </div>

        <div class="value-card__content">
            <div class="value-card__value">{{ valueCard.value }}</div>&nbsp;
            <div class="value-card__unit">{{ valueCard.unit }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface ValueCard {
    title: string;
    value: string | number;
    unit: string;
}
defineProps<{
    valueCard: ValueCard;
    bgColor?: string;
    titleColor?: string;
    icon: string;
}>();
</script>

<style lang="scss" scoped>
.voltage-class .value-card {
    width: 100%;
    height: 100%;
    padding: 0.16rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .value-card__header {
        display: flex;
        align-items: center;
        gap: 0.1rem;

        .value-card__icon {
            width: 0.24rem;
            height: 0.24rem;
        }

        .value-card__title {
            font-weight: 400;
            font-size: 0.16rem;
            line-height: 0.24rem;
            letter-spacing: 0%;
        }
    }

    .value-card__content {
        display: flex;
        align-items: flex-end; // 让value和unit底部对齐
        gap: 0.04rem;

        .value-card__value {
            font-weight: 700;
            font-size: 0.3rem;
            line-height: 0.3rem;
            letter-spacing: 0%;
        }

        .value-card__unit {
            font-weight: 400;
            font-size: 0.14rem;
            line-height: 0.14rem;
            letter-spacing: 0%;
            color: rgba(255, 255, 255, 0.6);
        }
    }
}
</style>
