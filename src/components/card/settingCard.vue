<template>
    <div class="setting-card">
        <div class="setting-card__header">
            <div class="setting-card__header-left">
                <img v-if="icon" :src="icon" class="setting-card__header-icon" />
                <div class="setting-card__header-title">{{ title }}</div>
            </div>
            <div class="setting-card__header-right">
                <slot name="control"></slot>
            </div>
        </div>
        <div class="setting-card__body">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        default: '',
    },
})
</script>
<style scoped lang="scss">
.setting-card {
    width: 100%;

    .setting-card__header {
        width: 100%;
        height: 0.6rem;
        padding: 0.2rem;
        background-color: rgba(84, 98, 140, 0.2);
        display: flex;
        align-items: center;
        justify-content: space-between;

        .setting-card__header-left {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.1rem;

            .setting-card__header-icon {
                width: 0.24rem;
                height: 0.24rem;
            }

            .setting-card__header-title {
                font-weight: 700;
                font-size: 0.2rem;
                letter-spacing: 0%;

            }

        }
        .setting-card__header-right{
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 2.04rem;

        }
    }
    .setting-card__body{
        width: 100%;
        background-color: transparent;
    }
}
</style>
