<template>
  <div class="help-card">
    <img :src="icon" alt="" />
    <div class="help-card__title">{{ title }}</div>
    <div class="help-card__desc">{{ desc }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  desc: {
    type: String,
    default: '',
  },
})
</script>

<style scoped lang="scss">
.help-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--vt-bg-input);
  border: 0.01rem solid;

  border-image: linear-gradient(
      117.64deg,
      var(--vt-border-color) 2.73%,
      rgba(148, 166, 197, 0) 31.73%,
      rgba(148, 166, 197, 0.103266) 71.62%,
      var(--vt-border-color) 97.67%
    )
    1;

  backdrop-filter: blur(0.1rem);
  img {
    width: 0.72rem;
    height: 0.72rem;
    object-fit: contain;
    margin-bottom: 0.24rem;
  }

  .help-card__title {
    font-weight: 700;
    font-size: 0.2rem;
    line-height: 100%;
    color: var(--vt-text-primary);
    margin-bottom: 0.1rem;
  }

  .help-card__desc {
    font-size: 0.16rem;
    line-height: 100%;
    color: var(--vt-white-60);
  }
}
</style>
