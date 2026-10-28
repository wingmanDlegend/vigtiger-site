import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight } from "@/components/Icons";
import { ContactSection, PressCard, Steps, SubHero } from "@/components/Sections";
import { applyPath, getDict, isLang } from "@/lib/dictionary";
import { getPages } from "@/lib/pages";
import { pageMetadata } from "@/lib/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, "services/shopping", getPages(lang).shopping.meta);
}

export default async function ShoppingPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const p = getPages(lang).shopping;
  const ops = getDict(lang).services.shopping;

  return (
    <>
      <Header lang={lang} />
      <main>
        <SubHero
          eyebrow={p.eyebrow}
          title={p.title}
          lead={p.lead}
          aside={
            <div className="subhero-aside ops">
              <p className="ops-title">{ops.stepsTitle}</p>
              <ol>
                {ops.steps.map((step, i) => (
                  <li key={step}>
                    <span className="ops-num" aria-hidden="true">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          }
        >
          <div className="hero-ctas">
            <Link className="btn btn-accent" href={applyPath(lang, "creator", "shopping")}>
              {p.ctaPrimary}
              <ArrowRight size={18} />
            </Link>
            <Link className="btn btn-outline" href={applyPath(lang, "partner")}>
              {p.ctaSecondary}
            </Link>
          </div>
        </SubHero>

        {/* 왜 지금 */}
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
                {p.why.stats.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* 역할 분담 */}
        <section className="container section stack-48">
          <div className="section-head">
            <p className="eyebrow">{p.roles.eyebrow}</p>
            <h2 className="h2">{p.roles.title}</h2>
          </div>
          <div className="roles">
            <div className="role">
              <h3>{p.roles.creator.title}</h3>
              <ul className="checklist">
                {p.roles.creator.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
            <div className="role is-dark">
              <h3>{p.roles.us.title}</h3>
              <ul className="checklist">
                {p.roles.us.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 브랜드 */}
        <section className="services">
          <div className="container section stack-48">
            <div className="section-head">
              <p className="eyebrow">{p.brands.eyebrow}</p>
              <h2 className="h2">{p.brands.title}</h2>
            </div>
            <div className="cards">
              {p.brands.items.map((it) => (
                <article className="card is-white" key={it.title}>
                  <h3>{it.title}</h3>
                  <p className="service-body">{it.body}</p>
                </article>
              ))}
            </div>
            <Link className="link-arrow" href={applyPath(lang, "partner")}>
              {p.ctaSecondary}
              <ArrowRight />
            </Link>
          </div>
        </section>

        {/* 시작 흐름 */}
        <section className="container section">
          <div className="split">
            <div className="split-main section-head">
              <p className="eyebrow">{p.flow.eyebrow}</p>
              <h2 className="h2">{p.flow.title}</h2>
            </div>
            <Steps steps={p.flow.steps} className="split-side" />
          </div>
          <div style={{ marginTop: 72 }}>
            <PressCard lang={lang} />
          </div>
        </section>

        <ContactSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
