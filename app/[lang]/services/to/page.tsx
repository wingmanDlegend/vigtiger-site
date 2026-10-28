import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, ArrowUpRight } from "@/components/Icons";
import { ContactSection, Steps, SubHero } from "@/components/Sections";
import { CONTACT, applyPath, getDict, isLang } from "@/lib/dictionary";
import { getPages } from "@/lib/pages";
import { pageMetadata } from "@/lib/meta";

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
            <Link className="btn btn-accent" href={applyPath(lang, "creator", "to")}>
              {p.ctaPrimary}
              <ArrowRight size={18} />
            </Link>
            <Link className="btn btn-outline" href={applyPath(lang, "partner")}>
              {p.ctaSecondary}
            </Link>
          </div>
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

        {/* 참여 브랜드 + 이용 방법 */}
        <section className="container section">
          <div className="split">
            <div className="split-main">
              <div className="brand-count">
                <p>
                  <b>
                    {p.brands.value}
                    <small>{p.brands.unit}</small>
                  </b>
                  <span>{p.brands.title}</span>
                </p>
                <small className="note">{p.brands.note}</small>
                <div className="links-row">
                  <a className="link-arrow" href={CONTACT.toProducts} target="_blank" rel="noopener noreferrer">
                    {p.brands.productList}
                    <ArrowUpRight />
                  </a>
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
              <Link className="btn btn-dark" href={applyPath(lang, "creator", "to")} style={{ marginTop: 20 }}>
                {p.ctaPrimary}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <ContactSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
