// 여러 페이지에서 함께 쓰는 섹션들
import Link from "next/link";
import type { Lang } from "@/lib/forms";
import { CONTACT, applyPath, getDict, pagePath } from "@/lib/dictionary";
import { ArrowRight, ArrowUpRight, Bag, Chat, Mail, Phone } from "./Icons";

export const Lines = ({ lines }: { lines: string[] }) => (
  <>
    {lines.map((l, i) => (
      <span key={l}>
        {l}
        {i < lines.length - 1 && <br />}
      </span>
    ))}
  </>
);

/** 서브 페이지 상단 */
export function SubHero({
  eyebrow,
  title,
  lead,
  children,
  aside,
}: {
  eyebrow: string;
  title: string[];
  lead: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="subhero">
      <div className="container subhero-inner">
        <div className="subhero-copy">
          <p className="hero-eyebrow">{eyebrow}</p>
          <h1>
            <Lines lines={title} />
          </h1>
          <p className="hero-body">{lead}</p>
          {children}
        </div>
        {aside}
      </div>
    </section>
  );
}

/** 애드버추얼 개념 예시 화면 */
export function MockFrame({ lang }: { lang: Lang }) {
  const m = getDict(lang).hero.mock;
  return (
    <figure className="mock">
      <div className="mock-frame" role="img" aria-label={m.alt}>
        <div className="mock-head" />
        <div className="mock-body" />
        <span className="mock-label">{m.video}</span>
        <div className="mock-ad">
          <span>{m.adTag}</span>
          <span>{m.adTitle}</span>
        </div>
        <div className="mock-shop">
          <span className="mock-shop-icon">
            <Bag />
          </span>
          <span className="mock-shop-text">
            <b>{m.shopTitle}</b>
            <small>{m.shopSub}</small>
          </span>
        </div>
        <div className="mock-progress" />
      </div>
      <figcaption>{m.caption}</figcaption>
    </figure>
  );
}

/** 주요 성과 띠 */
export function StatsBand({ lang }: { lang: Lang }) {
  const t = getDict(lang).stats;
  return (
    <section className="stats" aria-label={t.label}>
      <div className="container stats-inner">
        <dl className="stats-list">
          {t.items.map((it) => (
            <div className="stat" key={it.label}>
              <dt>{it.label}</dt>
              <dd>
                {it.value}
                <small>{it.unit}</small>
              </dd>
            </div>
          ))}
        </dl>
        <p className="stats-note">{t.note}</p>
      </div>
    </section>
  );
}

/** 애드버추얼 vs 기존 PPL 비교 */
export function AdvirtualChart({ lang }: { lang: Lang }) {
  const c = getDict(lang).services.advirtual.chart;
  return (
    <div className="service-side chart">
      <p className="chart-title">{c.title}</p>
      <div className="bar-row">
        <div className="bar-label">
          <span>{c.ppl}</span>
          <span>{c.pplValue}</span>
        </div>
        <div className="bar" aria-hidden="true" />
      </div>
      <div className="bar-row">
        <div className="bar-label is-strong">
          <span>{c.av}</span>
          <span>{c.avValue}</span>
        </div>
        <div className="bar is-accent" aria-hidden="true" />
      </div>
      <dl className="cost">
        <div>
          <dt>{c.costPpl}</dt>
          <dd>{c.costPplValue}</dd>
        </div>
        <div>
          <dt>{c.costAv}</dt>
          <dd>
            <b>{c.costAvValue}</b>
          </dd>
        </div>
      </dl>
    </div>
  );
}

/** 서비스 3종 카드 (회사소개 등에서 사용) */
export function ServiceCards({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const s = t.services;
  const items = [
    { num: "01", name: s.advirtual.name, tagline: s.advirtual.tagline, href: pagePath(lang, "services/advirtual") },
    { num: "02", name: s.shopping.name, tagline: s.shopping.tagline, href: pagePath(lang, "services/shopping") },
    { num: "03", name: s.to.name, tagline: s.to.tagline, href: pagePath(lang, "services/to") },
  ];
  return (
    <div className="cards">
      {items.map((it) => (
        <Link className="service-card" href={it.href} key={it.num}>
          <span className="service-card-num">{it.num}</span>
          <b>{it.name}</b>
          <span>{it.tagline}</span>
          <span className="link-arrow">
            {t.nav.more}
            <ArrowRight />
          </span>
        </Link>
      ))}
    </div>
  );
}

/** 팀 이력 */
export function TeamSection({ lang, more = false }: { lang: Lang; more?: boolean }) {
  const t = getDict(lang);
  return (
    <section id="team" className="container section team">
      <div className="team-head">
        <p className="eyebrow">{t.team.eyebrow}</p>
        <h2 className="h2">
          <Lines lines={t.team.title} />
        </h2>
        <p className="lead">{t.team.body}</p>
        {more && (
          <Link className="link-arrow" href={pagePath(lang, "about")}>
            {lang === "ko" ? "회사소개 자세히 보기" : "More about us"}
            <ArrowRight />
          </Link>
        )}
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
  );
}

/** 언론 보도 */
export function PressCard({ lang }: { lang: Lang }) {
  const t = getDict(lang).press;
  return (
    <a className="press" href={CONTACT.press} target="_blank" rel="noopener noreferrer">
      <span className="press-text">
        <small>{t.label}</small>
        <b>{t.title}</b>
      </span>
      <span className="link-arrow">
        {t.cta}
        <ArrowUpRight />
      </span>
    </a>
  );
}

/** 하단 협업 문의 — 신청서 3종 + 연락처 */
export function ContactSection({ lang }: { lang: Lang }) {
  const t = getDict(lang).contact;
  return (
    <section id="contact" className="contact">
      <div className="container contact-inner">
        <div className="section-head" style={{ gap: 14 }}>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2>
            <Lines lines={t.title} />
          </h2>
        </div>
        <div className="cards" style={{ gap: 16 }}>
          {t.cards.map((c) => (
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
            {t.kakao}
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
  );
}

/** 번호가 붙은 단계 목록 */
export function Steps({ steps, className = "" }: { steps: { title: string; desc: string }[]; className?: string }) {
  return (
    <ol className={`steps ${className}`}>
      {steps.map((step, i) => (
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
  );
}
