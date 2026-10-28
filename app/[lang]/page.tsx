import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, ArrowUpRight } from "@/components/Icons";
import {
  AdvirtualChart,
  ContactSection,
  Lines,
  MockFrame,
  PressCard,
  StatsBand,
  Steps,
  TeamSection,
} from "@/components/Sections";
import { CONTACT, applyPath, getDict, isLang, pagePath } from "@/lib/dictionary";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const s = t.services;
  const More = ({ href }: { href: string }) => (
    <Link className="link-arrow" href={href}>
      {t.nav.more}
      <ArrowRight />
    </Link>
  );

  return (
    <>
      <Header lang={lang} onHome />
      <main id="top">
        <section className="container hero">
          <div className="hero-copy">
            <p className="hero-eyebrow">{t.hero.eyebrow}</p>
            <h1>
              <Lines lines={t.hero.title} />
            </h1>
            <p className="hero-body">{t.hero.body}</p>
            <div className="hero-ctas">
              <Link className="btn btn-accent" href={applyPath(lang, "creator")}>
                {t.hero.primary}
                <ArrowRight size={18} />
              </Link>
              <a className="btn btn-outline" href="#contact">
                {t.hero.secondary}
              </a>
            </div>
          </div>
          <MockFrame lang={lang} />
        </section>

        <StatsBand lang={lang} />

        <section id="about" className="container section stack-48">
          <div className="section-head">
            <p className="eyebrow">{t.about.eyebrow}</p>
            <h2 className="h2">
              <Lines lines={t.about.title} />
            </h2>
            <p className="lead">{t.about.body}</p>
          </div>
          <div className="cards">
            {t.about.cards.map((c) => (
              <article className="card" key={c.type}>
                <span className="pill">{c.tag}</span>
                <h3>
                  <Lines lines={c.title} />
                </h3>
                <ul className="bullets">
                  {c.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <Link className="link-arrow" href={applyPath(lang, c.type)}>
                  {c.cta}
                  <ArrowRight />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="services" className="services">
          <div className="container section services-inner">
            <div className="section-head" style={{ paddingBottom: 16 }}>
              <p className="eyebrow">{s.eyebrow}</p>
              <h2 className="h2">{s.title}</h2>
            </div>

            <article className="service">
              <div className="service-copy">
                <p className="service-num">{s.advirtual.num}</p>
                <h3>{s.advirtual.name}</h3>
                <p className="service-tagline">{s.advirtual.tagline}</p>
                <p className="service-body">{s.advirtual.body}</p>
                <ul className="bullets">
                  {s.advirtual.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <More href={pagePath(lang, "services/advirtual")} />
              </div>
              <AdvirtualChart lang={lang} />
            </article>

            <article className="service">
              <div className="service-copy">
                <p className="service-num">{s.shopping.num}</p>
                <h3>{s.shopping.name}</h3>
                <p className="service-tagline">{s.shopping.tagline}</p>
                <p className="service-body">{s.shopping.body}</p>
                <More href={pagePath(lang, "services/shopping")} />
              </div>
              <div className="service-side ops">
                <p className="ops-title">{s.shopping.stepsTitle}</p>
                <ol>
                  {s.shopping.steps.map((step, i) => (
                    <li key={step}>
                      <span className="ops-num" aria-hidden="true">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </article>

            <article className="service">
              <div className="service-copy">
                <p className="service-num">{s.to.num}</p>
                <h3>{s.to.name}</h3>
                <p className="service-tagline">{s.to.tagline}</p>
                <p className="service-body">{s.to.body}</p>
                <div className="links-row">
                  <More href={pagePath(lang, "services/to")} />
                  <a className="link-arrow muted-link" href={CONTACT.toProducts} target="_blank" rel="noopener noreferrer">
                    {s.to.listLink}
                    <ArrowUpRight />
                  </a>
                </div>
              </div>
              <Steps steps={s.to.steps} className="service-side" />
            </article>
          </div>
        </section>

        <TeamSection lang={lang} more />

        <section className="container" aria-label={t.press.label} style={{ paddingBottom: 112 }}>
          <PressCard lang={lang} />
        </section>

        <ContactSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
