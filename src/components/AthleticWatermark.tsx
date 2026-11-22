import React, { useId } from 'react';

interface AthleticWatermarkProps {
  variant?: 'plate' | 'barbell' | 'hero-iron';
  className?: string;
}

/**
 * Bold, unmistakable low-opacity Olympic Weight Plate & Knurled Barbell graphic watermark
 * for athletic Iron Club hero banners and section headers.
 */
export const AthleticWatermark: React.FC<AthleticWatermarkProps> = ({
  variant = 'plate',
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');

  if (variant === 'hero-iron') {
    return (
      <svg
        viewBox="0 0 640 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={`pointer-events-none select-none ${className}`}
      >
        <defs>
          <pattern
            id={`hero-knurl-${uid}`}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 0L8 8M8 0L0 8"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeOpacity="0.65"
            />
          </pattern>
        </defs>

        {/* Faint Diagonal Athletic Speed Stripes Behind Iron Plate */}
        <g stroke="currentColor" strokeOpacity="0.22">
          <line x1="20" y1="340" x2="210" y2="0" strokeWidth="10" />
          <line x1="56" y1="340" x2="246" y2="0" strokeWidth="3" />
          <line x1="520" y1="340" x2="640" y2="126" strokeWidth="6" />
        </g>

        {/* Full-Width Horizontal Knurled Olympic Barbell Shaft & Collars */}
        <g transform="translate(0, 170)">
          <rect
            x="18"
            y="-7"
            width="604"
            height="14"
            rx="3"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          {/* Left & Right Diamond Knurling Grip Zones */}
          <rect x="68" y="-6" width="118" height="12" fill={`url(#hero-knurl-${uid})`} />
          <rect x="260" y="-6" width="76" height="12" fill={`url(#hero-knurl-${uid})`} />
          {/* IPF Grip Ring Marks */}
          <line x1="128" y1="-7" x2="128" y2="7" stroke="currentColor" strokeWidth="3" />
          <line x1="298" y1="-7" x2="298" y2="7" stroke="currentColor" strokeWidth="3" />
          {/* Machined Sleeve Flanges */}
          <rect x="44" y="-19" width="14" height="38" rx="3" stroke="currentColor" strokeWidth="2.4" />
          <rect x="576" y="-19" width="14" height="38" rx="3" stroke="currentColor" strokeWidth="2.4" />
        </g>

        {/* Bold Oversized Olympic 20KG Competition Bumper Plate */}
        <g transform="translate(465, 170)">
          {/* Outer Bumper Rubber Rim */}
          <circle cx="0" cy="0" r="146" stroke="currentColor" strokeWidth="5.5" />
          <circle cx="0" cy="0" r="134" stroke="currentColor" strokeWidth="2" strokeOpacity="0.7" />
          {/* Knurled Inner Flange Ring */}
          <circle
            cx="0"
            cy="0"
            r="116"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeDasharray="14 8"
          />
          {/* Inner Recessed Steel Plate Dish */}
          <circle cx="0" cy="0" r="78" stroke="currentColor" strokeWidth="3.2" />
          <circle cx="0" cy="0" r="68" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.6" />
          {/* Olympic 50mm Steel Hub & Bore */}
          <circle cx="0" cy="0" r="32" stroke="currentColor" strokeWidth="4.5" />
          <circle cx="0" cy="0" r="18" stroke="currentColor" strokeWidth="2.2" />
          {/* 6 Machined Structural Bolts Around Hub */}
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={deg}
                cx={Math.cos(rad) * 48}
                cy={Math.sin(rad) * 48}
                r="4.2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            );
          })}
          {/* 4 Bold Machined Weight-Plate Spokes */}
          <rect x="-8" y="-134" width="16" height="56" rx="4" stroke="currentColor" strokeWidth="2.2" />
          <rect x="-8" y="78" width="16" height="56" rx="4" stroke="currentColor" strokeWidth="2.2" />
          <rect x="-134" y="-8" width="56" height="16" rx="4" stroke="currentColor" strokeWidth="2.2" />
          <rect x="78" y="-8" width="56" height="16" rx="4" stroke="currentColor" strokeWidth="2.2" />
        </g>
      </svg>
    );
  }

  if (variant === 'barbell') {
    return (
      <svg
        viewBox="0 0 340 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={`pointer-events-none select-none ${className}`}
      >
        <defs>
          <pattern
            id={`bar-knurl-${uid}`}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 0L6 6M6 0L0 6" stroke="currentColor" strokeWidth="0.85" />
          </pattern>
        </defs>
        {/* Knurled center bar */}
        <rect x="18" y="66" width="304" height="8" rx="2" stroke="currentColor" strokeWidth="2.4" />
        <rect x="116" y="66.5" width="42" height="7" fill={`url(#bar-knurl-${uid})`} />
        <rect x="182" y="66.5" width="42" height="7" fill={`url(#bar-knurl-${uid})`} />
        {/* Left bumper plates */}
        <rect x="44" y="20" width="18" height="100" rx="4" stroke="currentColor" strokeWidth="2.8" />
        <rect x="68" y="30" width="13" height="80" rx="3" stroke="currentColor" strokeWidth="2.2" />
        <rect x="86" y="44" width="9" height="52" rx="2" stroke="currentColor" strokeWidth="2" />
        {/* Right bumper plates */}
        <rect x="278" y="20" width="18" height="100" rx="4" stroke="currentColor" strokeWidth="2.8" />
        <rect x="259" y="30" width="13" height="80" rx="3" stroke="currentColor" strokeWidth="2.2" />
        <rect x="245" y="44" width="9" height="52" rx="2" stroke="currentColor" strokeWidth="2" />
        {/* Collar flanges */}
        <rect x="102" y="54" width="7" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="231" y="54" width="7" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      {/* Outer Olympic bumper plate ring */}
      <circle cx="110" cy="110" r="98" stroke="currentColor" strokeWidth="3.2" />
      <circle cx="110" cy="110" r="84" stroke="currentColor" strokeWidth="1.5" strokeDasharray="10 6" />
      {/* Inner recessed ridge */}
      <circle cx="110" cy="110" r="56" stroke="currentColor" strokeWidth="2.4" />
      {/* Center steel sleeve bore */}
      <circle cx="110" cy="110" r="22" stroke="currentColor" strokeWidth="3.2" />
      <circle cx="110" cy="110" r="11" stroke="currentColor" strokeWidth="1.6" />
      {/* 4 machined grip spokes */}
      <rect x="104" y="24" width="12" height="32" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="104" y="164" width="12" height="32" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="24" y="104" width="32" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="164" y="104" width="32" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};
