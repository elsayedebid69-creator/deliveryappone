interface FoodHubLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: "default" | "minimal" | "compact";
}

export function FoodHubLogo({
  size = 42,
  className = "",
  showText = true,
  variant = "default",
}: FoodHubLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Futuristic High-Tech Culinary Emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]"
        >
          <defs>
            {/* Primary Golden-Amber Gradient */}
            <linearGradient id="fh-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Electric Cyber Orange Gradient */}
            <linearGradient id="fh-fire-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>

            {/* Deep Glass Shield Gradient */}
            <linearGradient id="fh-shield-grad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
            </linearGradient>

            {/* Glowing Core Filter */}
            <filter id="fh-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Cyber Hexagon / Shield Frame */}
          <path
            d="M32 4L54 16.5V47.5L32 60L10 47.5V16.5L32 4Z"
            fill="url(#fh-shield-grad)"
            stroke="url(#fh-gold-grad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Geometric Tech Ring */}
          <path
            d="M32 9L50 19.5V44.5L32 55L14 44.5V19.5L32 9Z"
            stroke="#F59E0B"
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeDasharray="4 2"
          />

          {/* Futuristic Cloche Dome with Energy Arc */}
          <path
            d="M20 33C20 26.3726 25.3726 21 32 21C38.6274 21 44 26.3726 44 33"
            stroke="url(#fh-fire-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Glowing Cloche Base Platform */}
          <path
            d="M17 35.5H47"
            stroke="url(#fh-gold-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Energy Core Pulse / AI Signal */}
          <circle cx="32" cy="16" r="3.2" fill="url(#fh-gold-grad)" filter="url(#fh-glow)" />
          <circle cx="32" cy="16" r="1.5" fill="#FFFFFF" />

          {/* Speed / Radar Waves */}
          <path
            d="M24 41L32 46L40 41"
            stroke="url(#fh-gold-grad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27 47L32 50.5L37 47"
            stroke="url(#fh-gold-grad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.75"
          />
        </svg>

        {/* Ambient Pulsing Glow behind Icon */}
        <div className="absolute inset-0 -z-10 rounded-full bg-amber-500/25 blur-md" />
      </div>

      {/* Prominent & Futuristic Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-wider font-black">
            <span className="text-2xl sm:text-[26px] font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]">
              FOOD
            </span>
            <span className="text-2xl sm:text-[26px] font-black tracking-tight bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]">
              HUB
            </span>
            <span className="ms-1.5 inline-block size-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-pulse" />
          </div>
          {variant === "default" && (
            <span className="text-[9px] font-bold tracking-[0.25em] text-slate-400 uppercase font-mono mt-0.5">
              Smart Delivery 3.0
            </span>
          )}
        </div>
      )}
    </span>
  );
}
