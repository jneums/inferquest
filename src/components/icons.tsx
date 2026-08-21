/** Stroke SVG icons on a 16px grid, colored via currentColor. */

interface IconProps {
  size?: number;
  className?: string;
}

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

export function IconBolt({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M9 1 3 9h4l-1 6 6-8H8l1-6z" />
    </svg>
  );
}

export function IconLock({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="7" width="10" height="7" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function IconShield({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M8 1.5 13.5 4v4c0 3.2-2.3 5.5-5.5 6.5C4.8 13.5 2.5 11.2 2.5 8V4L8 1.5z" />
    </svg>
  );
}

export function IconCheck({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m2.5 8.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

export function IconFlame({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M8 1.5c1 2.5 4.5 4 4.5 8a4.5 4.5 0 0 1-9 0c0-2 1-3.5 2-4.5 0 1 .5 2 1.5 2.5C6.5 5.5 7 3.5 8 1.5z" />
    </svg>
  );
}

export function IconTrophy({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 2h6v4a3 3 0 0 1-6 0V2z" />
      <path d="M5 3H2.5v1A2.5 2.5 0 0 0 5 6.5M11 3h2.5v1A2.5 2.5 0 0 1 11 6.5" />
      <path d="M8 9v3M5.5 14h5M6.5 12h3" />
    </svg>
  );
}

export function IconCycle({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
      <path d="M13.5 1.5v3h-3" />
    </svg>
  );
}

export function IconEye({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

export function IconPlug({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 2v4M11 2v4M4 6h8v2a4 4 0 0 1-8 0V6z" />
      <path d="M8 12v2.5" />
    </svg>
  );
}

export function IconMerge({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="4" cy="3.5" r="1.8" />
      <circle cx="4" cy="12.5" r="1.8" />
      <circle cx="12" cy="8" r="1.8" />
      <path d="M4 5.3v5.4M4 7c0 2 2.5 3 6.2 3" />
    </svg>
  );
}

export function IconGrad({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m8 3 6.5 3L8 9 1.5 6 8 3z" />
      <path d="M4.5 7.5v3.5c0 1 1.5 2 3.5 2s3.5-1 3.5-2V7.5M14.5 6v3.5" />
    </svg>
  );
}

export function IconSun({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" />
    </svg>
  );
}

export function IconAlert({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M8 2 14.5 13.5h-13L8 2z" />
      <path d="M8 6.5v3M8 11.8v.2" />
    </svg>
  );
}

export function IconQuiz({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M6 6.2a2 2 0 1 1 2.7 1.9c-.5.2-.7.5-.7 1M8 11.3v.2" />
    </svg>
  );
}
