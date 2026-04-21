import Request from '@/utils/request'
import type { ApiResponse } from '@/utils/request'

/**
 * AI助手响应数据结构
 */
interface AIAssistantResponseData {
  message: string
  response: string
}

/**
 * 获取AI助手回答
 * 使用skipCancel配置避免影响全局loading状态
 * 设置超时时间为1分钟（60000ms）
 * @param params 问题内容
 * @param signal 可选的AbortSignal，用于取消请求
 */
export const getAIAssistantAnswer = (
  params: string,
  signal?: AbortSignal,
): Promise<ApiResponse<AIAssistantResponseData>> => {
  return Request.post(
    '/user-app/agent/chat',
    { message: params },
    {
      skipCancel: true,
      signal,
      timeout: 60000, // 设置超时时间为1分钟（60000ms）
    },
  )
}
