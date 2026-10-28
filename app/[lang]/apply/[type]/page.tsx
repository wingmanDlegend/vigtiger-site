import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApplyForm from "@/components/ApplyForm";
import { FORM_TYPES, type FormType } from "@/lib/forms";
import { LANGS, applyPath, getDict, isLang } from "@/lib/dictionary";

export const dynamicParams = false;
export function generateStaticParams() {
  return LANGS.flatMap((lang) => FORM_TYPES.map((type) => ({ lang, type })));
}

const isType = (v: string): v is FormType => (FORM_TYPES as string[]).includes(v);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; type: string }>;
}): Promise<Metadata> {
  const { lang, type } = await params;
  if (!isLang(lang) || !isType(type)) return {};
  const t = getDict(lang);
  return {
    title: `${t.apply.types[type].title} — ${lang === "ko" ? "대범한사람들" : "VIGTIGER"}`,
    description: t.apply.types[type].intro,
    alternates: {
      canonical: applyPath(lang, type),
      languages: { ko: applyPath("ko", type), en: applyPath("en", type) },
    },
  };
}

export default async function ApplyPage({ params }: { params: Promise<{ lang: string; type: string }> }) {
  const { lang, type } = await params;
  if (!isLang(lang) || !isType(type)) notFound();
  const t = getDict(lang);
  const info = t.apply.types[type];

  return (
    <>
      <Header lang={lang} onHome={false} />
      <main className="apply-page">
        <div className="apply-wrap">
          <div className="apply-head">
            <p className="eyebrow">
              {t.apply.eyebrow} · {info.tag}
            </p>
            <h1>{info.title}</h1>
            <p className="lead">{info.intro}</p>
          </div>
          <nav className="apply-tabs" aria-label={t.apply.otherForms}>
            {FORM_TYPES.map((ft) => (
              <Link key={ft} href={applyPath(lang, ft)} aria-current={ft === type ? "page" : undefined}>
                {t.apply.types[ft].tag}
              </Link>
            ))}
          </nav>
          <ApplyForm lang={lang} type={type} />
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
