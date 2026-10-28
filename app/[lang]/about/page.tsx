import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ContactSection, PressCard, ServiceCards, StatsBand, SubHero, TeamSection } from "@/components/Sections";
import { isLang } from "@/lib/dictionary";
import { getPages } from "@/lib/pages";
import { pageMetadata } from "@/lib/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, "about", getPages(lang).about.meta);
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const p = getPages(lang).about;

  return (
    <>
      <Header lang={lang} />
      <main>
        <SubHero eyebrow={p.eyebrow} title={p.title} lead={p.lead} />

        <section className="container section-tight">
          <div className="facts-wrap">
            <h2 className="h3">{p.overviewTitle}</h2>
            <dl className="facts">
              {p.overview.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="services">
          <div className="container section stack-48">
            <div className="section-head">
              <p className="eyebrow">{p.why.eyebrow}</p>
              <h2 className="h2">{p.why.title}</h2>
              <p className="lead">{p.why.body}</p>
            </div>
            <dl className="big-stats">
              {p.why.stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="note">{p.why.note}</p>
          </div>
        </section>

        <section className="container section stack-48">
          <div className="section-head">
            <p className="eyebrow">SERVICES</p>
            <h2 className="h2">{p.whatTitle}</h2>
            <p className="lead">{p.whatLead}</p>
          </div>
          <ServiceCards lang={lang} />
        </section>

        <section className="container" style={{ paddingBottom: 48 }}>
          <div className="section-head">
            <p className="eyebrow">GROWTH</p>
            <h2 className="h2">{p.growthTitle}</h2>
            <p className="lead">{p.growthBody}</p>
          </div>
        </section>
        <StatsBand lang={lang} />

        <TeamSection lang={lang} />

        <section className="container" style={{ paddingBottom: 112 }}>
          <div className="closing">
            <p>{p.closing}</p>
            <p className="closing-sign">— {p.signature}</p>
          </div>
          <div style={{ marginTop: 48 }}>
            <PressCard lang={lang} />
          </div>
        </section>

        <ContactSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
