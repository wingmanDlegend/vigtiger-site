import { notFound, redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getApplication } from "@/lib/admin/db";
import { STATUS_LABEL, STATUS_STYLE, TYPE_LABEL, detailRows, kst } from "@/lib/admin/format";
import AdminTop from "../AdminTop";
import EditForm from "./EditForm";

export const dynamic = "force-dynamic";

export default async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) redirect("/admin/login");
  const { id } = await params;
  const a = await getApplication(id);
  if (!a) notFound();
  const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.new;

  const basic = [
    { label: "이름", value: a.name },
    { label: "이메일", value: a.email },
    { label: "연락처", value: a.phone ?? "-" },
    { label: "회사·채널", value: a.company ?? "-" },
    { label: "접수일시", value: kst(a.created_at) },
    { label: "신청 페이지", value: a.lang === "en" ? "영문" : "한국어" },
    { label: "개인정보 동의", value: a.privacy_agreed ? "동의함" : "-" },
  ];

  return (
    <>
      <AdminTop />
      <main className="a-wrap">
        <a className="a-back" href={`/admin?type=${a.type}`}>&larr; {TYPE_LABEL[a.type]} 목록으로</a>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <span className="a-type">{TYPE_LABEL[a.type]}</span>
          <h1 className="a-h1">{a.name}{a.company ? ` · ${a.company}` : ""}</h1>
          <span className="a-badge" style={{ background: st.bg, color: st.fg }}>{STATUS_LABEL[a.status]}</span>
        </div>

        <div className="a-detail">
          <div className="a-detail-main">
            <section className="a-card a-sec">
              <h2>신청자 정보</h2>
              <dl className="a-dl">
                {basic.map((r) => (
                  <div key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>
                      {r.label === "이메일" ? <a href={`mailto:${r.value}`}>{r.value}</a> : r.label === "연락처" && a.phone ? <a href={`tel:${a.phone}`}>{r.value}</a> : r.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="a-card a-sec">
              <h2>신청 내용</h2>
              <dl className="a-dl">
                {detailRows(a).map((r) => (
                  <div key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>
                      {/^https?:\/\//.test(r.value) ? <a href={r.value} target="_blank" rel="noopener noreferrer">{r.value}</a> : r.value || "-"}
                    </dd>
                  </div>
                ))}
              </dl>
              <h2 style={{ marginTop: 8 }}>남긴 메시지</h2>
              <p className="a-msg">{a.message || "없음"}</p>
            </section>
          </div>
          <aside className="a-detail-side">
            <EditForm id={a.id} status={a.status} note={a.admin_note ?? ""} updatedAt={kst(a.updated_at)} />
          </aside>
        </div>
      </main>
    </>
  );
}
