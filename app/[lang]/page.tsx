import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, ArrowUpRight, Bag, Chat, Mail, Phone } from "@/components/Icons";
import { CONTACT, applyPath, getDict, isLang } from "@/lib/dictionary";

const Lines = ({ lines }: { lines: string[] }) => (
  <>
    {lines.map((l, i) => (
      <span key={l}>
        {l}
        {i < lines.length - 1 && <br />}
      </span>
    ))}
  </>
);

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const s = t.services;

  return (
    <>
      <Header lang={lang} />
      <main id="top">
        {/* Hero */}
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
          <figure className="mock">
            <div className="mock-frame" role="img" aria-label={t.hero.mock.alt}>
              <div className="mock-head" />
              <div className="mock-body" />
              <span className="mock-label">{t.hero.mock.video}</span>
              <div className="mock-ad">
                <span>{t.hero.mock.adTag}</span>
                <span>{t.hero.mock.adTitle}</span>
              </div>
              <div className="mock-shop">
                <span className="mock-shop-icon">
                  <Bag />
                </span>
                <span className="mock-shop-text">
                  <b>{t.hero.mock.shopTitle}</b>
                  <small>{t.hero.mock.shopSub}</small>
                </span>
              </div>
              <div className="mock-progress" />
            </div>
            <figcaption>{t.hero.mock.caption}</figcaption>
          </figure>
        </section>

        {/* Stats */}
        <section className="stats" aria-label={t.stats.label}>
          <div className="container stats-inner">
            <dl className="stats-list">
              {t.stats.items.map((it) => (
                <div className="stat" key={it.label}>
                  <dt>{it.label}</dt>
                  <dd>
                    {it.value}
                    <small>{it.unit}</small>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="stats-note">{t.stats.note}</p>
          </div>
        </section>

        {/* Who we work with */}
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

        {/* Services */}
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
              </div>
              <div className="service-side chart">
                <p className="chart-title">{s.advirtual.chart.title}</p>
                <div className="bar-row">
                  <div className="bar-label">
                    <span>{s.advirtual.chart.ppl}</span>
                    <span>{s.advirtual.chart.pplValue}</span>
                  </div>
                  <div className="bar" aria-hidden="true" />
                </div>
                <div className="bar-row">
                  <div className="bar-label is-strong">
                    <span>{s.advirtual.chart.av}</span>
                    <span>{s.advirtual.chart.avValue}</span>
                  </div>
                  <div className="bar is-accent" aria-hidden="true" />
                </div>
                <dl className="cost">
                  <div>
                    <dt>{s.advirtual.chart.costPpl}</dt>
                    <dd>{s.advirtual.chart.costPplValue}</dd>
                  </div>
                  <div>
                    <dt>{s.advirtual.chart.costAv}</dt>
                    <dd>
                      <b>{s.advirtual.chart.costAvValue}</b>
                    </dd>
                  </div>
                </dl>
              </div>
            </article>

            <article className="service">
              <div className="service-copy">
                <p className="service-num">{s.shopping.num}</p>
                <h3>{s.shopping.name}</h3>
                <p className="service-tagline">{s.shopping.tagline}</p>
                <p className="service-body">{s.shopping.body}</p>
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
                  <Link className="link-arrow" href={applyPath(lang, "creator")}>
                    {t.apply.types.creator.short}
                    <ArrowRight />
                  </Link>
                  <a className="link-arrow" href={CONTACT.toProducts} target="_blank" rel="noopener noreferrer" style={{ color: "#444444", fontWeight: 700 }}>
                    {s.to.listLink}
                    <ArrowUpRight />
                  </a>
                </div>
              </div>
              <ol className="service-side steps">
                {s.to.steps.map((step, i) => (
                  <li key={step.title}>
                    <span className="steps-num" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="steps-text">
                      <b>{step.title}</b>
                      <span>{step.desc}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="container section team">
          <div className="team-head">
            <p className="eyebrow">{t.team.eyebrow}</p>
            <h2 className="h2">
              <Lines lines={t.team.title} />
            </h2>
            <p className="lead">{t.team.body}</p>
          </div>
          <ol className="timeline">
            {t.team.timeline.map((row) => (
              <li key={row.when}>
                <span className="timeline-when">{row.when}</span>
                <span className="timeline-what">
                  <span style={row.sub || row.strong ? { fontWeight: 700 } : undefined}>{row.what}</span>
                  {row.sub && <small>{row.sub}</small>}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Press */}
        <section className="container" aria-label={t.press.label} style={{ paddingBottom: 112 }}>
          <a className="press" href={CONTACT.press} target="_blank" rel="noopener noreferrer">
            <span className="press-text">
              <small>{t.press.label}</small>
              <b>{t.press.title}</b>
            </span>
            <span className="link-arrow">
              {t.press.cta}
              <ArrowUpRight />
            </span>
          </a>
        </section>

        {/* Contact */}
        <section id="contact" className="contact">
          <div className="container contact-inner">
            <div className="section-head" style={{ gap: 14 }}>
              <p className="eyebrow">{t.contact.eyebrow}</p>
              <h2>
                <Lines lines={t.contact.title} />
              </h2>
            </div>
            <div className="cards" style={{ gap: 16 }}>
              {t.contact.cards.map((c) => (
                <Link className="apply-card" key={c.type} href={applyPath(lang, c.type)}>
                  <small>{c.who}</small>
                  <b>
                    {c.label}
                    <ArrowRight size={20} />
                  </b>
                </Link>
              ))}
            </div>
            <div className="contact-links">
              <a href={CONTACT.kakao} target="_blank" rel="noopener noreferrer">
                <Chat />
                {t.contact.kakao}
              </a>
              <a href={`mailto:${CONTACT.email}`}>
                <Mail />
                {CONTACT.email}
              </a>
              <a href={`tel:${CONTACT.phoneTel}`}>
                <Phone />
                {CONTACT.phone}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
