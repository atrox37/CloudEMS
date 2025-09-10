<template>
  <div class="card" :class="{ 'card--bg-color': bgColor }">
    <div class="card__container">
      <div class="card__left">
        <div class="card__left-icon">
          <img :src="iconUrl" class="card__left-iconImg" />
        </div>
      </div>
      <div class="card__right">
        <div class="card__right-top">
          <div class="card__right-title">{{ props.title }}</div>
        </div>
        <div class="card__right-bottom">
          <span class="card__right-value">
            {{ props.value }}
            <span v-if="props.unit" class="card__right-unit">&nbsp;{{ props.unit }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  title: string
  value: string | number
  unit?: string
  iconUrl: string
  bgColor?: string
}>(), {
  title: '',
  value: '',
  iconUrl: '',
})

</script>

<style lang="scss" scoped>
.card {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;

  &.card--bg-color {
    background-color: v-bind(bgColor);
    border: 0.01rem solid;

    border-image: linear-gradient(116.72deg,
        rgba(148, 166, 197, 0.3) 2.77%,
        rgba(148, 166, 197, 0) 32.16%,
        rgba(148, 166, 197, 0.103266) 72.59%,
        rgba(148, 166, 197, 0.3) 98.99%) 1;
    backdrop-filter: blur(0.1rem);
    padding: 0.2rem;
  }

  .card__container {
    display: flex;

    .card__left {
      display: flex;
      align-items: center;
      margin-right: 0.23rem;

      .card__left-icon {
        width: 0.536rem;
        height: 0.586rem;
        display: flex;
        align-items: center;
        justify-content: center;

        .card__left-iconImg {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }

    .card__right {
      height: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: rgba(255, 255, 255, 0.6);

      .card__right-top {
        .card__right-title {
          font-weight: 400;
          font-size: 0.16rem;
          line-height: 0.22rem;
        }
      }

      .card__right-bottom {
        margin-top: 0.05rem;
        height: 0.32rem;

        .card__right-value {
          font-weight: 700;
          font-size: 0.3rem;
          line-height: 0.32rem;
          color: #ffffff;

          .card__right-unit {
            font-weight: 700;
            font-size: 0.14rem;
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }
    }
  }
}
</style>
