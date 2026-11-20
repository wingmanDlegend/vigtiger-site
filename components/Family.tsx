// 홈페이지(www) 안에서 티오(to.vigtiger.com)·파트너스(partners.vigtiger.com)로 트래픽을 보내는 조각들
import Link from "next/link";
import type { Lang } from "@/lib/forms";
import { applyPath } from "@/lib/dictionary";
import { getToCatalog, type PubProduct } from "@/lib/tosite/data";
import { ArrowRight, ArrowUpRight } from "./Icons";
import SiteLink from "./SiteLink";
import FamilyRandomPreview, { type PoolItem } from "./FamilyRandomPreview";

const T = {
  ko: {
    bar: "대범한사람들 패밀리 사이트",
    newWin: "새 창",
    toShort: "티오 TO · 크리에이터 무료 제품 대여",
    toMobile: "티오 · 무료 제품 대여",
    partnersMobile: "브랜드 파트너스",
    partnersShort: "브랜드 파트너스",
    eyebrow: "TRY · LOVE · SELL",
    title: ["써보는 사람과 만드는 사람,", "티오에서 만나요"],
    lead: "크리에이터는 부담 없이 먼저 써보고, 브랜드는 진짜 후기를 얻어요. 들어오는 문은 둘, 향하는 곳은 하나예요.",
    creator: "FOR CREATORS",
    toTitle: "써보고 반하면, 그때 추천하세요",
    toBody: (b: number, p: number) => `브랜드 ${b}곳, 제품 ${p}개가 당신의 첫 리뷰를 기다리고 있어요. 끌리는 건 ♡ 찜, 신청은 한 번에.`,
    toBodyFallback: "요즘 뜨는 브랜드의 제품들이 당신의 첫 리뷰를 기다리고 있어요. 끌리는 건 ♡ 찜, 신청은 한 번에.",
    picks: "이번 주 MD 픽",
    hots: "지금 핫딜",
    preview: "지금 티오에서는",
    toCta: "티오 구경하러 가기",
    toApply: "바로 대여 신청",
    brand: "FOR BRANDS",
    pTitle: "크리에이터가 먼저 찾는 브랜드, 여기서 시작돼요",
    pLead: "좋은 제품은 결국 써본 사람이 팔아요. 파트너스에서 우리 브랜드의 무대를 직접 꾸며 보세요.",
    pPoints: [
      { k: "내 제품, 내 손으로", v: "등록부터 수정까지 한 화면에서" },
      { k: "타이밍은 브랜드가", v: "보여 줄지 말지, 클릭 한 번으로" },
      { k: "이번 주의 주인공", v: "추천·핫딜로 크리에이터 리스트 맨 앞줄에" },
    ],
    pCta: "파트너스 입장하기",
    pNew: "아직 티오 브랜드가 아니라면? 입점 문의",
    note: "",
  },
  en: {
    bar: "VIGTIGER family sites",
    newWin: "opens in a new tab",
    toShort: "Free product try-outs (Korean)",
    toMobile: "Free try-outs",
    partnersMobile: "Brand Partners",
    partnersShort: "Brand Partners (Korean)",
    eyebrow: "TRY · LOVE · SELL",
    title: ["Where the people who try", "meet the people who make"],
    lead: "Creators try first, with nothing to lose. Brands earn honest reviews. Two doors, one destination. (Both sites are in Korean.)",
    creator: "FOR CREATORS",
    toTitle: "Fall for it first. Then recommend it.",
    toBody: (b: number, p: number) => `${p} products from ${b} brands are waiting for your first review. Heart what you love, request it all at once.`,
    toBodyFallback: "Products from today's rising brands are waiting for your first review. Heart what you love, request it all at once.",
    picks: "This week's MD picks",
    hots: "Hot deals now",
    preview: "Now on TO",
    toCta: "Explore TO",
    toApply: "Request a try-out",
    brand: "FOR BRANDS",
    pTitle: "Become the brand creators look for first",
    pLead: "Great products are sold by people who've tried them. Set your brand's stage on Partners.",
    pPoints: [
      { k: "Your products, your hands", v: "Add and edit everything on one screen" },
      { k: "You own the timing", v: "Show or hide with a single click" },
      { k: "Star of the week", v: "Weekly picks and hot deals put you front row" },
    ],
    pCta: "Enter Partners",
    pNew: "Not a TO brand yet? Let's talk",
    note: "",
  },
};

/** 헤더 위 얇은 띠 — 패밀리 사이트 바로가기 (모든 홈페이지 화면) */
export function FamilyBar({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <div className="family-bar">
      <div className="container family-bar-inner">
        <span className="family-bar-label">{t.bar}</span>
        <nav aria-label={t.bar}>
          <SiteLink site="to" path="/products" placement="family_bar" newTab ariaLabel={`${t.toShort} (${t.newWin})`}>
            <b>TO</b> <span className="fb-long">{t.toShort}</span>
            <span className="fb-short">{t.toMobile}</span> <ArrowUpRight size={14} />
          </SiteLink>
          <SiteLink site="partners" path="/" placement="family_bar" newTab ariaLabel={`${t.partnersShort} (${t.newWin})`}>
            <span className="fb-long">{t.partnersShort}</span>
            <span className="fb-short">{t.partnersMobile}</span> <ArrowUpRight size={14} />
          </SiteLink>
        </nav>
      </div>
    </div>
  );
}

/** 티오 제품 미리보기 4개 — 이번 주 추천 → 핫딜 → 사진 있는 제품 순 */
async function preview() {
  try {
    const d = await getToCatalog();
    const withImg = (list: PubProduct[]) => list.filter((p) => p.image_url);
    const source = withImg(d.picks).length ? "picks" : withImg(d.hots).length ? "hots" : "all";
    // 1·2) 이번 주 추천 → 핫딜: 관리자가 정한 순서대로 앞의 4개
    const list = source === "picks" ? withImg(d.picks).slice(0, 4) : source === "hots" ? withImg(d.hots).slice(0, 4) : [];
    // 3) 둘 다 없으면: 방문할 때마다 무작위 (브라우저에서 고름). 후보는 브랜드마다 최대 3개
    const perBrand = new Map<string, number>();
    const pool: PoolItem[] = [];
    if (source === "all") {
      for (const p of withImg(d.products)) {
        const n = perBrand.get(p.brand_id) ?? 0;
        if (n >= 3) continue;
        perBrand.set(p.brand_id, n + 1);
        const b = d.brandById.get(p.brand_id);
        pool.push({ id: p.id, name: p.name, image: p.image_url!, brand: b?.name_ko ?? "", brandId: p.brand_id, cat: b?.category ?? "" });
      }
    }
    const brands = new Set(d.products.map((p) => p.brand_id)).size;
    return { list, pool, source, brands, products: d.products.length, brandById: d.brandById };
  } catch {
    return null;
  }
}

/** 홈 — 크리에이터는 티오로, 브랜드는 파트너스로 */
export async function FamilyCrossroads({ lang, placement = "home" }: { lang: Lang; placement?: string }) {
  const t = T[lang];
  const pv = await preview();
  return (
    <section className="container section family" aria-labelledby={`family-title-${placement}`}>
      <div className="section-head">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h2" id={`family-title-${placement}`}>
          {t.title[0]}
          <br />
          {t.title[1]}
        </h2>
        <p className="lead">{t.lead}</p>
      </div>
      <div className="family-grid">
        <article className="family-card is-to">
          <p className="family-who">{t.creator}</p>
          <h3>{t.toTitle}</h3>
          <p className="family-body">{pv && pv.products > 0 ? t.toBody(pv.brands, pv.products) : t.toBodyFallback}</p>
          {pv && pv.source === "all" && pv.pool.length > 0 && (
            <div className="family-preview">
              <p className="family-preview-label">{t.preview}</p>
              <FamilyRandomPreview pool={pv.pool} placement={placement} />
            </div>
          )}
          {pv && pv.list.length > 0 && (
            <div className="family-preview">
              <p className="family-preview-label">{pv.source === "picks" ? t.picks : t.hots}</p>
              <ul>
                {pv.list.map((p) => (
                  <li key={p.id}>
                    <SiteLink site="to" path="/products" placement={`${placement}_preview`} ariaLabel={p.name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url!} alt="" loading="lazy" />
                      <span>
                        <small>{pv.brandById.get(p.brand_id)?.name_ko}</small>
                        {p.name}
                      </span>
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="hero-ctas">
            <SiteLink site="to" path="/products" placement={`${placement}_card`} className="btn btn-accent">
              {t.toCta}
              <ArrowUpRight />
            </SiteLink>
            <SiteLink site="to" path="/apply" placement={`${placement}_card`} className="btn family-btn-ghost">
              {t.toApply}
            </SiteLink>
          </div>
        </article>

        <article className="family-card is-partners">
          <p className="family-who">{t.brand}</p>
          <h3>{t.pTitle}</h3>
          <p className="family-plead">{t.pLead}</p>
          <ul className="family-perks">
            {t.pPoints.map((x, i) => (
              <li key={x.k}>
                <span className="family-perk-no" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <b>{x.k}</b>
                  <small>{x.v}</small>
                </span>
              </li>
            ))}
          </ul>
          <div className="family-actions">
            <SiteLink site="partners" path="/login" placement={`${placement}_card`} className="btn btn-dark">
              {t.pCta}
              <ArrowUpRight />
            </SiteLink>
            <Link className="link-arrow" href={applyPath(lang, "partner")}>
              {t.pNew}
              <ArrowRight />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

/** 신청서 위 안내 — 더 빠른 길이 있으면 알려 줌 */
export function ApplyShortcut({ lang, type }: { lang: Lang; type: "creator" | "partner" | "advertiser" }) {
  if (type === "advertiser") return null;
  const ko = lang === "ko";
  if (type === "creator") {
    return (
      <aside className="family-shortcut">
        <p>
          <b>{ko ? "티오(TO) 무료 제품 대여만 원하시나요?" : "Just want to try products for free?"}</b>{" "}
          {ko
            ? "티오 사이트에서 제품을 보고 ♡로 찜한 뒤 바로 신청하는 게 더 빨라요."
            : "On the TO site you can browse products, save favorites and request them right away (Korean)."}
        </p>
        <SiteLink site="to" path="/products" placement="apply_creator" className="link-arrow">
          {ko ? "TO 제품 리스트 보기" : "Browse TO products"}
          <ArrowUpRight />
        </SiteLink>
      </aside>
    );
  }
  return (
    <aside className="family-shortcut">
      <p>
        <b>{ko ? "이미 티오에 참여 중인 브랜드인가요?" : "Already a TO brand?"}</b>{" "}
        {ko
          ? "담당자 계정으로 파트너스에 로그인하면 제품 등록·수정과 추천·핫딜 신청을 직접 할 수 있어요."
          : "Log in to Partners with your manager account to add products and apply for picks and hot deals (Korean)."}
      </p>
      <SiteLink site="partners" path="/login" placement="apply_partner" className="link-arrow">
        {ko ? "파트너스 로그인" : "Partners login"}
        <ArrowUpRight />
      </SiteLink>
    </aside>
  );
}
