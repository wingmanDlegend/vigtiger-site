// 홈페이지(www) 안에서 티오(to.vigtiger.com)·파트너스(partners.vigtiger.com)로 트래픽을 보내는 조각들
import Link from "next/link";
import type { Lang } from "@/lib/forms";
import { applyPath } from "@/lib/dictionary";
import { getToCatalog, type PubProduct } from "@/lib/tosite/data";
import { ArrowRight, ArrowUpRight } from "./Icons";
import SiteLink from "./SiteLink";

const T = {
  ko: {
    bar: "대범한사람들 패밀리 사이트",
    toShort: "티오 TO · 크리에이터 무료 제품 대여",
    toMobile: "티오 · 무료 제품 대여",
    partnersMobile: "브랜드 파트너스",
    partnersShort: "브랜드 파트너스",
    eyebrow: "BRING IT TO LIFE",
    title: ["크리에이터와 브랜드,", "각자의 자리에서 바로 시작하세요"],
    lead: "제품을 써보고 싶은 크리에이터는 티오에서, 티오에 참여 중인 브랜드는 파트너스에서 바로 이어 가면 돼요.",
    creator: "크리에이터라면",
    toTitle: "써보고 싶은 제품, 티오에서 바로 고르세요",
    toBody: (b: number, p: number) => `시장조사로 고른 브랜드 ${b}곳의 제품 ${p}개를 무료로 대여해 볼 수 있어요. ♡로 찜해 두고 한 번에 신청하세요.`,
    toBodyFallback: "시장조사로 고른 브랜드의 제품을 무료로 대여해 볼 수 있어요. ♡로 찜해 두고 한 번에 신청하세요.",
    picks: "이번 주 추천",
    hots: "지금 핫딜",
    preview: "티오 제품 미리보기",
    toCta: "TO 제품 리스트 보기",
    toApply: "상담신청",
    brand: "브랜드라면",
    pTitle: "티오 참여 브랜드는 파트너스에서 직접 관리해요",
    pPoints: ["제품 등록 · 정보 수정 · 삭제 요청", "제품별 TO 노출 켜고 끄기", "이번 주 추천 · 핫딜 신청"],
    pCta: "파트너스 로그인",
    pNew: "아직 참여 전이라면 입점 신청",
    note: "",
  },
  en: {
    bar: "VIGTIGER family sites",
    toShort: "Free product try-outs (Korean)",
    toMobile: "Free try-outs",
    partnersMobile: "Brand Partners",
    partnersShort: "Brand Partners (Korean)",
    eyebrow: "BRING IT TO LIFE",
    title: ["Creators and brands,", "start right where you are"],
    lead: "Creators can pick products to try on TO, and brands already in TO manage their products on Partners. Both sites are in Korean.",
    creator: "For creators",
    toTitle: "Pick the products you want to try on TO",
    toBody: (b: number, p: number) => `Borrow ${p} products from ${b} hand-picked brands for free. Save favorites with ♡ and request them at once.`,
    toBodyFallback: "Borrow products from hand-picked brands for free. Save favorites with ♡ and request them at once.",
    picks: "This week's picks",
    hots: "Hot deals",
    preview: "TO products",
    toCta: "Browse TO products",
    toApply: "Request a try-out",
    brand: "For brands",
    pTitle: "TO brands manage everything on Partners",
    pPoints: ["Add, edit or remove products", "Turn TO visibility on or off per product", "Apply for weekly picks and hot deals"],
    pCta: "Partners login",
    pNew: "Not in TO yet? Apply to join",
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
          <SiteLink site="to" path="/products" placement="family_bar">
            <b>TO</b> <span className="fb-long">{t.toShort}</span>
            <span className="fb-short">{t.toMobile}</span> <ArrowUpRight size={14} />
          </SiteLink>
          <SiteLink site="partners" path="/" placement="family_bar">
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
    // 추천·핫딜이 없으면 분류마다 한 브랜드씩 골고루 (같은 브랜드만 4개 나오지 않게)
    const spread = () => {
      const out: PubProduct[] = [];
      const seenCat = new Set<string>();
      for (const p of withImg(d.products)) {
        const cat = d.brandById.get(p.brand_id)?.category ?? "";
        if (seenCat.has(cat)) continue;
        seenCat.add(cat);
        out.push(p);
        if (out.length === 4) break;
      }
      return out;
    };
    const list = (source === "picks" ? withImg(d.picks) : source === "hots" ? withImg(d.hots) : spread()).slice(0, 4);
    const brands = new Set(d.products.map((p) => p.brand_id)).size;
    return { list, source, brands, products: d.products.length, brandById: d.brandById };
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
          <p className="family-body">{pv ? t.toBody(pv.brands, pv.products) : t.toBodyFallback}</p>
          {pv && pv.list.length > 0 && (
            <div className="family-preview">
              <p className="family-preview-label">{pv.source === "picks" ? t.picks : pv.source === "hots" ? t.hots : t.preview}</p>
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
          <ul className="bullets">
            {t.pPoints.map((x) => (
              <li key={x}>{x}</li>
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
