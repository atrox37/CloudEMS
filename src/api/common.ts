import Request from '@/utils/request'
import type { ApiResponse } from '@/utils/request'

/**
 * 获取AI助手回答
 * 使用skipCancel配置避免影响全局loading状态
 */
export const getAIAssistantAnswer = (params: string): Promise<ApiResponse<{question:string,answer:string}>> => {
  return Request.post('/user-app/common/kb/answer', {question: params}, {skipCancel: true})
}   