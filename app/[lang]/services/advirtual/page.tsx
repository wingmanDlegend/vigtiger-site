import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight } from "@/components/Icons";
import { AdvirtualChart, ContactSection, MockFrame, SubHero } from "@/components/Sections";
import { applyPath, isLang } from "@/lib/dictionary";
import { getPages } from "@/lib/pages";
import { pageMetadata } from "@/lib/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, "services/advirtual", getPages(lang).advirtual.meta);
}

export default async function AdvirtualPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const p = getPages(lang).advirtual;

  return (
    <>
      <Header lang={lang} />
      <main>
        <SubHero eyebrow={p.eyebrow} title={p.title} lead={p.lead} aside={<MockFrame lang={lang} />}>
          <div className="hero-ctas">
            <Link className="btn btn-accent" href={applyPath(lang, "advertiser")}>
              {p.ctaPrimary}
              <ArrowRight size={18} />
            </Link>
            <Link className="btn btn-outline" href={applyPath(lang, "creator", "advirtual")}>
              {p.ctaSecondary}
            </Link>
          </div>
        </SubHero>

        {/* 작동 방식 */}
        <section className="services">
          <div className="container section stack-48">
            <div className="section-head">
              <p className="eyebrow">{p.how.eyebrow}</p>
              <h2 className="h2">{p.how.title}</h2>
            </div>
            <ol className="flow">
              {p.how.steps.map((s, i) => (
                <li key={s.title}>
                  <span className="flow-num">{String(i + 1).padStart(2, "0")}</span>
                  <b>{s.title}</b>
                  <span>{s.desc}</span>
                </li>
              ))}
            </ol>
            <div className="fit">
              <h3>{p.fit.title}</h3>
              <ul className="bullets">
                {p.fit.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 광고주 */}
        <section className="container section stack-48">
          <div className="section-head">
            <p className="eyebrow">{p.advertiser.eyebrow}</p>
            <h2 className="h2">{p.advertiser.title}</h2>
          </div>
          <div className="split">
            <div className="split-main benefits">
              {p.advertiser.items.map((it) => (
                <article key={it.title}>
                  <p className="service-num">{it.title}</p>
                  <h3>{it.lead}</h3>
                  <p className="service-body">{it.body}</p>
                </article>
              ))}
            </div>
            <AdvirtualChart lang={lang} />
          </div>
        </section>

        {/* 크리에이터 */}
        <section className="services">
          <div className="container section">
            <div className="service">
              <div className="service-copy">
                <p className="service-num">{p.creator.eyebrow}</p>
                <h2 className="h2">{p.creator.title}</h2>
                <p className="service-tagline">{p.creator.headline}</p>
                <p className="service-body">{p.creator.body}</p>
                <Link className="link-arrow" href={applyPath(lang, "creator", "advirtual")}>
                  {p.ctaSecondary}
                  <ArrowRight />
                </Link>
              </div>
              <ul className="service-side checklist">
                {p.creator.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 진행 프로세스 */}
        <section className="container section stack-48">
          <div className="section-head">
            <p className="eyebrow">{p.process.eyebrow}</p>
            <h2 className="h2">{p.process.title}</h2>
            <p className="lead">{p.process.body}</p>
          </div>
          <div className="tracks" role="img" aria-label={`${p.process.start} → ${p.process.tracks.join(", ")} → ${p.process.end} (${p.process.within})`}>
            <div className="tracks-axis" aria-hidden="true">
              <span>{p.process.start}</span>
              <span className="tracks-within">{p.process.within}</span>
              <span>{p.process.end}</span>
            </div>
            {p.process.tracks.map((tr) => (
              <div className="track" key={tr} aria-hidden="true">
                <span>{tr}</span>
              </div>
            ))}
          </div>
        </section>

        <ContactSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
