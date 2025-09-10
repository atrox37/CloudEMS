<template>
  <div class="help-and-documentation">
    <HeaderCard
      title="Help & Documentation"
      desc="Get help and access documentation for the platform"
    ></HeaderCard>
    <div class="help-and-documentation__body">
      <SettingCard title="Quick Start Guide" :icon="guideIcon">
        <SettingItem
          title="Getting Started with Your Dashboard"
          desc="Learn how to navigate and use the main dashboard"
        >
          <img :src="shareIcon" style="margin-right: 2.04rem" />
        </SettingItem>
        <SettingItem
          title="Setting Up Your First Station"
          desc="Step-by-step guide to configure a new energy station"
        >
          <img :src="shareIcon" style="margin-right: 2.04rem" />
        </SettingItem>
        <SettingItem
          title="Understanding Energy Flow Charts"
          desc="How to read and interpret energy flow visualizations"
        >
          <img :src="shareIcon" style="margin-right: 2.04rem" />
        </SettingItem>
        <SettingItem
          title="Managing Storage Systems"
          desc="Best practices for battery mansocment and ooumization"
        >
          <img :src="shareIcon" style="margin-right: 2.04rem" />
        </SettingItem>
      </SettingCard>
      <!-- <SettingCard title="Video Tutorials" :icon="videoIcon">
        <div class="video-list">
          <VideoCard
            v-for="item in videoList"
            :key="item.title"
            :title="item.title"
            :desc="item.desc"
            :icon="item.icon"
            style="width: calc(50% - 0.1rem)"
          />
        </div>
      </SettingCard> -->
      <SettingCard title="Frequently Asked Questions" :icon="questionIcon">
        <el-collapse v-model="activeNames" @change="handleChange">
          <SettingItem custom v-for="item in questionList" :key="item.id">
            <template #custom>
              <el-collapse-item :title="item.title" :name="item.id">
                <div>
                  {{ item.desc }}
                </div>
              </el-collapse-item>
            </template>
          </SettingItem>
        </el-collapse>
      </SettingCard>
      <SettingCard title="Need More Help?" :icon="helpIcon">
        <div class="help-list">
          <HelpCard
            v-for="item in helpList"
            :key="item.title"
            :icon="item.icon"
            :title="item.title"
            :desc="item.desc"
            style="width: calc(50% - 0.1rem); height: 2.25rem"
          />
        </div>
      </SettingCard>
      <SettingCard title="System Information">
        <SettingItem custom>
          <template #custom>
            <div class="system-info">
              <div class="system-info__item">
                <div class="info-title">Platform Version</div>
                <div class="info-value">2.4.1</div>
              </div>
              <div class="system-info__item">
                <div class="info-title">Last Updated</div>
                <div class="info-value">2025-08-29</div>
              </div>
            </div>
          </template>
        </SettingItem>
        <SettingItem custom>
          <template #custom>
            <div class="system-info">
              <div class="system-info__item">
                <div class="info-title">License lype</div>
                <div class="info-value">Enterprise</div>
              </div>
              <div class="system-info__item">
                <div class="info-title">Support Plan</div>
                <div class="info-value">Premium 24/7</div>
              </div>
            </div>
          </template>
        </SettingItem>
      </SettingCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderCard from '@/components/card/headerCard.vue'
import VideoCard from './components/VideoCard.vue'
import HelpCard from './components/helpCard.vue'

import shareIcon from '@/assets/icons/button-share.svg'
import guideIcon from '@/assets/icons/header-guide.svg'
import videoIcon from '@/assets/icons/header-video.svg'
import questionIcon from '@/assets/icons/header-q&a.svg'
import helpIcon from '@/assets/icons/header-help.svg'

import video1 from '@/assets/icons/default-video1.svg'
import video2 from '@/assets/icons/default-video2.svg'
import video3 from '@/assets/icons/default-video3.svg'
import video4 from '@/assets/icons/default-video4.svg'

import mailIcon from '@/assets/icons/card-mail.svg'
import phoneIcon from '@/assets/icons/card-phone.svg'
import chatIcon from '@/assets/icons/card-chat.svg'

const activeNames = ref([])

const handleChange = (val: string[]) => {
  console.log(val)
}

const questionList = ref([
  {
    id: 1,
    title: 'How do I reset my password?',
    desc: 'Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to; Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.',
  },
  {
    id: 2,
    title: 'How do I reset my password?',
    desc: 'Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to; Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.',
  },
  {
    id: 3,
    title: 'How do I reset my password?',
    desc: 'Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to; Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.',
  },
  {
    id: 4,
    title: 'How do I reset my password?',
    desc: 'Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to; Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.',
  },
  {
    id: 5,
    title: 'How do I reset my password?',
    desc: 'Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to; Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.',
  },
])
const helpList = ref([
  {
    icon: mailIcon,
    title: 'Email Support',
    desc: 'support@voltageenergy.com',
  },
  {
    icon: phoneIcon,
    title: 'Phone Support',
    desc: '+1 （555） 123-4567',
  },

  // {
  //   icon: chatIcon,
  //   title: 'Chat Support',
  //   desc: 'Available 247',
  // },
])
const videoList = ref([
  {
    title: 'Getting Started with Your Dashboard',
    desc: 'Learn how to navigate and use the main dashboard',
    icon: video1,
  },
  {
    title: 'Setting Up Your First Station',
    desc: 'Step-by-step guide to configure a new energy station',
    icon: video2,
  },
  {
    title: 'Understanding Energy Flow Charts',
    desc: 'How to read and interpret energy flow visualizations',
    icon: video3,
  },
  {
    title: 'Managing Storage Systems',
    desc: 'Best practices for battery management and optimization',
    icon: video4,
  },
])
</script>

<style scoped lang="scss">
.help-and-documentation {
  height: 100%;
  width: 100%;

  .help-and-documentation__body {
    width: 100%;
    height: calc(100% - 1.22rem);
    overflow-y: auto;

    & > div {
      margin-bottom: 0.2rem;
    }

    img {
      width: 0.24rem;
      height: 0.24rem;
      object-fit: contain;
    }

    .video-list {
      width: 100%;
      padding: 0.2rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.2rem;
    }

    .help-list {
      width: 100%;
      padding: 0.2rem 0;
      display: flex;
      gap: 0.2rem;
    }

    .system-info {
      width: 100%;
      display: flex;
      gap: 0.2rem;
    }

    .system-info__item {
      width: calc(50% - 0.1rem);
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .info-title {
      font-size: 0.14rem;
      line-height: 100%;
      color: rgba(255, 255, 255, 0.6);
    }

    .info-value {
      font-size: 0.18rem;
      line-height: 100%;
      color: #ffffff;
    }
  }

  :deep(.el-collapse-item) {
    width: 100%;
  }

  :deep(.el-collapse-item__header) {
    border: none;
    box-shadow: none;
    backdrop-filter: blur(0);
    background-color: transparent;
    height: 0.22rem !important;
  }

  :deep(.el-collapse-item__content) {
    background-color: transparent;
    font-size: 0.18rem;
    line-height: 100%;
    letter-spacing: 0%;
    color: rgba(255, 255, 255, 0.6);
  }

  :deep(.el-collapse .el-collapse-item__wrap) {
    background-color: transparent;
  }
  :deep(.el-icon.el-collapse-item__arrow) {
    margin-right: 2.04rem !important;
  }
}
</style>
