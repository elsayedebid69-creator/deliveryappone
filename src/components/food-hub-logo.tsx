interface FoodHubLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: "default" | "wordmark-only" | "monogram-only";
}

export function FoodHubLogo({
  size = 38,
  className = "",
  showText = true,
  variant = "default",
}: FoodHubLogoProps) {
  // Height calculated from size ratio
  const height = size;
  const wordmarkWidth = Math.round(size * 4.6);

  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 
        1. FH Monogram Logo: Crafted directly from the initials F and H, 
           interlocking into a culinary cloche and supersonic delivery symbol.
      */}
      {variant !== "wordmark-only" && (
        <div className="relative flex items-center justify-center shrink-0 group">
          <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_14px_rgba(245,158,11,0.5)]"
          >
            <defs>
              {/* Primary Golden-Amber Neon Gradient */}
              <linearGradient id="fh-letter-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="40%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              {/* Fiery Sunset Accent Gradient */}
              <linearGradient id="fh-letter-fire" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="60%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#FDE047" />
              </linearGradient>

              {/* Dark Cyber Capsule Background */}
              <linearGradient id="fh-bg-capsule" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#090D16" stopOpacity="0.98" />
              </linearGradient>

              {/* Glowing Filter */}
              <filter id="fh-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Geometric Beveled Hexagonal Plaque */}
            <rect
              x="3"
              y="3"
              width="58"
              height="58"
              rx="16"
              fill="url(#fh-bg-capsule)"
              stroke="url(#fh-letter-gold)"
              strokeWidth="2.2"
            />

            {/* Subtly Animated Tech Radar Grid Line */}
            <path
              d="M12 32H52"
              stroke="#F59E0B"
              strokeWidth="1"
              strokeOpacity="0.25"
              strokeDasharray="3 3"
            />

            {/* 
              Integrated F & H Letterforms:
              - Left pillar + top crossbars form 'F' (Food)
              - Middle bridging arc + right pillar form 'H' (Hub)
              - Center bridge forms the Gourmet Cloche Dome
            */}
            
            {/* 'F' Left Spine */}
            <path
              d="M18 16H30C34 16 36 18 36 21C36 24 33 26 29 26H18V48"
              stroke="url(#fh-letter-gold)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 'F' Middle Crossbar seamlessly morphing into Cloche Arch */}
            <path
              d="M18 32H30C36.6274 32 42 26.6274 42 20"
              stroke="url(#fh-letter-fire)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* 'H' Right Pillar & Connection */}
            <path
              d="M46 16V48"
              stroke="url(#fh-letter-gold)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* 'H' Crossbar Connecting F to H */}
            <path
              d="M32 32H46"
              stroke="url(#fh-letter-gold)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Glowing Golden Core Star in the heart of F-H */}
            <circle cx="32" cy="20" r="3" fill="#FEF08A" filter="url(#fh-glow-filter)" />
            <circle cx="32" cy="20" r="1.5" fill="#FFFFFF" />

            {/* Supersonic Speed Wing Accents */}
            <path
              d="M18 48L24 43"
              stroke="url(#fh-letter-gold)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M46 48L40 43"
              stroke="url(#fh-letter-gold)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Ambient Glow Aura */}
          <div className="absolute inset-0 -z-10 rounded-2xl bg-amber-500/25 blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* 
        2. Custom Typographic Wordmark for "FOODHUB":
           Crafted with sculpted lettering where the 'O's and 'HUB' create the visual identity.
      */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center tracking-wide leading-none">
            {/* Custom SVG Stylized Logotype Wordmark */}
            <svg
              height={height * 0.78}
              viewBox="0 0 220 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-auto h-7 sm:h-8 overflow-visible"
            >
              <defs>
                <linearGradient id="fh-text-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
                <linearGradient id="fh-text-white" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
              </defs>

              {/* Letter 'F' */}
              <path
                d="M4 6H24M4 6V34M4 20H20"
                stroke="url(#fh-text-white)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Letter 'O' 1 (Concentric Gourmet Ring) */}
              <circle
                cx="42"
                cy="20"
                r="13"
                stroke="url(#fh-text-gold)"
                strokeWidth="4.5"
              />
              <circle
                cx="42"
                cy="20"
                r="4.5"
                fill="url(#fh-text-gold)"
              />

              {/* Letter 'O' 2 (Cloche Dome & Dish) */}
              <circle
                cx="74"
                cy="20"
                r="13"
                stroke="url(#fh-text-gold)"
                strokeWidth="4.5"
              />
              <path
                d="M66 21C66 16.5 69.5 13 74 13C78.5 13 82 16.5 82 21H66Z"
                fill="url(#fh-text-gold)"
              />

              {/* Letter 'D' */}
              <path
                d="M96 6H107C115 6 121 12 121 20C121 28 115 34 107 34H96V6Z"
                stroke="url(#fh-text-white)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Divider Glow Arc */}
              <path
                d="M129 8L127 32"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeOpacity="0.5"
              />

              {/* HUB Badge Block / Letters */}
              {/* Letter 'H' */}
              <path
                d="M139 6V34M139 20H157M157 6V34"
                stroke="url(#fh-text-gold)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Letter 'U' */}
              <path
                d="M169 6V23C169 29.5 174 34 180.5 34C187 34 192 29.5 192 23V6"
                stroke="url(#fh-text-gold)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Letter 'B' */}
              <path
                d="M204 6H213C217 6 220 8.5 220 12.5C220 16 217.5 18.5 214 19.5C218 20.5 221 23.5 221 27.5C221 31.5 217.5 34 213 34H204V6ZM204 18H211M204 32H212"
                stroke="url(#fh-text-gold)"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Micro Tagline */}
          <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] tracking-[0.25em] text-slate-400 font-bold uppercase">
            <span>SMART LOGISTICS</span>
            <span className="size-1 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400">3.0</span>
          </div>
        </div>
      )}
    </span>
  );
}
