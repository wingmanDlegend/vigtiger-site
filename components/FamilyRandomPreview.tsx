"use client";

import { useEffect, useState } from "react";
import SiteLink from "./SiteLink";

export type PoolItem = { id: string; name: string; image: string; brand: string; brandId: string; cat: string };

const pickOne = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** 추천·핫딜이 없을 때: 방문할 때마다 분류가 서로 다른 제품 4개를 무작위로 */
function draw(pool: PoolItem[], n = 4) {
  const byCat = new Map<string, PoolItem[]>();
  for (const p of pool) byCat.set(p.cat, [...(byCat.get(p.cat) ?? []), p]);
  const out: PoolItem[] = [];
  const usedBrand = new Set<string>();
  // 1) 무작위로 고른 분류에서, 무작위 브랜드의 무작위 제품 1개씩
  for (const cat of shuffle([...byCat.keys()])) {
    if (out.length === n) break;
    const items = byCat.get(cat)!;
    const brands = shuffle([...new Set(items.map((x) => x.brandId))]);
    const brandId = brands.find((b) => !usedBrand.has(b));
    if (!brandId) continue;
    out.push(pickOne(items.filter((x) => x.brandId === brandId)));
    usedBrand.add(brandId);
  }
  // 2) 분류가 4개보다 적으면 다른 브랜드 제품으로 채움
  for (const p of shuffle(pool)) {
    if (out.length === n) break;
    if (!usedBrand.has(p.brandId)) {
      out.push(p);
      usedBrand.add(p.brandId);
    }
  }
  return out;
}

export default function FamilyRandomPreview({ pool, placement }: { pool: PoolItem[]; placement: string }) {
  const [list, setList] = useState<PoolItem[] | null>(null);
  useEffect(() => setList(draw(pool)), [pool]);
  return (
    <ul className={list ? "is-ready" : "is-pending"} aria-busy={!list}>
      {(list ?? Array.from({ length: 4 }, () => null)).map((p, i) =>
        p ? (
          <li key={p.id}>
            <SiteLink site="to" path="/products" placement={`${placement}_preview`} ariaLabel={p.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" loading="lazy" />
              <span>
                <small>{p.brand}</small>
                {p.name}
              </span>
            </SiteLink>
          </li>
        ) : (
          <li key={`ph-${i}`} aria-hidden="true">
            <span className="family-ph" />
          </li>
        ),
      )}
    </ul>
  );
}
