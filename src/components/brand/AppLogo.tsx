interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 28, className = '' }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" className="fill-primary-600" />
      <path
        d="M6 16h4l2-4 4 8 2-4h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gold-400"
      />
      <circle cx="6" cy="16" r="2" className="fill-emerald-400" />
      <circle cx="26" cy="16" r="2" className="fill-red-400" />
    </svg>
  );
}
