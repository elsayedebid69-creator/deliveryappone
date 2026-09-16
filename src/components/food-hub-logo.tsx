interface FoodHubLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function FoodHubLogo({
  size = 44,
  className = "",
  showText = true,
}: FoodHubLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 
        Food Delivery Emblem:
        Unmistakable symbol of fast food delivery combining a high-speed delivery scooter,
        a glowing golden cloche (covered hot meal), speed wind trails, and location pin.
      */}
      <div className="relative flex items-center justify-center shrink-0 group">
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_14px_rgba(245,158,11,0.55)]"
        >
          <defs>
            {/* Golden Amber Gradient for Cloche & Accents */}
            <linearGradient id="fh-deliv-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Fiery Electric Orange Gradient for Scooter & Motion */}
            <linearGradient id="fh-deliv-orange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Dark Shield Background */}
            <linearGradient id="fh-deliv-bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0B1120" stopOpacity="0.98" />
            </linearGradient>

            {/* Glowing Filter */}
            <filter id="fh-glow-deliv" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Futuristic Rounded Hexagonal Frame */}
          <rect
            x="3"
            y="3"
            width="58"
            height="58"
            rx="16"
            fill="url(#fh-deliv-bg)"
            stroke="url(#fh-deliv-gold)"
            strokeWidth="2.2"
          />

          {/* Dynamic Speed Lines (Left - Wind trails) */}
          <line x1="8" y1="20" x2="16" y2="20" stroke="url(#fh-deliv-gold)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="6" y1="26" x2="15" y2="26" stroke="url(#fh-deliv-orange)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="9" y1="32" x2="17" y2="32" stroke="url(#fh-deliv-gold)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

          {/* 
            --- DELIVERY SCOOTER & FOOD CLOCHE ---
          */}
          
          {/* Rear Delivery Box / Food Cloche Base */}
          <path
            d="M17 38C17 30 22 24 31 24C40 24 45 30 45 38H17Z"
            fill="url(#fh-deliv-gold)"
            opacity="0.2"
          />

          {/* Hot Food Cloche Dome (Icon of Delicious Meal) */}
          <path
            d="M20 38C20 30 25 24 33 24C41 24 46 30 46 38"
            stroke="url(#fh-deliv-gold)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Cloche Handle / Spark Top */}
          <circle cx="33" cy="21" r="2.8" fill="#FEF08A" filter="url(#fh-glow-deliv)" />
          <circle cx="33" cy="21" r="1.4" fill="#FFFFFF" />

          {/* Steam / Fresh Aroma Waves Rising from Dish */}
          <path
            d="M30 15C29 13 31 11 30 9"
            stroke="#FEF08A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M36 15C35 13 37 11 36 9"
            stroke="#FEF08A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Cloche Serving Platter Tray Line */}
          <line x1="16" y1="39" x2="50" y2="39" stroke="url(#fh-deliv-gold)" strokeWidth="3.2" strokeLinecap="round" />

          {/* Scooter Body Chassis (Connecting rear tray to front steering) */}
          <path
            d="M23 44H37L44 32H50"
            stroke="url(#fh-deliv-orange)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Scooter Front Handlebar */}
          <path
            d="M48 29L52 34"
            stroke="url(#fh-deliv-gold)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Rear Wheel (Glowing Neon Ring) */}
          <circle cx="23" cy="46" r="6" stroke="url(#fh-deliv-gold)" strokeWidth="2.8" />
          <circle cx="23" cy="46" r="2" fill="#FEF08A" />

          {/* Front Wheel (Glowing Neon Ring) */}
          <circle cx="46" cy="46" r="6" stroke="url(#fh-deliv-gold)" strokeWidth="2.8" />
          <circle cx="46" cy="46" r="2" fill="#FEF08A" />

          {/* Ground Speed Motion Streak */}
          <path
            d="M13 54H53"
            stroke="url(#fh-deliv-gold)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="4 3"
            opacity="0.6"
          />
        </svg>

        {/* Ambient Pulsing Glow behind Icon */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-amber-500/25 blur-lg opacity-80 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Prominent & Crisp Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center tracking-wide font-black">
            <span className="text-2xl sm:text-[26px] font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]">
              FOOD
            </span>
            <span className="text-2xl sm:text-[26px] font-black tracking-tight bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]">
              HUB
            </span>
            <span className="ms-1.5 inline-block size-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] tracking-[0.18em] text-slate-400 font-bold uppercase">
            <span className="text-amber-400">FOOD DELIVERY</span>
            <span className="size-1 rounded-full bg-amber-400" />
            <span>3.0</span>
          </div>
        </div>
      )}
    </span>
  );
}
