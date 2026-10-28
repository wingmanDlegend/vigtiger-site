# 대범한사람들(VIGTIGER) 홈페이지

Next.js(App Router) 기반 회사 홈페이지입니다. GitHub에 푸시하면 Vercel이 자동으로 배포합니다.

## 페이지

| 주소 | 내용 |
| --- | --- |
| `/` | 한국어 홈 |
| `/en` | 영어 홈 |
| `/apply/creator`, `/en/apply/creator` | 크리에이터 비즈니스 상담 신청 |
| `/apply/advertiser`, `/en/apply/advertiser` | 광고주 광고 신청 |
| `/apply/partner`, `/en/apply/partner` | 상품 파트너 입점 신청 |
| `POST /api/apply` | 신청서 접수 → Supabase 저장 |

## 자주 고치는 곳

- **문구(한/영)**: `lib/dictionary.ts`
- **신청서 항목·선택지**: `lib/forms.ts` (화면과 서버 검증이 같은 정의를 씁니다)
- **색·글꼴·레이아웃**: `app/globals.css` (포인트 색은 `--accent`, 기본 글꼴은 Apple SD Gothic Neo, 대체 글꼴 Noto Sans KR)

## 신청서 접수 내역 보기

Supabase 프로젝트 `vigtiger-site` → Table Editor → `applications` 테이블에서 확인하고 CSV로 내보낼 수 있습니다.
`status` 컬럼(new / in_review / contacted / done / rejected)으로 처리 상태를 관리하세요.
테이블은 RLS로 "등록만" 허용되어 있어 웹사이트(공개 키)로는 접수 내역을 읽을 수 없습니다.

## 환경변수 (Vercel 프로젝트 설정)

| 이름 | 값 |
| --- | --- |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable(공개) 키 |
| `NEXT_PUBLIC_SITE_URL` | (선택) 정식 도메인 연결 후 `https://www.vigtiger.com` |

## 로컬 실행

```bash
cp .env.example .env.local   # 값 채우기
npm install
npm run dev                  # http://localhost:3000
```

## vigtiger.com 연결

Vercel 프로젝트 → Settings → Domains 에서 `vigtiger.com`, `www.vigtiger.com` 을 추가하고 안내되는 DNS 레코드를 도메인 관리 업체에 등록하면 됩니다. 연결 후 `NEXT_PUBLIC_SITE_URL` 도 설정하세요.
