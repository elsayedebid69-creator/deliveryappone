interface FoodHubLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function FoodHubLogo({
  size = 42,
  className = "",
  showText = true,
}: FoodHubLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 
        Official FOODHUB App Badge:
        Vibrant golden-yellow squircle with a bold, rounded letter 'F' and top-right accent dot
      */}
      <div className="relative flex items-center justify-center shrink-0 group">
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(255,199,44,0.4)]"
        >
          {/* Vibrant Golden-Yellow Squircle Background */}
          <rect
            width="100"
            height="100"
            rx="28"
            fill="#FFC72C"
          />

          {/* 
            Official Letter 'F' in Espresso (#26160C) with smooth rounded geometry
          */}
          <path
            d="M25 21C25 17.6863 27.6863 15 31 15H64C67.3137 15 70 17.6863 70 21C70 24.3137 67.3137 27 64 27H37V41H57C60.3137 41 63 43.6863 63 47C63 50.3137 60.3137 53 57 53H37V75C37 78.3137 34.3137 81 31 81C27.6863 81 25 78.3137 25 75V21Z"
            fill="#26160C"
          />

          {/* Top-Right Accent Dot */}
          <circle cx="81" cy="21" r="6" fill="#26160C" />
        </svg>
      </div>

      {/* Clean, Bold, Minimalist Typography */}
      {showText && (
        <div dir="ltr" className="flex items-center tracking-tight font-black leading-none select-none">
          <span className="text-2xl sm:text-[25px] font-black tracking-tight text-slate-900 dark:text-white">
            FOOD
          </span>
          <span className="text-2xl sm:text-[25px] font-black tracking-tight text-[#FFC72C]">
            HUB
          </span>
        </div>
      )}
    </span>
  );
}
