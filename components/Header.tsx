import Link from "next/link";
import type { Lang } from "@/lib/forms";
import { getDict, homePath, pagePath } from "@/lib/dictionary";

export default function Header({ lang, onHome = false }: { lang: Lang; onHome?: boolean }) {
  const t = getDict(lang);
  const home = homePath(lang);
  const otherLang: Lang = lang === "ko" ? "en" : "ko";
  const contact = onHome ? "#contact" : `${home}#contact`;

  const links = [
    { href: pagePath(lang, "about"), label: t.nav.about },
    { href: pagePath(lang, "services/advirtual"), label: t.nav.advirtual },
    { href: pagePath(lang, "services/shopping"), label: t.nav.shopping },
    { href: pagePath(lang, "services/to"), label: t.nav.to },
    { href: contact, label: t.nav.contact },
  ];

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href={home} className="logo" aria-label={lang === "ko" ? "대범한사람들 홈" : "VIGTIGER home"}>
          <span className="logo-mark" aria-hidden="true">
            V
          </span>
          <span className="logo-text">
            <b>{lang === "ko" ? "대범한사람들" : "VIGTIGER"}</b>
            <small>{lang === "ko" ? "VIGTIGER" : "대범한사람들"}</small>
          </span>
        </Link>

        <nav className="nav" aria-label={t.nav.menu}>
          {links.map((l) => (
            <Link key={l.href} className="nav-section" href={l.href}>
              {l.label}
            </Link>
          ))}
          <Link className="nav-lang" href={homePath(otherLang)} hrefLang={otherLang} lang={otherLang}>
            {t.nav.switchTo}
          </Link>
          <a className="nav-cta" href={contact}>
            {t.nav.cta}
          </a>
          {/* 휴대폰 화면용 메뉴 */}
          <details className="nav-mobile">
            <summary>{t.nav.mobileMenu}</summary>
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </details>
        </nav>
      </div>
    </header>
  );
}
