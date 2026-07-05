// Набор линейных SVG-иконок (вместо эмодзи).
// Все иконки рисуются текущим цветом (currentColor) и принимают className,
// поэтому размер и цвет задаются обычными классами Tailwind, напр. <Play className="h-5 w-5" />.

// Общие свойства для линейных иконок
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
};

// Логотип платформы — «прицел-мишень» из концентрических элементов (без эмодзи)
export function Logo({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function Play({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M7 4.5v15l12-7.5-12-7.5Z" />
    </svg>
  );
}

export function Trophy({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
      <path d="M12 13v4M9 21h6M10 17h4" />
    </svg>
  );
}

export function Users({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.6M17 20a5.5 5.5 0 0 0-3-4.9" />
    </svg>
  );
}

export function Mic({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
    </svg>
  );
}

export function Clock({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function Plus({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Check({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M4 12.5 9 17.5 20 6.5" />
    </svg>
  );
}

export function Close({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function ArrowLeft({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M15 5l-7 7 7 7M8 12h11" />
    </svg>
  );
}

export function ArrowRight({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M9 5l7 7-7 7M16 12H5" />
    </svg>
  );
}

export function Bolt({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}

export function Flag({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
    </svg>
  );
}

// Спиннер-кольцо для состояний загрузки/ожидания
export function Loader({ className = "h-5 w-5" }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Layers({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 13l9 5 9-5M3 8v5m18-5v5" />
    </svg>
  );
}
