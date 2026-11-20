"use client";

import { track } from "@/lib/track";

// 대범한사람들 패밀리 사이트(to.vigtiger.com · partners.vigtiger.com)로 가는 링크
// 같은 창에서 이동하고, 어디서 눌렀는지 GA4 'family_site_click' 이벤트로 남깁니다.
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
}: {
  site: keyof typeof SITES;
  path?: string;
  placement: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a
      className={className}
      href={`${SITES[site]}${path}`}
      aria-label={ariaLabel}
      style={style}
      onClick={() => track("family_site_click", { site, placement, path })}
    >
      {children}
    </a>
  );
}
