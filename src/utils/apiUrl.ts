/**
 * 같은 출처에서는 빈 문자열(상대 경로)을 씁니다.
 * 별도 API 호스트가 있을 때만 `VITE_API_BASE` 에 베이스 URL 을 두면 됩니다.
 */
export function apiUrl(pathSeg: string): string {
  const base = typeof import.meta.env.VITE_API_BASE === "string" ? import.meta.env.VITE_API_BASE.replace(/\/$/, "") : "";
  const p = pathSeg.startsWith("/") ? pathSeg : `/${pathSeg}`;
  return `${base}${p}`;
}
