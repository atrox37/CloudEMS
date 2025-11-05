<script setup lang="ts">
/**
 * AI助手全局组件
 * 功能：
 * 1. 固定在屏幕右下角的助手图标
 * 2. 点击图标显示/隐藏对话框
 * 3. 支持多行文本输入，Shift+Enter换行，Enter发送
 * 4. 消息显示在对话区域右侧（用户消息样式）
 */

// 消息类型定义
interface Message {
  id: number
  content: string
  timestamp: string
  type: 'user' | 'ai'
}

// 响应式数据
const isDialogVisible = ref(false) // 对话框显示状态
const messageInput = ref('') // 输入框内容
const messages = ref<Message[]>([]) // 消息列表
const messageListRef = ref<HTMLElement | null>(null) // 消息列表DOM引用

// 切换对话框显示状态
const toggleDialog = () => {
  isDialogVisible.value = !isDialogVisible.value
}

// 关闭对话框
const closeDialog = () => {
  isDialogVisible.value = false
}

// 发送消息
const sendMessage = () => {
  const content = messageInput.value.trim()
  if (!content) return

  // 创建新消息
  const newMessage: Message = {
    id: Date.now(),
    content,
    timestamp: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    type: 'user',
  }

  // 添加到消息列表
  messages.value.push(newMessage)

  // 清空输入框
  messageInput.value = ''

  // 重置输入框高度
  nextTick(() => {
    const textarea = document.querySelector('.ai-assistant__input-textarea') as HTMLTextAreaElement
    if (textarea) {
      textarea.style.height = 'auto'
    }
    scrollToBottom()
  })
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  // Enter发送，Shift+Enter换行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 自动调整输入框高度
const autoResize = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  // 重置高度以获取正确的scrollHeight
  textarea.style.height = 'auto'
  // 设置新高度，最大不超过150px
  const newHeight = Math.min(textarea.scrollHeight, 150)
  textarea.style.height = `${newHeight}px`
}

// 滚动到底部
const scrollToBottom = () => {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}
</script>

<template>
  <div class="ai-assistant">
    <!-- AI助手图标按钮 -->
    <div class="ai-assistant__icon" @click="toggleDialog" title="AI Assistant">
      <img src="@/assets/icons/ai_assistant.svg" alt="AI Assistant" />
    </div>

    <!-- 对话框 -->
    <transition name="dialog-fade">
      <div v-show="isDialogVisible" class="ai-assistant__dialog">
        <!-- 对话框头部 -->
        <div class="ai-assistant__dialog-header">
          <span class="ai-assistant__dialog-title">AI Assistant</span>
          <button class="ai-assistant__dialog-close" @click="closeDialog" title="Close">
            ×
          </button>
        </div>

        <!-- 消息显示区域 -->
        <div ref="messageListRef" class="ai-assistant__message-list">
          <div
            v-for="message in messages"
            :key="message.id"
            class="ai-assistant__message-item"
            :class="`ai-assistant__message-item--${message.type}`"
          >
            <div class="ai-assistant__message-wrapper">
              <div class="ai-assistant__message-time">{{ message.timestamp }}</div>
              <div class="ai-assistant__message-bubble">
                <div class="ai-assistant__message-content">{{ message.content }}</div>
              </div>
            </div>
          </div>

          <!-- 空状态提示 -->
          <div v-if="messages.length === 0" class="ai-assistant__empty-state">
            <p>Hello! I'm your AI Assistant</p>
            <p>How can I help you today?</p>
          </div>
        </div>

        <!-- 消息输入区域 -->
        <div class="ai-assistant__input-area">
          <textarea
            v-model="messageInput"
            class="ai-assistant__input-textarea"
            placeholder="Type a message..."
            rows="1"
            @keydown="handleKeydown"
            @input="autoResize"
          ></textarea>
          <button class="ai-assistant__send-button" @click="sendMessage" title="Send">
            Send
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.ai-assistant {
  // 图标按钮样式
  .ai-assistant__icon {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #76aeff 0%, #2f83f8 100%);
    box-shadow: 0 4px 12px rgba(47, 131, 248, 0.4);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 9999;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(47, 131, 248, 0.5);
    }

    &:active {
      transform: scale(0.95);
    }

    img {
      width: 36px;
      height: 36px;
    }
  }

  // 对话框样式
  .ai-assistant__dialog {
    position: fixed;
    right: 20px;
    bottom: 100px;
    width: 90vw;
    max-width: 400px;
    height: 70vh;
    max-height: 600px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 9998;

    // 响应式适配
    @media (min-width: 768px) {
      width: 400px;
      height: 600px;
    }
  }

  // 对话框头部
  .ai-assistant__dialog-header {
    padding: 12px 16px;
    background: linear-gradient(135deg, #76aeff 0%, #2f83f8 100%);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .ai-assistant__dialog-title {
    font-size: 16px;
    font-weight: 600;
  }

  .ai-assistant__dialog-close {
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    font-size: 20px;
    line-height: 1;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(90deg);
    }
  }

  // 消息列表区域
  .ai-assistant__message-list {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f5f7fa;
    display: flex;
    flex-direction: column;
    gap: 16px;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #d0d7de;
      border-radius: 3px;

      &:hover {
        background: #b8c0c8;
      }
    }
  }

  // 消息项
  .ai-assistant__message-item {
    display: flex;
    width: 100%;

    // 用户消息靠右
    &.ai-assistant__message-item--user {
      justify-content: flex-end;

      .ai-assistant__message-wrapper {
        align-items: flex-end;
      }

      .ai-assistant__message-bubble {
        background: linear-gradient(135deg, #4691fb 0%, #2f83f8 100%);
        color: #ffffff;
      }
    }

    // AI消息靠左
    &.ai-assistant__message-item--ai {
      justify-content: flex-start;

      .ai-assistant__message-wrapper {
        align-items: flex-start;
      }

      .ai-assistant__message-bubble {
        background: #ffffff;
        color: #333333;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
    }
  }

  // 消息包装器
  .ai-assistant__message-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 75%;
  }

  // 消息时间戳（在气泡上方）
  .ai-assistant__message-time {
    font-size: 11px;
    margin-bottom: 4px;
    opacity: 0.6;
    color: #909399;
  }

  // 消息气泡
  .ai-assistant__message-bubble {
    padding: 12px 16px;
    border-radius: 12px;
    word-wrap: break-word;
    word-break: break-word;
  }

  .ai-assistant__message-content {
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  // 空状态
  .ai-assistant__empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    text-align: center;

    p {
      margin: 8px 0;
      font-size: 14px;
    }
  }

  // 输入区域
  .ai-assistant__input-area {
    padding: 16px;
    background: #ffffff;
    border-top: 1px solid #e4e7ed;
    display: flex;
    gap: 12px;
    flex-shrink: 0;
  }

  .ai-assistant__input-textarea {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    outline: none;
    transition: border-color 0.3s ease;
    font-family: inherit;
    min-height: 40px;
    max-height: 150px;
    overflow-y: hidden;

    &:focus {
      border-color: #4691fb;
    }

    &::placeholder {
      color: #c0c4cc;
    }
  }

  .ai-assistant__send-button {
    padding: 0 24px;
    height: 40px;
    background: linear-gradient(135deg, #4691fb 0%, #2f83f8 100%);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.3s ease, box-shadow 0.3s ease;
    white-space: nowrap;
    align-self: flex-end;

    &:hover {
      opacity: 0.9;
      box-shadow: 0 4px 12px rgba(70, 145, 251, 0.4);
    }

    &:active {
      opacity: 0.8;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// 对话框过渡动画
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>

