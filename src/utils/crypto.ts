/**
 * 加密工具类
 * 提供数据加密和解密功能，防止数据被篡改
 */

import CryptoJS from 'crypto-js'

// 加密密钥 - 在实际项目中应该从环境变量获取
const SECRET_KEY = 'CloudEMS_Secret_Key_2024'

/**
 * 加密数据
 * @param data 要加密的数据
 * @returns 加密后的字符串
 */
export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data)
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('数据加密失败:', error)
    throw new Error('数据加密失败')
  }
}

/**
 * 解密数据
 * @param encryptedData 加密的数据字符串
 * @returns 解密后的原始数据
 */
export const decryptData = <T = any>(encryptedData: string): T | null => {
  try {
    if (!encryptedData) {
      return null
    }
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!jsonString) {
      console.warn('解密失败，可能是密钥错误或数据损坏')
      return null
    }
    
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('数据解密失败:', error)
    return null
  }
}

/**
 * 验证数据完整性
 * @param data 原始数据
 * @param encryptedData 加密后的数据
 * @returns 是否验证通过
 */
export const verifyDataIntegrity = (data: any, encryptedData: string): boolean => {
  try {
    const decryptedData = decryptData(encryptedData)
    if (!decryptedData) {
      return false
    }
    
    // 深度比较对象
    return JSON.stringify(data) === JSON.stringify(decryptedData)
  } catch (error) {
    console.error('数据完整性验证失败:', error)
    return false
  }
}

/**
 * 生成数据哈希值（用于验证数据是否被篡改）
 * @param data 要生成哈希的数据
 * @returns 哈希值
 */
export const generateHash = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data)
    return CryptoJS.MD5(jsonString).toString()
  } catch (error) {
    console.error('生成哈希失败:', error)
    throw new Error('生成哈希失败')
  }
}

/**
 * 验证哈希值
 * @param data 原始数据
 * @param hash 要验证的哈希值
 * @returns 是否匹配
 */
export const verifyHash = (data: any, hash: string): boolean => {
  try {
    const generatedHash = generateHash(data)
    return generatedHash === hash
  } catch (error) {
    console.error('哈希验证失败:', error)
    return false
  }
}
