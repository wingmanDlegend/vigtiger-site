// GA4 이벤트 전송 (GA가 연결되지 않았으면 아무 일도 하지 않음). 개인정보는 보내지 않습니다.
type Gtag = (command: "event", name: string, params?: Record<string, string | number | boolean>) => void;

export function track(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag("event", name, params);
}
