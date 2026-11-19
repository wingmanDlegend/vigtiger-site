import type { ReactNode } from "react";

// 화면 머리 — 위치(그룹) → 제목 → (오른쪽 도구) → 탭. 모든 관리자 화면이 같은 순서
export function PageHead({ crumb, title, desc, actions, tabs }: { crumb?: string; title: string; desc?: ReactNode; actions?: ReactNode; tabs?: ReactNode }) {
  return (
    <div className="a-head">
      {crumb && <p className="a-crumb">{crumb}</p>}
      <div className="a-head-row">
        <h1 className="a-h1">{title}</h1>
        {actions && <div className="a-head-actions">{actions}</div>}
      </div>
      {desc && <p className="a-sub a-head-desc">{desc}</p>}
      {tabs}
    </div>
  );
}

// 비즈니스 영역 — 첫 탭은 항상 '현황'
export const SECTIONS = {
  applications: {
    crumb: "비즈니스",
    title: "제휴 신청",
    tabs: [
      { key: "dashboard", href: "/dashboard/applications", label: "현황" },
      { key: "list", href: "/applications", label: "목록" },
    ],
  },
  groupbuys: {
    crumb: "비즈니스",
    title: "공동구매",
    tabs: [
      { key: "dashboard", href: "/dashboard/groupbuys", label: "현황" },
      { key: "list", href: "/groupbuys", label: "목록" },
    ],
  },
} as const;

export function SectionHeader({ section, current, actions, desc }: { section: keyof typeof SECTIONS; current: "dashboard" | "list"; actions?: ReactNode; desc?: ReactNode }) {
  const s = SECTIONS[section];
  return (
    <PageHead
      crumb={s.crumb}
      title={s.title}
      actions={actions}
      desc={desc}
      tabs={
        <nav className="db-subnav" aria-label={`${s.title} 보기`}>
          {s.tabs.map((t) => (
            <a key={t.key} href={t.href} aria-current={t.key === current ? "page" : undefined}>
              {t.label}
            </a>
          ))}
        </nav>
      }
    />
  );
}

export function RangeTabs({ base, current, extra = "" }: { base: string; current: string; extra?: string }) {
  const R = [
    ["30d", "최근 30일"],
    ["90d", "최근 90일"],
    ["year", "올해"],
    ["all", "전체"],
  ];
  return (
    <nav className="a-tabs" aria-label="기간">
      {R.map(([k, l]) => (
        <a key={k} className="a-tab" href={`${base}?range=${k}${extra}`} aria-current={current === k ? "page" : undefined}>
          {l}
        </a>
      ))}
    </nav>
  );
}
