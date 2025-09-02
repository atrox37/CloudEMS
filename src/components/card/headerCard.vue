<template>
    <div class="header-card">
      <div class="header-card__left">
        <div class="header-card__left-title">{{ title }}</div>
        <div class="header-card__left-desc">{{ desc }}</div>
      </div>
      <div class="header-card__right">
        <slot name="control"></slot>
      </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        default: '',
    },
})
</script>
<style scoped lang="scss">
  .header-card {
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

    .header-card__left {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      gap: 0.2rem;

      .header-card__left-title {
        font-size: 0.26rem;
        line-height: 0.26rem;
        font-weight: 700;
        color: #fff;
      }

      .header-card__left-desc {
        font-size: 0.16rem;
        line-height: 100%;
        letter-spacing: 0%;
        vertical-align: middle;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .header-card__right {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-right: 0.1rem;
    }
  }
</style>
