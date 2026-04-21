<template>
  <div class="video-card">
    <div class="video-card__content">
      <img :src="icon" />
    </div>
    <div class="video-card__desc">
      <div class="video-card__desc-title">{{ title }}</div>
      <div class="video-card__desc-desc">{{ desc }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '',
  },
  desc: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
})
</script>

<style scoped lang="scss">
.video-card {
  width: 100%;

  .video-card__content {
    width: 100%;
    height: 2.25rem;
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
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 0.48rem;
      height: 0.48rem;
      object-fit: contain;
    }
  }

  .video-card__desc {
    padding: 0.2rem;

    .video-card__desc-title {
      font-size: 0.18rem;
      line-height: 100%;
      letter-spacing: 0%;
      margin-bottom: 0.05rem;
    }
    .video-card__desc-desc {
      font-size: 0.14rem;
      line-height: 100%;
      letter-spacing: 0%;
      color: var(--vt-white-60);
    }
  }
}
</style>
