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
        HungerStation-style Iconic App Badge:
        Vibrant, appetizing golden-yellow squircle with a bold, solid, heavy letter 'F' (FoodHub)
      */}
      <div className="relative flex items-center justify-center shrink-0 group">
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(255,199,44,0.4)]"
        >
          {/* Signature Vibrant Golden-Yellow Squircle Background (Like HungerStation Yellow) */}
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="16"
            fill="#FFC72C"
          />

          {/* 
            Ultra-Bold Iconic Letter 'F' in Rich Dark Espresso/Chocolate (#26160C)
            Clean, solid, powerful, and unmistakable.
          */}
          {/* Vertical Spine */}
          <rect
            x="17"
            y="14"
            width="10"
            height="36"
            rx="3"
            fill="#26160C"
          />

          {/* Top Horizontal Bar */}
          <rect
            x="17"
            y="14"
            width="28"
            height="9.5"
            rx="3"
            fill="#26160C"
          />

          {/* Middle Horizontal Bar with subtle food/speed dynamic bevel */}
          <rect
            x="17"
            y="28"
            width="22"
            height="9"
            rx="2.5"
            fill="#26160C"
          />

          {/* Subtle Smile / Plate Spark Accent in Top-Right Corner */}
          <circle cx="49" cy="18.5" r="3" fill="#26160C" />
        </svg>
      </div>

      {/* Clean, Bold, Minimalist Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div dir="ltr" className="flex items-center tracking-tight font-black">
            <span className="text-2xl sm:text-[25px] font-black tracking-tight text-white">
              FOOD
            </span>
            <span className="text-2xl sm:text-[25px] font-black tracking-tight text-[#FFC72C]">
              HUB
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider mt-0.5">
            فودهب لتوصيل الطعام
          </span>
        </div>
      )}
    </span>
  );
}
