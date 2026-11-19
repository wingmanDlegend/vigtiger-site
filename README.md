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
| `/insights` | 인사이트 첫 화면 — 업계 동향·Hot Contents 최신 글 (한국어 전용) |
| `/insights/trends`, `/insights/trends/YYYY-MM-DD` | 업계 동향 — 데일리 인플루언서 마케팅 기사 정리 |
| `/insights/hot`, `/insights/hot/YYYY-MM-DD` | Hot Contents — 전날 화제가 된 소셜 콘텐츠 추천 |
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

- 유형별 탭(크리에이터·광고주·상품 파트너)과 건수, 상태 필터, 이름·회사·이메일·연락처·관심 제품 검색
- 목록에서 바로 처리 상태 변경: 신규 → 검토 중 → 연락함 → 진행 확정 / 보류·종료
- 상세 화면: 신청 내용 전체(선택지는 한글 라벨로 표시), 내부 메모 저장, 신청 삭제(2단계 확인 후 영구 삭제 — 테스트·중복·스팸 정리용)
- 엑셀(CSV) 내려받기: 현재 보고 있는 탭·필터 그대로. 유형 탭에서 받으면 항목별로 칸이 나뉩니다.

### 관리자 메뉴 구조

왼쪽 사이드바(휴대폰에서는 위쪽 가로 메뉴), 로그인하면 **홈**부터 열립니다. 메뉴 옆 숫자는 처리할 일(신규 신청·정산 대기·검토 대기 초안)입니다.

| 그룹 | 메뉴 | 화면 |
| --- | --- | --- |
| 홈 | 홈 | `/admin/dashboard` 전체 업무 현황 |
| 비즈니스 | 제휴 신청 | 현황 `/admin/dashboard/applications` · 목록 `/admin` |
| 비즈니스 | 공동구매 | 현황 `/admin/dashboard/groupbuys` · 목록 `/admin/groupbuys` |
| 콘텐츠 | 업계 동향 | `/admin/insights?kind=trends` |
| 콘텐츠 | 핫 콘텐츠 | `/admin/insights?kind=hot` |

모든 화면 머리는 '그룹 → 제목(+도구) → 설명 → 탭(현황 · 목록)' 순서입니다. 메뉴 정의는 `lib/admin/nav.ts`.

### 대시보드

- **통합** `/admin/dashboard`: 오늘 확인할 일(신규 신청·정산 대기·오늘 인사이트 상태), 이번 달 vs 지난달 핵심 숫자, 월별 신청 수·공동구매 매출, 최근 신청·공동구매.
- **신청 접수** `/admin/dashboard/applications`: 기간(최근 30일·90일·올해·전체)별 유형·처리 단계·확정률, 월별 추이(유형 누적), 크리에이터 관심 서비스·구독자·카테고리·관심 제품, 광고주 예산·제품 카테고리.
- **공동구매** `/admin/dashboard/groupbuys`: 기간별 매출·회사 수익·건당 평균·전환율·정산 대기, 월별 매출·수익, 브랜드·크리에이터·플랫폼·제품 순위, 재진행 판단·진행 상태·정산 비율. 시작일 기준, 취소 건 제외.
- 모든 차트는 서버에서 그리는 가벼운 SVG/HTML(애니메이션 없음)이고, 막대에 마우스를 올리면 값이, '표로 보기'를 누르면 숫자 표가 나옵니다.

### 공동구매 결과 (`/admin/groupbuys`)

- 공동구매 한 건마다 기본 정보(브랜드·제품·크리에이터·플랫폼·기간·상태), 판매 실적(정가·공구가·판매 수량·총 매출), 수익 정산(크리에이터 수수료율·정산액·회사 수익·정산 완료·정산일), 콘텐츠 성과(링크·조회수·클릭 수), 재진행 판단(추천/보류/안 함·이유), 메모를 기록합니다.
- 총 매출을 비우면 공구가 × 판매 수량, 크리에이터 정산액을 비우면 총 매출 × 수수료율로 저장합니다. 할인율·전환율(판매÷클릭)은 화면에서 계산해 보여 줍니다.
- 목록 위에 건수·총 매출·판매 수량·정산액·회사 수익·정산 대기 합계(취소 제외), 아래에 브랜드·크리에이터별 매출 TOP 5가 나옵니다. 상태·연도·검색·정산 대기 필터, CSV 내려받기 지원.
- **엑셀 업로드**: `/admin/groupbuys/import` 에서 .xlsx 또는 CSV를 올리면 머리글을 자동 인식(예: 매출액→총 매출, 수수료율→크리에이터 수수료율)하고 줄별 오류를 미리 보여 줍니다. 한 줄이라도 오류가 있으면 저장하지 않습니다. 양식은 `/admin/groupbuys/template`.
- 데이터는 Supabase `groupbuys` 테이블에 있고, 공개 키로는 읽을 수 없습니다(서버의 secret 키로만 접근).

새 신청이 저장되면 `SLACK_WEBHOOK_URL` 로 지정한 슬랙 채널에 알림이 가고, 알림의 버튼으로 해당 신청의 관리자 화면을 바로 열 수 있습니다. 알림이 실패해도 접수는 정상 저장됩니다.

데이터는 Supabase 프로젝트 `vigtiger-site` 의 `applications` 테이블에 있습니다.
테이블은 RLS로 "등록만" 허용되어 있어 공개 키로는 읽을 수 없고, 관리자 페이지는 서버에서 비밀 키로만 조회합니다.

## 인사이트 (업계 동향 · Hot Contents)

- 평일 아침 예약 작업 두 개가 초안을 Supabase `insight_posts` 테이블에 넣습니다 (`status = draft`). `kind` 가 `trends`(업계 동향: 기사 정리) 또는 `hot`(Hot Contents: 전날 화제 콘텐츠)이고, 같은 날짜에 종류별로 1건씩입니다.
- Hot Contents 항목에는 플랫폼·채널·확인된 반응 수치·왜 떴나·활용 포인트·관련 기사 링크가 들어갑니다. 원본 게시물은 링크로만 연결하고 썸네일·영상은 옮기지 않습니다.
- 관리자 페이지 `/admin/insights` 에서 제목·도입·기사 요약·'대범한사람들의 시선'을 고치고, 기사를 빼거나 순서를 바꾼 뒤 **저장하고 게시**를 누르면 `/insights` 에 올라갑니다. 게시 취소·삭제도 같은 화면에서 합니다.
- 평일 오전 9시 30분에 예약 작업이 그날 아직 게시되지 않은 초안을 자동 게시합니다. 그 전에 관리자 페이지에서 고치거나 게시 취소·삭제할 수 있습니다.
- 한국어 홈의 **Today's Issue** 섹션은 업계 동향·Hot Contents의 가장 최근 게시 글을 보여 줍니다(5분 캐시, 관리자 게시 시 즉시 갱신).
- 공개 키로는 게시된 글만 읽을 수 있습니다(RLS). 홈페이지는 5분마다, 게시 버튼을 누르면 즉시 새로 고칩니다.
- 요약은 원문을 옮기지 않고 2~3문장으로 새로 쓰고, 원문 링크와 언론사를 꼭 남깁니다.

## 환경변수 (Vercel 프로젝트 설정)

| 이름 | 값 | 용도 |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase 프로젝트 URL | 공통 |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable(공개) 키 | 신청서 등록 |
| `SUPABASE_SECRET_KEY` | Supabase secret 키 (`sb_secret_…`), **Sensitive** 로 저장 | 관리자 페이지 조회·수정 |
| `ADMIN_PASSWORD` | 관리자 페이지 비밀번호, **Sensitive** 로 저장 | 관리자 로그인 |
| `SLACK_WEBHOOK_URL` | (선택) 슬랙 Incoming Webhook 주소, **Sensitive** 로 저장 | 새 신청 슬랙 알림 |
| `NEXT_PUBLIC_GA_ID` | (선택) GA4 측정 ID. 비우면 코드 기본값 `G-17F4EG2VG3`(Google 태그 ID) 사용 | 방문 분석 |
| `NEXT_PUBLIC_SITE_URL` | (선택) 대표 주소. 기본값 `https://vigtiger.com` | SEO |

비밀번호나 secret 키를 바꾸면 기존 관리자 로그인은 모두 풀립니다.

## 방문 분석 (Google Analytics 4)

공개 페이지(한/영)에 Google 태그 `G-17F4EG2VG3` 이 실립니다(`components/Analytics.tsx`). 데이터는 GA4 속성 `G-17F4EG2VG3` 에 쌓입니다. 측정 ID가 아닌 **태그 ID**를 넣어야 하며, 대상 ID만 넣으면 스크립트가 404로 실패합니다. 다른 속성으로 바꾸려면 `NEXT_PUBLIC_GA_ID` 를 설정하고 다시 배포하세요. 관리자 페이지에는 싣지 않습니다.

- 페이지 이동은 GA4 '향상된 측정'의 브라우저 기록 기반 페이지 변경으로 자동 집계됩니다.
- 신청서 접수에 성공하면 `generate_lead` 이벤트를 보냅니다 (매개변수 `form_type`: creator·advertiser·partner, `form_lang`: ko·en). 이름·연락처 등 개인정보는 보내지 않습니다.
- 개인정보처리방침 6조에 쿠키·행태정보 수집과 거부 방법을 적어 두었습니다.

## 로컬 실행

```bash
cp .env.example .env.local   # 값 채우기
npm install
npm run dev                  # http://localhost:3000
```

## vigtiger.com 연결

Vercel 프로젝트 → Settings → Domains 에서 `vigtiger.com`, `www.vigtiger.com` 을 추가하고 안내되는 DNS 레코드를 도메인 관리 업체에 등록하면 됩니다. 연결 후 `NEXT_PUBLIC_SITE_URL` 도 설정하세요.
