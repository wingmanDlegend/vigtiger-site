import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, ArrowUpRight } from "@/components/Icons";
import { ContactSection, Steps, SubHero } from "@/components/Sections";
import BrandDirectory from "@/components/BrandDirectory";
import SiteLink from "@/components/SiteLink";
import { BRAND_TEXT, BRAND_TOTAL } from "@/lib/brands";
import { CONTACT, applyPath, getDict, isLang } from "@/lib/dictionary";
import { getPages } from "@/lib/pages";
import { getToCounts } from "@/lib/tosite/data";
import { pageMetadata } from "@/lib/meta";

// 티오 참여 브랜드 수는 실제 노출 기준으로 5분마다(관리자 변경 시 즉시) 다시 계산
export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, "services/to", getPages(lang).to.meta);
}

const TO_SUBSCRIBE = "https://bit.ly/TO_subscribe";

export default async function ToPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const p = getPages(lang).to;
  const steps = getDict(lang).services.to.steps;
  // 참여 브랜드 숫자·목록은 지금 티오(to.vigtiger.com)에 실제 노출 중인 브랜드 기준
  const live = await getToCounts();
  const brandCount = live?.brands ?? BRAND_TOTAL;

  return (
    <>
      <Header lang={lang} />
      <main>
        <SubHero
          eyebrow={p.eyebrow}
          title={p.title}
          lead={p.lead}
          aside={
            <div className="subhero-aside to-badge">
              <span className="to-word" aria-hidden="true">
                <b>T</b>ry-<b>O</b>ut
              </span>
              <p>{p.nameNote}</p>
            </div>
          }
        >
          <div className="hero-ctas">
            <SiteLink site="to" path="/products" placement="to_page_hero" className="btn btn-accent">
              {lang === "ko" ? "TO 제품 리스트 보기" : "Browse TO products"}
              <ArrowUpRight />
            </SiteLink>
            <SiteLink site="to" path="/apply" placement="to_page_hero" className="btn btn-outline">
              {p.ctaPrimary}
            </SiteLink>
          </div>
          <p className="family-inline">
            {lang === "ko" ? "브랜드이신가요? " : "Are you a brand? "}
            <Link href={applyPath(lang, "partner")}>{p.ctaSecondary}</Link>
            {" · "}
            <SiteLink site="partners" path="/login" placement="to_page_hero">
              {lang === "ko" ? "참여 브랜드 파트너스 로그인 ↗" : "Partners login ↗"}
            </SiteLink>
          </p>
        </SubHero>

        {/* 왜 필요한가 */}
        <section className="services">
          <div className="container section">
            <div className="split">
              <div className="split-main section-head">
                <p className="eyebrow">{p.why.eyebrow}</p>
                <h2 className="h2">{p.why.title}</h2>
                {p.why.body.map((para) => (
                  <p className="lead" key={para}>
                    {para}
                  </p>
                ))}
              </div>
              <dl className="big-stats is-stacked">
                <div>
                  <dt>{p.why.stat.label}</dt>
                  <dd>{p.why.stat.value}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* 세 가지 조건 */}
        <section className="container section stack-48">
          <div className="section-head">
            <p className="eyebrow">{p.pillars.eyebrow}</p>
            <h2 className="h2">{p.pillars.title}</h2>
          </div>
          <ol className="pillars">
            {p.pillars.items.map((it, i) => (
              <li key={it}>
                <span className="flow-num">{i + 1}</span>
                <b>{it}</b>
              </li>
            ))}
          </ol>
          <p className="lead" style={{ fontWeight: 700, color: "#111111" }}>
            {p.pillars.note}
          </p>
        </section>

        {/* 다른 점 */}
        <section className="services">
          <div className="container section stack-48">
            <div className="section-head">
              <p className="eyebrow">{p.diff.eyebrow}</p>
              <h2 className="h2">{p.diff.title}</h2>
            </div>
            <div className="cards">
              {p.diff.items.map((it) => (
                <article className="card is-white" key={it.title}>
                  <h3>{it.title}</h3>
                  <p className="service-body">{it.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 참여 브랜드 전체 목록 */}
        <section id="brands" className="services brand-dir-section" aria-labelledby="brand-dir-title">
          <div className="container section stack-48">
            <div className="section-head">
              <p className="eyebrow">{BRAND_TEXT[lang].eyebrow}</p>
              <h2 className="h2" id="brand-dir-title">
                {BRAND_TEXT[lang].dirTitle}
              </h2>
              <p className="lead">{BRAND_TEXT[lang].dirLead(brandCount)}</p>
            </div>
            <BrandDirectory lang={lang} groups={live?.groups} />
            <div className="brand-dir-foot">
              <small className="note">{BRAND_TEXT[lang].note}</small>
              <div className="hero-ctas">
                <SiteLink site="to" path="/products" placement="to_page_brands" className="btn btn-dark">
                  {BRAND_TEXT[lang].productList}
                  <ArrowUpRight />
                </SiteLink>
                <SiteLink site="to" path="/apply" placement="to_page_brands" className="btn btn-outline">
                  {BRAND_TEXT[lang].apply}
                </SiteLink>
              </div>
            </div>
          </div>
        </section>

        {/* 참여 브랜드 + 이용 방법 */}
        <section className="container section">
          <div className="split">
            <div className="split-main">
              <div className="brand-count">
                <p>
                  <b>
                    {brandCount}
                    <small>{p.brands.unit}</small>
                  </b>
                  <span>{p.brands.title}</span>
                </p>
                <small className="note">{p.brands.note}</small>
                <div className="links-row">
                  <SiteLink site="to" path="/products" placement="to_page_count" className="link-arrow">
                    {p.brands.productList}
                    <ArrowUpRight />
                  </SiteLink>
                  <SiteLink site="partners" path="/login" placement="to_page_count" className="link-arrow muted-link">
                    {lang === "ko" ? "참여 브랜드 파트너스" : "Brand Partners"}
                    <ArrowUpRight />
                  </SiteLink>
                </div>
              </div>
              <div className="subscribe">
                <p>{p.brands.subscribeBody}</p>
                <a className="link-arrow" href={TO_SUBSCRIBE} target="_blank" rel="noopener noreferrer">
                  {p.brands.subscribe}
                  <ArrowUpRight />
                </a>
              </div>
            </div>
            <div className="split-side">
              <h2 className="h3" style={{ marginBottom: 8 }}>
                {p.stepsTitle}
              </h2>
              <Steps steps={steps} />
              <SiteLink site="to" path="/apply" placement="to_page_steps" className="btn btn-dark" style={{ marginTop: 20 }}>
                {p.ctaPrimary}
                <ArrowUpRight />
              </SiteLink>
            </div>
          </div>
        </section>

        <ContactSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
