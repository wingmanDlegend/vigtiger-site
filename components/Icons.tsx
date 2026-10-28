type P = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "icon",
});

export const ArrowRight = ({ size = 16 }: P) => (
  <svg {...base(size)} strokeWidth={2.4}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

export const ArrowUpRight = ({ size = 16 }: P) => (
  <svg {...base(size)} strokeWidth={2.4}>
    <path d="M7 17L17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export const Bag = ({ size = 16 }: P) => (
  <svg {...base(size)} strokeWidth={2}>
    <path d="M6 7h12l-1 13H7L6 7z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
);

export const Chat = ({ size = 18 }: P) => (
  <svg {...base(size)} strokeWidth={2}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.2-4.4A8 8 0 1 1 21 12z" />
  </svg>
);

export const Mail = ({ size = 18 }: P) => (
  <svg {...base(size)} strokeWidth={2}>
    <path d="M3 6h18v12H3z" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

export const Phone = ({ size = 18 }: P) => (
  <svg {...base(size)} strokeWidth={2}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);

export const Check = ({ size = 26 }: P) => (
  <svg {...base(size)} strokeWidth={3}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
