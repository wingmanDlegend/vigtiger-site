# 대범한사람들(VIGTIGER) 홈페이지

Next.js(App Router) 기반 회사 홈페이지입니다. GitHub에 푸시하면 Vercel이 자동으로 배포합니다.

## 페이지

한국어는 접두사 없이, 영어는 `/en` 을 붙입니다. (예: `/services/to` ↔ `/en/services/to`)

| 주소 | 내용 |
| --- | --- |
| `/` | 홈 |
| `/about` | 회사소개 |
| `/services/advirtual` | 애드버추얼 |
| `/services/shopping` | 쇼핑올인원 |
| `/services/to` | 티오(TO) |
| `/apply/creator` | 크리에이터 비즈니스 상담 신청 |
| `/apply/advertiser` | 광고주 광고 신청 |
| `/apply/partner` | 상품 파트너 입점 신청 |
| `/privacy` | 개인정보처리방침 |
| `POST /api/apply` | 신청서 접수 → Supabase 저장 |

신청서 주소에 `?interest=to` 처럼 붙이면 관심 서비스가 미리 체크됩니다 (`advirtual`, `shopping`, `to`).
기존 vigtiger.com(Notion) 페이지 주소는 `next.config.ts` 에서 새 페이지로 영구 리디렉션됩니다.

## 자주 고치는 곳

- **홈·공통 문구(한/영)**: `lib/dictionary.ts`
- **서브 페이지 문구(한/영)**: `lib/pages.ts`
- **신청서 항목·선택지**: `lib/forms.ts` (화면과 서버 검증이 같은 정의를 씁니다)
- **색·글꼴·레이아웃**: `app/globals.css` (포인트 색은 `--accent`, 기본 글꼴은 Apple SD Gothic Neo, 대체 글꼴 Noto Sans KR)

## 관리자 페이지 (신청 접수 관리)

`https://vigtiger.com/admin` 에서 비밀번호(`ADMIN_PASSWORD`)로 로그인합니다. 검색엔진에는 노출되지 않습니다.

- 유형별 탭(크리에이터·광고주·상품 파트너)과 건수, 상태 필터, 이름·회사·이메일·연락처 검색
- 목록에서 바로 처리 상태 변경: 신규 → 검토 중 → 연락함 → 진행 확정 / 보류·종료
- 상세 화면: 신청 내용 전체(선택지는 한글 라벨로 표시), 내부 메모 저장
- 엑셀(CSV) 내려받기: 현재 보고 있는 탭·필터 그대로. 유형 탭에서 받으면 항목별로 칸이 나뉩니다.

새 신청이 저장되면 `SLACK_WEBHOOK_URL` 로 지정한 슬랙 채널에 알림이 가고, 알림의 버튼으로 해당 신청의 관리자 화면을 바로 열 수 있습니다. 알림이 실패해도 접수는 정상 저장됩니다.

데이터는 Supabase 프로젝트 `vigtiger-site` 의 `applications` 테이블에 있습니다.
테이블은 RLS로 "등록만" 허용되어 있어 공개 키로는 읽을 수 없고, 관리자 페이지는 서버에서 비밀 키로만 조회합니다.

## 환경변수 (Vercel 프로젝트 설정)

| 이름 | 값 | 용도 |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase 프로젝트 URL | 공통 |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable(공개) 키 | 신청서 등록 |
| `SUPABASE_SECRET_KEY` | Supabase secret 키 (`sb_secret_…`), **Sensitive** 로 저장 | 관리자 페이지 조회·수정 |
| `ADMIN_PASSWORD` | 관리자 페이지 비밀번호, **Sensitive** 로 저장 | 관리자 로그인 |
| `SLACK_WEBHOOK_URL` | (선택) 슬랙 Incoming Webhook 주소, **Sensitive** 로 저장 | 새 신청 슬랙 알림 |
| `NEXT_PUBLIC_SITE_URL` | (선택) 대표 주소. 기본값 `https://vigtiger.com` | SEO |

비밀번호나 secret 키를 바꾸면 기존 관리자 로그인은 모두 풀립니다.

## 로컬 실행

```bash
cp .env.example .env.local   # 값 채우기
npm install
npm run dev                  # http://localhost:3000
```

## vigtiger.com 연결

Vercel 프로젝트 → Settings → Domains 에서 `vigtiger.com`, `www.vigtiger.com` 을 추가하고 안내되는 DNS 레코드를 도메인 관리 업체에 등록하면 됩니다. 연결 후 `NEXT_PUBLIC_SITE_URL` 도 설정하세요.
