/** public 폴더 에셋 URL 생성 (BASE_URL·쿼리 정규화) */
export function storyPublicFoxSrc(versionKey: string, filename: string) {
  const base =
    `${import.meta.env.BASE_URL}${filename}?v=${encodeURIComponent(versionKey)}`.replace(/\/{2,}/g, "/");
  return base;
}
