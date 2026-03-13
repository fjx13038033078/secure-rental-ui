/**
 * OSS 图片 URL 工具
 * 将 MinIO 直连 URL 转为代理 URL，兼容旧数据（新数据由后端返回预览代理 URL）
 */
export function toProxyUrlIfNeeded(url: string): string {
  if (!url || typeof url !== 'string') return url;
  // 匹配 http://127.0.0.1:9000/ 或 http://localhost:9000/（旧数据或直连 URL）
  const match = url.match(/^https?:\/\/(127\.0\.0\.1|localhost):9000(\/.*)?$/);
  if (match) {
    const path = match[2] || '/';
    return `/minio-proxy${path}`;
  }
  return url;
}
