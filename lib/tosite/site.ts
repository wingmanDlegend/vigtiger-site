// to.vigtiger.com 공용 상수 (화면·서버 공용)
export const TO_URL = "https://to.vigtiger.com";
export const WWW_URL = "https://www.vigtiger.com";

export const TO_NAV = [
  { key: "intro", label: "TO 서비스 소개", href: "/" },
  { key: "products", label: "TO 제품 리스트", href: "/products" },
  { key: "apply", label: "상담신청", href: "/apply" },
  { key: "about", label: "회사소개", href: "/about" },
] as const;
export type ToNavKey = (typeof TO_NAV)[number]["key"];
