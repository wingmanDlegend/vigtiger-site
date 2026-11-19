// 영역 안 하위 탭 — 대시보드가 항상 첫 번째 (영역에 들어오면 대시보드부터 보임)
export const SECTION_TABS = {
  applications: [
    { key: "dashboard", href: "/admin/dashboard/applications", label: "대시보드" },
    { key: "list", href: "/admin", label: "신청 목록" },
  ],
  groupbuys: [
    { key: "dashboard", href: "/admin/dashboard/groupbuys", label: "대시보드" },
    { key: "list", href: "/admin/groupbuys", label: "결과 목록" },
  ],
} as const;

export function SectionTabs({ section, current }: { section: keyof typeof SECTION_TABS; current: "dashboard" | "list" }) {
  return <SubNav items={SECTION_TABS[section].map((t) => ({ href: t.href, label: t.label, current: t.key === current }))} />;
}

export default function SubNav({ items }: { items: { href: string; label: string; current?: boolean }[] }) {
  return (
    <nav className="db-subnav" aria-label="하위 메뉴">
      {items.map((it) => (
        <a key={it.href} href={it.href} aria-current={it.current ? "page" : undefined}>
          {it.label}
        </a>
      ))}
    </nav>
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
