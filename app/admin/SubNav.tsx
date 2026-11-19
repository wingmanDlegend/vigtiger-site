// 영역 안 하위 탭 (목록 / 대시보드)
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
