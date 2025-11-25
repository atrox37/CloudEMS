<template>
  <div class="ai-assistant">
    <div
      class="ai-assistant__icon"
      :style="iconStyle"
      @mousedown="startDragIcon"
      @touchstart.prevent="startDragIcon"
      title="AI Assistant"
    >
      <img src="@/assets/icons/ai_assistant.svg" alt="AI Assistant" />
    </div>

    <transition name="dialog-fade">
      <div
        v-show="isDialogVisible"
        class="ai-assistant__dialog"
        :style="dialogPositionStyle"
      >
        <div
          class="ai-assistant__dialog-header"
          :class="{ 'ai-assistant__dialog-header--resizable': quadrant === 'tl' || quadrant === 'tr' }"
          @mousedown.stop="onHeaderMouseDown"
          @touchstart.stop.prevent="onHeaderMouseDown"
        >
          <img src="@/assets/icons/ai_logo.svg" class="ai-assistant__dialog-logo" />
          <img
            src="@/assets/icons/ai-rectangle.svg"
            class="ai-assistant__dialog-close"
            @click="closeDialog"
          />
        </div>

        <div ref="messageListRef" class="ai-assistant__message-list">
          <div
            v-for="message in messages"
            :key="message.id"
            class="ai-assistant__message-item"
            :class="`ai-assistant__message-item--${message.type}`"
          >
            <div class="ai-assistant__message-wrapper">
              <div class="ai-assistant__message-bubble">
                <div class="ai-assistant__message-content">{{ message.content }}</div>
              </div>
            </div>
          </div>

          <div v-if="isAILoading" class="ai-assistant__message-item ai-assistant__message-item--ai">
            <div class="ai-assistant__message-wrapper">
              <div class="ai-assistant__message-bubble">
                <div class="ai-assistant__loading">
                  <span>Loading</span>
                  <span class="ai-assistant__loading-dot">.</span>
                  <span class="ai-assistant__loading-dot">.</span>
                  <span class="ai-assistant__loading-dot">.</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="messages.length === 0 && !isAILoading" class="ai-assistant__empty-state">
            <p>Hello! I'm your AI Assistant</p>
            <p>How can I help you today?</p>
          </div>
        </div>

        <div class="ai-assistant__input-area">
          <textarea
            v-model="messageInput"
            class="ai-assistant__input-textarea"
            placeholder="Type a message..."
            rows="1"
            :disabled="isAILoading"
            @keydown="handleKeydown"
            @input="autoResize"
          ></textarea>
          <el-button 
            class="ai-assistant__send-button" 
            :disabled="!isAILoading && !messageInput.trim()"
            @click="isAILoading ? cancelRequest() : sendMessage()" 
            :title="isAILoading ? 'Cancel' : 'Send'"
          >
            <template v-if="!isAILoading">Send</template>
            <template v-else>
              <svg class="ai-assistant__pause-icon" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            </template>
          </el-button>
        </div>

        <div
          v-if="quadrant === 'bl' || quadrant === 'br'"
          class="ai-assistant__resize-handle ai-assistant__resize-handle--bottom"
          @mousedown.stop="startResize"
          @touchstart.stop.prevent="startResize"
        ></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
/**
 * AI助手组件
 * 功能特性：
 * 1. 可拖动的悬浮图标，支持鼠标和触摸操作
 * 2. 智能定位对话框，根据图标位置自动调整
 * 3. 可调整对话框高度（仅增加不减少）
 * 4. 消息发送和接收，带加载状态
 * 5. 响应式布局，基于rem单位
 */
import { ref, nextTick, computed, onMounted, onBeforeUnmount } from 'vue'
import { getCurrentFontSize } from '@/utils/responsive'
import { getAIAssistantAnswer } from '@/api/common'

interface Message {
  id: number
  content: string
  type: 'user' | 'ai'
}

type Quadrant = 'tl' | 'tr' | 'bl' | 'br'

// 常量定义
const ICON_REM = 0.6
const getIconSize = () => getCurrentFontSize() * ICON_REM
const PADDING = 16
const GAP = 10
const MIN_DIALOG_HEIGHT = 260

// 状态管理
const isDialogVisible = ref(false)
const isAILoading = ref(false)
const messageInput = ref('')
const messages = ref<Message[]>([])
const messageListRef = ref<HTMLElement | null>(null)
const abortController = ref<AbortController | null>(null)

// 图标位置
const iconX = ref(0)
const iconY = ref(0)

// 对话框高度
const dialogHeight = ref(MIN_DIALOG_HEIGHT)

// 拖动图标相关
const isDraggingIcon = ref(false)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
const hasMoved = ref(false)

// 调整高度相关
const isResizing = ref(false)
const resizeStartY = ref(0)
const resizeStartHeight = ref(0)
const resizeInitialTop = ref(0)
const resizeInitialBottom = ref(0)
const dialogTopOverride = ref<number | null>(null)
type ResizeMode = 'top' | 'bottom'
const resizeMode = ref<ResizeMode>('top')

// 初始化图标位置（右下角）
onMounted(() => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const size = getIconSize()
  iconX.value = vw - size - PADDING
  iconY.value = vh - size - PADDING
})

onBeforeUnmount(() => {
  removeGlobalDragListeners()
})

// 图标样式
const iconStyle = computed(() => ({
  position: 'fixed' as const,
  left: iconX.value + 'px',
  top: iconY.value + 'px',
  transition: isDraggingIcon.value ? 'none' : undefined,
  transform: isDraggingIcon.value ? 'none' : undefined
}))

// 计算图标所在象限
const quadrant = computed<Quadrant>(() => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const centerX = vw / 2
  const centerY = vh / 2
  const size = getIconSize()
  const iconCenterX = iconX.value + size / 2
  const iconCenterY = iconY.value + size / 2

  if (iconCenterX < centerX && iconCenterY < centerY) return 'tl'
  if (iconCenterX >= centerX && iconCenterY < centerY) return 'tr'
  if (iconCenterX < centerX && iconCenterY >= centerY) return 'bl'
  return 'br'
})

// 计算初始对话框高度
const calculateInitialDialogHeight = () => {
  const vh = window.innerHeight
  const iconTop = iconY.value
  const size = getIconSize()

  let h = 0
  switch (quadrant.value) {
    case 'tl':
    case 'tr':
      h = vh - iconTop
      break
    case 'bl':
    case 'br':
      h = iconTop + size
      break
  }

  return Math.max(MIN_DIALOG_HEIGHT, h)
}

// 对话框位置样式
const dialogPositionStyle = computed(() => {
  const vw = window.innerWidth
  const dialogWidth = Math.min(vw * 0.9, 4 * getCurrentFontSize())
  const h = dialogHeight.value
  const iconLeft = iconX.value
  const iconTop = iconY.value
  const size = getIconSize()
  const iconRight = iconLeft + size
  const iconBottom = iconTop + size

  let top = 0
  let left = 0

  // 垂直定位
  if (dialogTopOverride.value !== null) {
    top = dialogTopOverride.value
  } else if (quadrant.value === 'tl' || quadrant.value === 'tr') {
    top = iconTop
  } else {
    top = iconBottom - h
  }

  // 水平定位
  const spaceRight = vw - PADDING - (iconRight + GAP)
  const spaceLeft = (iconLeft - GAP) - PADDING
  const preferRight = quadrant.value === 'tl' || quadrant.value === 'bl'
  const canPlaceRight = spaceRight >= dialogWidth
  const canPlaceLeft = spaceLeft >= dialogWidth

  if ((preferRight && canPlaceRight) || (!preferRight && !canPlaceLeft && canPlaceRight)) {
    left = iconRight + GAP
  } else if ((!preferRight && canPlaceLeft) || (preferRight && !canPlaceRight && canPlaceLeft)) {
    left = iconLeft - dialogWidth - GAP
  } else {
    left = Math.max(PADDING, Math.min(iconRight + GAP, vw - dialogWidth - PADDING))
  }

  return {
    position: 'fixed' as const,
    left: `${left}px`,
    top: `${top}px`,
    height: `${h / getCurrentFontSize()}rem`
  }
})

// 切换对话框显示
const toggleDialog = () => {
  if (!isDialogVisible.value) {
    dialogHeight.value = calculateInitialDialogHeight()
    dialogTopOverride.value = null
  }
  isDialogVisible.value = !isDialogVisible.value

  if (isDialogVisible.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 关闭对话框
const closeDialog = () => {
  isDialogVisible.value = false
}

// 发送消息
const sendMessage = async () => {
  const content = messageInput.value.trim()
  if (!content || isAILoading.value) return

  const newMessage: Message = {
    id: Date.now(),
    content,
    type: 'user'
  }

  messages.value.push(newMessage)
  messageInput.value = ''

  nextTick(() => {
    const textarea = document.querySelector(
      '.ai-assistant__input-textarea'
    ) as HTMLTextAreaElement | null
    if (textarea) {
      textarea.style.height = 'auto'
    }
    scrollToBottom()
  })

  isAILoading.value = true
  abortController.value = new AbortController()

  try {
    const response = await getAIAssistantAnswer(content, abortController.value.signal)
    
    // 检查请求是否已被取消
    if (abortController.value?.signal.aborted) {
      return
    }
    
    if (response.code === 200) {
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: response.data.answer,
        type: 'ai'
      }
      messages.value.push(aiMessage)
      
      nextTick(() => {
        scrollToBottom()
      })
    } else {
      // 再次检查是否被取消，避免在响应期间取消导致错误提示
      if (abortController.value?.signal.aborted) {
        return
      }
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: 'Request failed. Please try again later.',
        type: 'ai'
      }
      messages.value.push(errorMessage)
      
      nextTick(() => {
        scrollToBottom()
      })
    }
  } catch (error: any) {
    // 如果是主动取消的请求，不显示任何错误提示
    if (abortController.value?.signal.aborted || error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      console.log('请求已主动取消')
      return
    }
    
    console.error('AI助手请求失败:', error)
    const errorMessage: Message = {
      id: Date.now() + 1,
      content: 'Request failed. Please try again later.',
      type: 'ai'
    }
    messages.value.push(errorMessage)
    
    nextTick(() => {
      scrollToBottom()
    })
  } finally {
    isAILoading.value = false
    abortController.value = null
  }
}

// 取消请求
const cancelRequest = () => {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
    isAILoading.value = false
    
    // 添加暂停提示消息
    const cancelMessage: Message = {
      id: Date.now() + 1,
      content: 'Request canceled by user.',
      type: 'ai'
    }
    messages.value.push(cancelMessage)
    
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 自动调整输入框高度
const autoResize = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  textarea.style.height = 'auto'
  const newHeight = Math.min(textarea.scrollHeight, 150)
  textarea.style.height = `${newHeight}px`
}

// 滚动到底部
const scrollToBottom = () => {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 获取触摸或鼠标位置
const getPoint = (e: MouseEvent | TouchEvent) => {
  if ('touches' in e) {
    return e.touches[0]
  }
  return e
}

// 开始拖动图标
const startDragIcon = (e: MouseEvent | TouchEvent) => {
  e.preventDefault()
  const point = getPoint(e)
  isDraggingIcon.value = true
  hasMoved.value = false
  dragOffsetX.value = point.clientX - iconX.value
  dragOffsetY.value = point.clientY - iconY.value
  addGlobalDragListeners()
}

// 全局移动事件
const onMouseMove = (e: MouseEvent | TouchEvent) => {
  if (isDraggingIcon.value) {
    e.preventDefault()
    const point = getPoint(e)

    hasMoved.value = true
    if (isDialogVisible.value) {
      isDialogVisible.value = false
    }

    const vw = window.innerWidth
    const vh = window.innerHeight
    const size = getIconSize()
    let x = point.clientX - dragOffsetX.value
    let y = point.clientY - dragOffsetY.value

    x = Math.min(Math.max(PADDING, x), vw - size - PADDING)
    y = Math.min(Math.max(PADDING, y), vh - size - PADDING)

    iconX.value = x
    iconY.value = y
  }

  if (isResizing.value) {
    e.preventDefault()
    const point = getPoint(e)
    const vh = window.innerHeight

    if (resizeMode.value === 'top') {
      const bottom = vh
      let newTop = point.clientY
      newTop = Math.max(0, Math.min(bottom - MIN_DIALOG_HEIGHT, newTop))
      newTop = Math.min(newTop, resizeInitialTop.value)
      dialogTopOverride.value = newTop
      dialogHeight.value = bottom - newTop
    } else {
      const topAnchor = 0
      let newBottom = point.clientY
      newBottom = Math.max(topAnchor + MIN_DIALOG_HEIGHT, Math.min(vh, newBottom))
      newBottom = Math.max(newBottom, resizeInitialBottom.value)
      dialogTopOverride.value = topAnchor
      dialogHeight.value = newBottom - topAnchor
    }
  }
}

// 停止拖动
const stopDragAndResize = () => {
  const wasDraggingIcon = isDraggingIcon.value
  const hadMoved = hasMoved.value
  
  isDraggingIcon.value = false
  isResizing.value = false
  removeGlobalDragListeners()
  
  // 如果是拖动图标结束，且没有移动，则触发点击（打开/关闭对话框）
  if (wasDraggingIcon && !hadMoved) {
    toggleDialog()
  }
}

// 添加全局监听
const addGlobalDragListeners = () => {
  document.addEventListener('mousemove', onMouseMove, { passive: false })
  document.addEventListener('mouseup', stopDragAndResize)
  document.addEventListener('touchmove', onMouseMove, { passive: false })
  document.addEventListener('touchend', stopDragAndResize)
}

// 移除全局监听
const removeGlobalDragListeners = () => {
  document.removeEventListener('mousemove', onMouseMove as any)
  document.removeEventListener('mouseup', stopDragAndResize as any)
  document.removeEventListener('touchmove', onMouseMove as any)
  document.removeEventListener('touchend', stopDragAndResize as any)
}

// 开始调整高度
const startResize = (e: MouseEvent | TouchEvent) => {
  const point = getPoint(e)
  isResizing.value = true
  resizeStartY.value = point.clientY
  resizeStartHeight.value = dialogHeight.value
  const vh = window.innerHeight
  if (quadrant.value === 'tl' || quadrant.value === 'tr') {
    resizeMode.value = 'top'
    const initialTop = iconY.value
    const bottom = vh
    dialogTopOverride.value = Math.max(0, Math.min(bottom - MIN_DIALOG_HEIGHT, initialTop))
    resizeInitialTop.value = dialogTopOverride.value
    resizeInitialBottom.value = bottom
  } else {
    resizeMode.value = 'bottom'
    dialogTopOverride.value = 0
    resizeInitialTop.value = 0
    resizeInitialBottom.value = dialogHeight.value
  }
  addGlobalDragListeners()
}

// 处理头部鼠标按下（用于顶部调整）
const onHeaderMouseDown = (e: MouseEvent | TouchEvent) => {
  if (!(quadrant.value === 'tl' || quadrant.value === 'tr')) return

  const target = 'touches' in e ? (e.touches[0].target as EventTarget | null) : (e.target as EventTarget | null)
  if (target && target instanceof HTMLElement) {
    if (target.closest('.ai-assistant__dialog-close')) return
  }
  startResize(e)
}
</script>

<style lang="scss" scoped>
.ai-assistant {
  .ai-assistant__icon {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #76aeff 0%, #6c97e2 100%);
    box-shadow: 0 0.04rem 0.12rem rgba(47, 131, 248, 0.4);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 9999;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0.06rem 0.16rem rgba(47, 131, 248, 0.5);
    }

    &:active {
      transform: scale(0.95);
    }

    img {
      width: 0.55rem;
      height: 0.55rem;
      object-fit: contain;
      object-position: center;
    }
  }

  .ai-assistant__dialog {
    width: 90vw;
    max-width: 4rem;
    background: #ffffff;
    border-radius: 0.16rem;
    box-shadow: 0 0.08rem 0.32rem rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 9998;
    box-sizing: border-box;

    @media (min-width: 7.68rem) {
      width: 4rem;
    }
  }

  .ai-assistant__dialog-header {
    padding: 0.12rem 0.16rem;
    background: linear-gradient(90deg, #041428 0%, #02294e 42%, #013768 78%, #003c71 100%);
    height: 0.4rem;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .ai-assistant__dialog-header--resizable {
    cursor: ns-resize;
  }

  .ai-assistant__dialog-logo {
    height: 0.12rem;
    object-fit: contain;
    object-position: center;
  }

  .ai-assistant__dialog-close {
    width: 0.2rem;
    height: 0.2rem;
    cursor: pointer;
    transition: all 0.2s ease;
    object-fit: contain;
    object-position: center;

    &:hover {
      transform: rotate(90deg);
    }
  }

  .ai-assistant__message-list {
    flex: 1;
    padding: 0.2rem;
    overflow-y: auto;
    background: #f5f7fa;
    display: flex;
    flex-direction: column;
    gap: 0.16rem;

    &::-webkit-scrollbar {
      width: 0.06rem;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: #d0d7de;
      border-radius: 0.03rem;

      &:hover {
        background: #b8c0c8;
      }
    }
  }

  .ai-assistant__message-item {
    display: flex;
    width: 100%;

    &.ai-assistant__message-item--user {
      justify-content: flex-end;

      .ai-assistant__message-wrapper {
        align-items: flex-end;
      }

      .ai-assistant__message-bubble {
        border-radius: 0.15rem 0;
        border: 0.03rem solid transparent;
        background:
          linear-gradient(#ffffff, #ffffff) padding-box,
          linear-gradient(90deg, #ff6900 0%, #ffffff 100%) border-box;
      }
    }

    &.ai-assistant__message-item--ai {
      justify-content: flex-start;

      .ai-assistant__message-wrapper {
        align-items: flex-start;
      }

      .ai-assistant__message-bubble {
        border-radius:  0 0.15rem;
        border: 0.03rem solid transparent;
        background:
          linear-gradient(#ffffff, #ffffff) padding-box,
          linear-gradient(-90deg, #ff6900 0%, #ffffff 100%) border-box;
      }
    }
  }

  .ai-assistant__message-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 75%;
  }

  .ai-assistant__message-bubble {
    padding: 0.09rem 0.15rem;
    border-radius: 0.12rem;
    word-wrap: break-word;
    word-break: break-word;
  }

  .ai-assistant__message-content {
    font-weight: 700;
    font-size: 0.12rem;
    line-height: 1.4;
    color: rgba(4, 20, 40, 1);
    white-space: pre-wrap;
  }

  .ai-assistant__loading {
    font-weight: 700;
    font-size: 0.12rem;
    color: rgba(4, 20, 40, 1);
    display: flex;
    align-items: center;
  }

  .ai-assistant__loading-dot {
    animation: loading-dot-fade 1.4s infinite;
    opacity: 0;
    
    &:nth-child(2) {
      animation-delay: 0s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(4) {
      animation-delay: 0.4s;
    }
  }

  @keyframes loading-dot-fade {
    0%, 20% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .ai-assistant__empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    text-align: center;

    p {
      margin: 0.08rem 0;
      font-size: 0.14rem;
    }
  }

  .ai-assistant__input-area {
    padding: 0.16rem;
    background: #ffffff;
    border-top: 0.01rem solid #e4e7ed;
    display: flex;
    gap: 0.12rem;
    flex-shrink: 0;
  }

  .ai-assistant__input-textarea {
    flex: 1;
    padding: 0.088rem 0.12rem;
    border: 0.01rem solid rgba(0, 60, 113, 1);
    border-radius: 0.16rem;
    font-size: 0.12rem;
    line-height: 1.2;
    resize: none;
    outline: none;
    transition: border-color 0.3s ease;
    font-family: inherit;
    height: 0.32rem;
    min-height: 0.32rem;
    max-height: 1.5rem;
    overflow-y: hidden;

    &:focus {
      border-color: #4691fb;
    }

    &::placeholder {
      color: #c0c4cc;
    }

    &:disabled {
      background: #f5f7fa;
      cursor: not-allowed;
    }
  }

  .ai-assistant__send-button {
    height: 0.32rem !important;
    width: 0.82rem !important;
    padding: 0 !important;
    color: #ffffff !important;
    line-height: 1 !important;
    font-weight: 700 !important;
    border: none !important;
    border-radius: 0.115rem !important;
    font-size: 0.14rem !important;
    cursor: pointer !important;
    align-self: flex-end;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background-color: rgba(0, 60, 113, 1) !important;
    transition: all 0.3s ease !important;

    &:hover:not(:disabled) {
      opacity: 0.9 !important;
      box-shadow: 0 0.04rem 0.12rem rgba(70, 145, 251, 0.4) !important;
      background-color: rgba(0, 60, 113, 1) !important;
    }

    &:active:not(:disabled) {
      opacity: 0.8 !important;
    }

    &:disabled,
    &.is-disabled {
      opacity: 0.5 !important;
      cursor: not-allowed !important;
      background-color: rgba(0, 60, 113, 1) !important;
    }

    &.is-loading {
      opacity: 1 !important;
    }

    :deep(.el-icon) {
      color: #ffffff !important;
    }
  }

  .ai-assistant__pause-icon {
    width: 0.16rem;
    height: 0.16rem;
    color: #ffffff;
  }

  .ai-assistant__resize-handle {
    height: 0.12rem;
    cursor: ns-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    background: transparent;

    &::before {
      display: none;
    }

    &--top {
      order: -1;
    }
  }
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
  transform: translateY(0.2rem) scale(0.95);
}
</style>
