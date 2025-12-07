/**
 * 图片 URL 处理工具
 */

import { getBackendUrl } from "@/config/network";

/**
 * 获取完整的图片 URL
 * @param url 图片路径（可能是相对路径或完整URL）
 * @returns 完整的图片 URL
 */
export function getImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;

  // 如果已经是完整的 URL（http:// 或 https://），直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 如果是相对路径，拼接后端地址
  const backendUrl = getBackendUrl();
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${backendUrl}${cleanUrl}`;
  
  // 调试日志
  console.log('[Image URL]', { original: url, backend: backendUrl, full: fullUrl });
  
  return fullUrl;
}

/**
 * 获取头像 URL
 * @param avatarPath 头像路径
 * @returns 完整的头像 URL
 */
export function getAvatarUrl(avatarPath: string | undefined | null): string | undefined {
  return getImageUrl(avatarPath);
}
