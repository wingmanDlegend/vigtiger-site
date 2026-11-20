"use client";

import { track } from "@/lib/track";

// 대범한사람들 패밀리 사이트(to.vigtiger.com · partners.vigtiger.com)로 가는 링크
// 기본은 같은 창에서 이동(newTab이면 새 창), 어디서 눌렀는지 GA4 'family_site_click' 이벤트로 남깁니다.
export const SITES = {
  to: "https://to.vigtiger.com",
  partners: "https://partners.vigtiger.com",
} as const;

export default function SiteLink({
  site,
  path = "/",
  placement,
  className,
  children,
  ariaLabel,
  style,
  newTab = false,
}: {
  site: keyof typeof SITES;
  path?: string;
  placement: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  style?: React.CSSProperties;
  /** 새 창(탭)으로 열기 */
  newTab?: boolean;
}) {
  return (
    <a
      className={className}
      href={`${SITES[site]}${path}`}
      aria-label={ariaLabel}
      style={style}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => track("family_site_click", { site, placement, path })}
    >
      {children}
    </a>
  );
}
