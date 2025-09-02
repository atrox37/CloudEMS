<template>
    <div class="setting-item" :class="{ 'custom': isCustom }">
        <slot name="custom"></slot>
        <div v-if="!isCustom" class="setting-item__header-left">
            <!-- <img v-if="icon" :src="icon" class="setting-item__header-icon" /> -->
            <div class="setting-item__header-title">{{ title }}</div>
            <div class="setting-item__header-desc">{{ desc }}</div>
        </div>
        <div v-if="!isCustom" class="setting-item__header-right">
            <slot></slot>
        </div>
    </div>
</template>
<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    desc: {
        type: String,
        default: '',
    },
    isCustom: {
        type: Boolean,
        default: false,
    },
})
</script>
<style scoped lang="scss">
.setting-item {
    width: calc(100% - 0.4rem);
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.24rem 0;
    margin: 0 0.2rem;
    border-bottom: 0.01rem solid rgba(255, 255, 255, 0.1);

    &.custom {
        justify-content: center;
        align-items: center;
    }

    .setting-item__header-left {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.1rem;

        .setting-item__header-title {
            font-weight: 400;
            font-size: 0.18rem;
            line-height: 100%;
            letter-spacing: 0%;
        }

        .setting-item__header-desc {
            font-weight: 400;
            font-size: 0.14rem;
            line-height: 100%;
            letter-spacing: 0%;
            color: rgba(255, 255, 255, 0.6);
        }
    }

    .setting-item__header-right {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
