import type { Metadata } from "next";
import { ToCta, ToFooter, ToHeader } from "@/components/tosite/Chrome";
import { ArrowUpRight } from "@/components/Icons";
import { PressCard, StatsBand, SubHero, TeamSection } from "@/components/Sections";
import { CONTACT, getDict } from "@/lib/dictionary";
import { getPages } from "@/lib/pages";
import { WWW_URL } from "@/lib/tosite/site";

export const metadata: Metadata = {
  title: "회사소개",
  description: "티오(TO)를 운영하는 (주)대범한사람들을 소개합니다. 크리에이터와 브랜드가 소셜미디어 안에서 쉽게 커머스를 하도록 돕습니다.",
  alternates: { canonical: "/about" },
};

// 회사소개 — 홈페이지 회사소개 내용을 쓰되, 다른 서비스로 가는 링크는 홈페이지 절대 주소로
export default function ToAbout() {
  const p = getPages("ko").about;
  const s = getDict("ko").services;
  const services = [
    { num: s.advirtual.num, name: s.advirtual.name, tagline: s.advirtual.tagline, href: `${WWW_URL}/services/advirtual`, external: true },
    { num: s.shopping.num, name: s.shopping.name, tagline: s.shopping.tagline, href: `${WWW_URL}/services/shopping`, external: true },
    { num: s.to.num, name: s.to.name, tagline: s.to.tagline, href: "/", external: false },
  ];

  return (
    <>
      <ToHeader current="about" />
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
              {p.why.stats.map((x) => (
                <div key={x.label}>
                  <dt>{x.label}</dt>
                  <dd>{x.value}</dd>
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
          <ul className="to-svc">
            {services.map((x) => (
              <li key={x.num}>
                <a href={x.href} {...(x.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={x.external ? undefined : "is-here"}>
                  <small>{x.num}</small>
                  <b>{x.name}</b>
                  <span>{x.tagline}</span>
                  <em>
                    {x.external ? "홈페이지에서 보기" : "지금 보고 있는 서비스"}
                    {x.external && <ArrowUpRight />}
                  </em>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="container" style={{ paddingBottom: 48 }}>
          <div className="section-head">
            <p className="eyebrow">GROWTH</p>
            <h2 className="h2">{p.growthTitle}</h2>
            <p className="lead">{p.growthBody}</p>
          </div>
        </section>
        <StatsBand lang="ko" />

        <TeamSection lang="ko" />

        <section className="container" style={{ paddingBottom: 96 }}>
          <div className="closing">
            <p>{p.closing}</p>
            <p className="closing-sign">— {p.signature}</p>
          </div>
          <div style={{ marginTop: 48 }}>
            <PressCard lang="ko" />
          </div>
          <p className="to-side-note" style={{ marginTop: 32 }}>
            브랜드·광고 협업 문의는 <a href={`${WWW_URL}/#contact`}>대범한사람들 홈페이지</a>에서, 그 밖의 문의는 <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> · {CONTACT.phone} 로 연락해 주세요.
          </p>
        </section>

        <ToCta />
      </main>
      <ToFooter />
    </>
  );
}
