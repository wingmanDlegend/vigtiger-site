// 대범한사람들 호랑이 캐릭터 (자체 제작 일러스트)
export default function Tiger({
  mood = "happy",
  size = 96,
  className = "",
  title,
}: {
  mood?: "happy" | "roar" | "wink";
  size?: number;
  className?: string;
  title?: string;
}) {
  const ink = "#111111";
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {/* 귀 */}
      <circle cx="27" cy="30" r="15" fill="#ff6a1f" />
      <circle cx="93" cy="30" r="15" fill="#ff6a1f" />
      <circle cx="27" cy="30" r="7.5" fill="#ffe1cc" />
      <circle cx="93" cy="30" r="7.5" fill="#ffe1cc" />
      {/* 얼굴 */}
      <ellipse cx="60" cy="64" rx="45" ry="41" fill="#ff7a2e" />
      {/* 이마 줄무늬 */}
      <path d="M60 24 v15" stroke={ink} strokeWidth="6" strokeLinecap="round" />
      <path d="M47 27 l3 10" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M73 27 l-3 10" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      {/* 볼 줄무늬 */}
      <path d="M16 56 l14 3" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M17 70 l12 -1" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M104 56 l-14 3" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M103 70 l-12 -1" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      {/* 주둥이 */}
      <ellipse cx="60" cy="82" rx="24" ry="18" fill="#ffffff" />
      {/* 눈 */}
      {mood === "roar" ? (
        <>
          <path d="M38 58 l10 4 l-10 4" fill="none" stroke={ink} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M82 58 l-10 4 l10 4" fill="none" stroke={ink} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <circle cx="44" cy="61" r="5.5" fill={ink} />
          <circle cx="45.8" cy="59.2" r="1.7" fill="#fff" />
          {mood === "wink" ? (
            <path d="M70 62 q6 -5 12 0" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
          ) : (
            <>
              <circle cx="76" cy="61" r="5.5" fill={ink} />
              <circle cx="77.8" cy="59.2" r="1.7" fill="#fff" />
            </>
          )}
        </>
      )}
      {/* 코 */}
      <path d="M53 72 h14 q-2 6 -7 7 q-5 -1 -7 -7z" fill={ink} />
      {/* 입 */}
      {mood === "roar" ? (
        <>
          <ellipse cx="60" cy="89" rx="11" ry="9" fill="#5a1400" />
          <ellipse cx="60" cy="93" rx="6.5" ry="4" fill="#ff8f8f" />
          <path d="M52 82 l2.5 5 l2.5 -5z M63 82 l2.5 5 l2.5 -5z" fill="#fff" />
        </>
      ) : (
        <path d="M60 79 v3 q-5 7 -11 3 M60 82 q5 7 11 3" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
}
