interface FoodHubLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function FoodHubLogo({ size = 36, className = "", showText = false }: FoodHubLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Map pin shape */}
        <path
          d="M32 4C18.745 4 8 14.745 8 28c0 18 24 32 24 32s24-14 24-32C56 14.745 45.255 4 32 4z"
          fill="#2B1B12"
        />
        {/* Inner circle (cloche area) */}
        <circle cx="32" cy="27" r="14" fill="#FFFDF7" />
        {/* Cloche dome */}
        <path
          d="M22 30c0-5.523 4.477-10 10-10s10 4.477 10 10"
          stroke="#2B1B12"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Cloche base line */}
        <line x1="21" y1="30" x2="43" y2="30" stroke="#2B1B12" strokeWidth="2.5" strokeLinecap="round" />
        {/* Cloche knob */}
        <circle cx="32" cy="19" r="2" fill="#2B1B12" />
        {/* Speed lines (left side) */}
        <line x1="8" y1="20" x2="16" y2="20" stroke="#2B1B12" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="5" y1="26" x2="15" y2="26" stroke="#2B1B12" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="8" y1="32" x2="16" y2="32" stroke="#2B1B12" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="11" y1="38" x2="18" y2="38" stroke="#2B1B12" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold tracking-tight text-[#2B1B12]">
            FOOD HUB
          </span>
        </span>
      )}
    </span>
  );
}
