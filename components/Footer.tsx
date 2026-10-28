import Link from "next/link";
import type { Lang } from "@/lib/forms";
import { getDict, homePath, pagePath } from "@/lib/dictionary";

export default function Footer({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const home = homePath(lang);
  const otherLang: Lang = lang === "ko" ? "en" : "ko";
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-info">
          <b>{t.footer.company}</b>
          {t.footer.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <nav className="footer-nav" aria-label={t.nav.footerMenu}>
          <Link href={pagePath(lang, "about")}>{t.nav.about}</Link>
          <Link href={pagePath(lang, "services/advirtual")}>{t.nav.advirtual}</Link>
          <Link href={pagePath(lang, "services/shopping")}>{t.nav.shopping}</Link>
          <Link href={pagePath(lang, "services/to")}>{t.nav.to}</Link>
          <a href={`${home}#contact`}>{t.nav.contact}</a>
          <Link href={homePath(otherLang)} hrefLang={otherLang} lang={otherLang}>
            {t.nav.switchTo}
          </Link>
        </nav>
        <p className="footer-copy">
          <Link href={pagePath(lang, "privacy")} style={{ color: "#ffffff", fontWeight: 700, marginRight: 16 }}>
            {t.nav.privacy}
          </Link>
          {t.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
