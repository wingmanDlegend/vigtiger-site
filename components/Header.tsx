import Link from "next/link";
import type { Lang } from "@/lib/forms";
import { getDict, homePath } from "@/lib/dictionary";

export default function Header({ lang, onHome = true }: { lang: Lang; onHome?: boolean }) {
  const t = getDict(lang);
  const home = homePath(lang);
  // 홈에서는 같은 페이지 앵커로, 신청서 페이지에서는 홈의 앵커로 이동
  const anchor = (id: string) => (onHome ? `#${id}` : `${home}#${id}`);
  const otherLang: Lang = lang === "ko" ? "en" : "ko";

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
          <a className="nav-section" href={anchor("about")}>{t.nav.about}</a>
          <a className="nav-section" href={anchor("services")}>{t.nav.services}</a>
          <a className="nav-section" href={anchor("team")}>{t.nav.team}</a>
          <a className="nav-section" href={anchor("contact")}>{t.nav.contact}</a>
          <Link className="nav-lang" href={homePath(otherLang)} hrefLang={otherLang} lang={otherLang}>
            {t.nav.switchTo}
          </Link>
          <a className="nav-cta" href={anchor("contact")}>{t.nav.cta}</a>
        </nav>
      </div>
    </header>
  );
}
