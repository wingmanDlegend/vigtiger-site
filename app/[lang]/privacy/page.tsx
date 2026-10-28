import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { isLang } from "@/lib/dictionary";
import { getPages } from "@/lib/pages";
import { pageMetadata } from "@/lib/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMetadata(lang, "privacy", getPages(lang).privacy.meta);
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const p = getPages(lang).privacy;

  return (
    <>
      <Header lang={lang} />
      <main className="legal">
        <div className="legal-wrap">
          <h1>{p.title}</h1>
          <p className="note">{p.effective}</p>
          <p className="lead">{p.intro}</p>
          {p.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
