import Link from "next/link";
import type { Lang } from "@/lib/forms";
import { getDict, homePath } from "@/lib/dictionary";

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
          <a href={`${home}#about`}>{t.nav.about}</a>
          <a href={`${home}#services`}>{t.nav.services}</a>
          <a href={`${home}#contact`}>{t.nav.contact}</a>
          <Link href={homePath(otherLang)} hrefLang={otherLang} lang={otherLang}>
            {t.nav.switchTo}
          </Link>
        </nav>
        <p className="footer-copy">{t.footer.copyright}</p>
      </div>
    </footer>
  );
}
