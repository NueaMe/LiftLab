import React, { useId } from 'react';
import { DailyEnergyMode } from '../types';

interface HeroBarbellStageSvgProps {
  energyMode: DailyEnergyMode;
}

interface FloatingParticle {
  id: number;
  cx: number;
  cy: number;
  r: number;
  color: string;
  duration: string;
  delay: string;
  dx: string;
  dy: string;
}

const PARTICLES: FloatingParticle[] = [
  { id: 1, cx: 148, cy: 190, r: 2.2, color: '#FF4500', duration: '6.8s', delay: '0s', dx: '12px', dy: '-34px' },
  { id: 2, cx: 230, cy: 360, r: 1.6, color: '#FACC15', duration: '8.2s', delay: '-2.1s', dx: '-10px', dy: '-42px' },
  { id: 3, cx: 326, cy: 145, r: 2.6, color: '#FF6B2B', duration: '7.4s', delay: '-1.3s', dx: '16px', dy: '-28px' },
  { id: 4, cx: 440, cy: 405, r: 1.8, color: '#F8FAFC', duration: '9.1s', delay: '-3.5s', dx: '-14px', dy: '-38px' },
  { id: 5, cx: 560, cy: 155, r: 2.0, color: '#FACC15', duration: '6.5s', delay: '-0.8s', dx: '10px', dy: '-36px' },
  { id: 6, cx: 685, cy: 390, r: 2.4, color: '#FF4500', duration: '7.9s', delay: '-4.2s', dx: '-12px', dy: '-44px' },
  { id: 7, cx: 790, cy: 180, r: 1.7, color: '#F8FAFC', duration: '8.6s', delay: '-1.9s', dx: '14px', dy: '-32px' },
  { id: 8, cx: 880, cy: 345, r: 2.3, color: '#FF4500', duration: '7.1s', delay: '-2.8s', dx: '-16px', dy: '-40px' },
  { id: 9, cx: 980, cy: 205, r: 1.9, color: '#FACC15', duration: '6.9s', delay: '-0.4s', dx: '11px', dy: '-30px' },
  { id: 10, cx: 1065, cy: 365, r: 2.1, color: '#FF6B2B', duration: '8.4s', delay: '-3.1s', dx: '-9px', dy: '-36px' },
  { id: 11, cx: 495, cy: 235, r: 1.5, color: '#F8FAFC', duration: '5.9s', delay: '-2.2s', dx: '8px', dy: '-26px' },
  { id: 12, cx: 635, cy: 220, r: 1.8, color: '#FACC15', duration: '7.6s', delay: '-4.8s', dx: '-11px', dy: '-31px' },
  { id: 13, cx: 380, cy: 310, r: 1.4, color: '#FF4500', duration: '6.4s', delay: '-1.6s', dx: '9px', dy: '-29px' },
  { id: 14, cx: 740, cy: 295, r: 1.5, color: '#F8FAFC', duration: '7.8s', delay: '-3.9s', dx: '-8px', dy: '-28px' },
];

/**
 * Dynamic, glowing 3D-styled Olympic Barbell & Gym Spotlight Centerpiece SVG.
 * Uses a two-layer responsive architecture:
 *  - Layer 1 (slice): Full-bleed studio spotlight cones, perspective floor grid, and chalk/ember particles.
 *  - Layer 2 (meet): Tightly framed Olympic barbell + Blaze Orange & Gold calibrated plates
 *    so the full barbell assembly stays dramatically visible on narrow mobile screens (< 640px).
 */
export const HeroBarbellStageSvg: React.FC<HeroBarbellStageSvgProps> = ({ energyMode }) => {
  const uid = useId().replace(/:/g, '');

  const isBeast = energyMode === 'beast';
  const isRecovery = energyMode === 'recovery';

  const primaryGlow = isRecovery ? '#38BDF8' : '#FF4500';
  const secondaryGlow = isBeast ? '#FACC15' : isRecovery ? '#7DD3FC' : '#FACC15';
  const beamOpacity = isBeast ? 0.36 : isRecovery ? 0.25 : 0.24;
  const plateRingAccent = isRecovery ? '#38BDF8' : '#FF4500';

  return (
    <div
      className="pointer-events-none select-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* LAYER 1: Full-Bleed Overhead Volumetric Spotlight, Floor Perspective & Particles */}
      <svg
        viewBox="0 0 1200 620"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <defs>
          {/* Main Volumetric Overhead Gym Spotlight Cone */}
          <radialGradient id={`hero-spot-${uid}`} cx="50%" cy="6%" r="72%" fx="50%" fy="2%">
            <stop offset="0%" stopColor={primaryGlow} stopOpacity={beamOpacity} />
            <stop offset="38%" stopColor={secondaryGlow} stopOpacity={isBeast ? '0.13' : '0.07'} />
            <stop offset="76%" stopColor="#090A0D" stopOpacity="0" />
          </radialGradient>

          {/* Diagonal Rim Light Beam Left */}
          <linearGradient id={`beam-l-${uid}`} x1="18%" y1="0%" x2="54%" y2="85%">
            <stop offset="0%" stopColor="#F8FAFC" stopOpacity={isBeast ? '0.14' : '0.09'} />
            <stop offset="42%" stopColor={primaryGlow} stopOpacity={isBeast ? '0.16' : '0.09'} />
            <stop offset="100%" stopColor="#090A0D" stopOpacity="0" />
          </linearGradient>

          {/* Diagonal Rim Light Beam Right */}
          <linearGradient id={`beam-r-${uid}`} x1="82%" y1="0%" x2="46%" y2="85%">
            <stop offset="0%" stopColor={secondaryGlow} stopOpacity={isBeast ? '0.14' : '0.09'} />
            <stop offset="45%" stopColor={primaryGlow} stopOpacity={isBeast ? '0.13' : '0.07'} />
            <stop offset="100%" stopColor="#090A0D" stopOpacity="0" />
          </linearGradient>

          {/* Stage Floor Horizon Glow */}
          <radialGradient id={`floor-glow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primaryGlow} stopOpacity={isBeast ? '0.32' : '0.2'} />
            <stop offset="55%" stopColor={secondaryGlow} stopOpacity="0.06" />
            <stop offset="100%" stopColor="#090A0D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Overhead Spotlight Field */}
        <rect width="1200" height="620" fill={`url(#hero-spot-${uid})`} />

        {/* Architectural Volumetric Light Cones */}
        <polygon points="120,0 440,0 710,620 260,620" fill={`url(#beam-l-${uid})`} />
        <polygon points="1080,0 760,0 490,620 940,620" fill={`url(#beam-r-${uid})`} />

        {/* Subtle Gym Platform Perspective Grid Floor */}
        <g opacity="0.22" stroke="rgba(148, 163, 184, 0.22)" strokeWidth="1">
          <line x1="0" y1="478" x2="1200" y2="478" stroke={primaryGlow} strokeOpacity="0.32" />
          <line x1="0" y1="506" x2="1200" y2="506" strokeOpacity="0.45" />
          <line x1="0" y1="544" x2="1200" y2="544" strokeOpacity="0.3" />
          <line x1="0" y1="592" x2="1200" y2="592" strokeOpacity="0.2" />
          {/* Perspective Vanishing Floor Lines */}
          <line x1="600" y1="478" x2="600" y2="620" strokeOpacity="0.4" />
          <line x1="470" y1="478" x2="360" y2="620" strokeOpacity="0.32" />
          <line x1="730" y1="478" x2="840" y2="620" strokeOpacity="0.32" />
          <line x1="330" y1="478" x2="120" y2="620" strokeOpacity="0.25" />
          <line x1="870" y1="478" x2="1080" y2="620" strokeOpacity="0.25" />
          <line x1="190" y1="478" x2="-110" y2="620" strokeOpacity="0.18" />
          <line x1="1010" y1="478" x2="1310" y2="620" strokeOpacity="0.18" />
        </g>

        {/* Floor Center Spotlight Reflection Pool */}
        <ellipse cx="600" cy="492" rx="430" ry="62" fill={`url(#floor-glow-${uid})`} />
        <ellipse cx="600" cy="486" rx="260" ry="18" fill={primaryGlow} opacity={isBeast ? '0.18' : '0.1'} />

        {/* Subtle Floating Chalk Dust & Ember Energy Particles */}
        <g>
          {PARTICLES.map((p) => (
            <circle
              key={p.id}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill={isRecovery && p.color === '#FF4500' ? '#38BDF8' : p.color}
              className="hero-particle"
              style={
                {
                  '--p-dur': p.duration,
                  '--p-delay': p.delay,
                  '--p-dx': p.dx,
                  '--p-dy': p.dy,
                } as React.CSSProperties
              }
            />
          ))}
        </g>
      </svg>

      {/* LAYER 2: Responsive Olympic Barbell & Calibrated Plates Centerpiece (Never Cropped on Mobile) */}
      <div className="absolute inset-x-0 top-1 sm:inset-0 h-[250px] sm:h-full flex items-center justify-center px-1.5 sm:px-6 lg:px-10">
        <svg
          viewBox="128 134 944 310"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full max-w-[1160px] overflow-visible"
        >
          <defs>
            {/* Brushed Chrome Olympic Shaft Metallic Gradient */}
            <linearGradient id={`shaft-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="22%" stopColor="#FFFFFF" />
              <stop offset="48%" stopColor="#CBD5E1" />
              <stop offset="76%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* 3D Sculpted Competition Bumper Plate Face Gradient */}
            <linearGradient id={`plate-dark-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#323B50" />
              <stop offset="45%" stopColor="#171C27" />
              <stop offset="100%" stopColor="#090B11" />
            </linearGradient>

            {/* Heated Blaze Orange / Energy Plate Side Rim */}
            <linearGradient id={`plate-blaze-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={secondaryGlow} />
              <stop offset="28%" stopColor={primaryGlow} />
              <stop offset="72%" stopColor={isRecovery ? '#0284C7' : '#C2270A'} />
              <stop offset="100%" stopColor="#260A06" />
            </linearGradient>

            {/* Championship Gold Calibrated Plate Accent Gradient */}
            <linearGradient id={`plate-gold-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="38%" stopColor="#FACC15" />
              <stop offset="78%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#422006" />
            </linearGradient>

            {/* Steel Collar Gradient */}
            <linearGradient id={`collar-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="32%" stopColor="#CBD5E1" />
              <stop offset="68%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>

            {/* Soft Ambient Plate Stack Halo */}
            <radialGradient id={`stack-aura-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={primaryGlow} stopOpacity={isBeast ? '0.42' : '0.3'} />
              <stop offset="52%" stopColor={secondaryGlow} stopOpacity="0.14" />
              <stop offset="100%" stopColor="#090A0D" stopOpacity="0" />
            </radialGradient>

            {/* Glow Blur Filter */}
            <filter id={`energy-blur-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="14" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Knurling Micro Pattern */}
            <pattern id={`knurl-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M0 0L6 6M6 0L0 6" stroke="rgba(15,23,42,0.58)" strokeWidth="0.95" />
            </pattern>
          </defs>

          {/* === 3D-STYLED OLYMPIC BARBELL CENTERPIECE (Subtle Levitation + Perspective Angle) === */}
          <g className="hero-barbell-float" opacity="0.96">
            {/* Dynamic Energy Halo Behind Center Barbell & Both Plate Stacks */}
            <ellipse
              cx="600"
              cy="288"
              rx="370"
              ry="74"
              fill={primaryGlow}
              opacity={isBeast ? '0.18' : '0.11'}
              filter={`url(#energy-blur-${uid})`}
            />
            <ellipse cx="268" cy="306" rx="135" ry="125" fill={`url(#stack-aura-${uid})`} />
            <ellipse cx="932" cy="270" rx="135" ry="125" fill={`url(#stack-aura-${uid})`} />

            {/* Tilted Dynamic 3D Perspective Group (-5.5deg athletic drama) */}
            <g transform="translate(600 288) rotate(-5.5) translate(-600 -288)">
              {/* Center Olympic Bar Shaft */}
              <rect
                x="166"
                y="279"
                width="868"
                height="18"
                rx="9"
                fill={`url(#shaft-${uid})`}
                stroke="rgba(255,255,255,0.34)"
                strokeWidth="0.9"
              />
              {/* Center & Grip Knurling Bands */}
              <rect x="538" y="279.5" width="124" height="17" fill={`url(#knurl-${uid})`} opacity="0.72" />
              <rect x="352" y="279.5" width="142" height="17" fill={`url(#knurl-${uid})`} opacity="0.75" />
              <rect x="706" y="279.5" width="142" height="17" fill={`url(#knurl-${uid})`} opacity="0.75" />
              {/* IWF Chrome Grip Rings */}
              <rect x="408" y="279" width="4.5" height="18" fill="#FFFFFF" opacity="0.92" />
              <rect x="787.5" y="279" width="4.5" height="18" fill="#FFFFFF" opacity="0.92" />

              {/* Specular Light Reflection Streak Along Shaft */}
              <line
                x1="280"
                y1="283"
                x2="920"
                y2="283"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeOpacity="0.78"
                strokeLinecap="round"
              />

              {/* LEFT SLEEVE ASSEMBLY (3D Extruded Perspective Calibrated Plates) */}
              <g>
                {/* Inner Sleeve Stop Flange */}
                <rect
                  x="312"
                  y="264"
                  width="16"
                  height="48"
                  rx="4"
                  fill={`url(#collar-${uid})`}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="0.9"
                />

                {/* Plate 1 (25KG Hero Blaze Orange Calibrated Plate - Closest to Center) */}
                <g>
                  {/* 3D Depth Extrusion Side */}
                  <rect x="275" y="172" width="35" height="232" rx="14" fill={`url(#plate-blaze-${uid})`} />
                  {/* Sculpted Dark Matte Face */}
                  <rect
                    x="281"
                    y="177"
                    width="27"
                    height="222"
                    rx="11"
                    fill={`url(#plate-dark-${uid})`}
                    stroke={plateRingAccent}
                    strokeOpacity="0.92"
                    strokeWidth="1.8"
                  />
                  {/* Glowing Blaze/Gold Rim Highlight */}
                  <line
                    x1="285"
                    y1="194"
                    x2="285"
                    y2="382"
                    stroke={secondaryGlow}
                    strokeOpacity="0.78"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Center Hub Ring */}
                  <rect x="290" y="263" width="11" height="50" rx="4" fill={`url(#collar-${uid})`} />
                </g>

                {/* Plate 2 (20KG Calibrated Plate) */}
                <g>
                  <rect
                    x="243"
                    y="188"
                    width="29"
                    height="200"
                    rx="12"
                    fill="#232A3B"
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth="1.2"
                  />
                  <rect x="248" y="193" width="22" height="190" rx="9" fill={`url(#plate-dark-${uid})`} />
                  <line
                    x1="251"
                    y1="209"
                    x2="251"
                    y2="367"
                    stroke="#F8FAFC"
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* Plate 3 (15KG Championship Gold Calibrated Plate) */}
                <g>
                  <rect x="215" y="206" width="25" height="164" rx="10" fill={`url(#plate-gold-${uid})`} />
                  <rect
                    x="219"
                    y="211"
                    width="19"
                    height="154"
                    rx="8"
                    fill={`url(#plate-dark-${uid})`}
                    stroke="#FACC15"
                    strokeOpacity="0.88"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="222"
                    y1="224"
                    x2="222"
                    y2="352"
                    stroke="#FEF08A"
                    strokeOpacity="0.72"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </g>

                {/* Plate 4 (10KG Outer Change Plate) */}
                <rect
                  x="194"
                  y="230"
                  width="18"
                  height="116"
                  rx="8"
                  fill="#1C2230"
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="1.1"
                />

                {/* Competition Locking Jaw Collar */}
                <rect
                  x="174"
                  y="266"
                  width="18"
                  height="44"
                  rx="5"
                  fill={`url(#plate-blaze-${uid})`}
                  stroke="rgba(255,255,255,0.48)"
                  strokeWidth="1"
                />
                {/* Left Chrome Sleeve Tip */}
                <rect
                  x="142"
                  y="273"
                  width="32"
                  height="30"
                  rx="5"
                  fill={`url(#collar-${uid})`}
                  stroke="rgba(255,255,255,0.32)"
                  strokeWidth="0.9"
                />
              </g>

              {/* RIGHT SLEEVE ASSEMBLY (Mirrored 3D Perspective Calibrated Plates) */}
              <g>
                {/* Inner Sleeve Stop Flange */}
                <rect
                  x="872"
                  y="264"
                  width="16"
                  height="48"
                  rx="4"
                  fill={`url(#collar-${uid})`}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="0.9"
                />

                {/* Plate 1 (25KG Hero Blaze Orange Calibrated Plate) */}
                <g>
                  <rect x="890" y="172" width="35" height="232" rx="14" fill={`url(#plate-blaze-${uid})`} />
                  <rect
                    x="892"
                    y="177"
                    width="27"
                    height="222"
                    rx="11"
                    fill={`url(#plate-dark-${uid})`}
                    stroke={plateRingAccent}
                    strokeOpacity="0.92"
                    strokeWidth="1.8"
                  />
                  <line
                    x1="915"
                    y1="194"
                    x2="915"
                    y2="382"
                    stroke={secondaryGlow}
                    strokeOpacity="0.78"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <rect x="899" y="263" width="11" height="50" rx="4" fill={`url(#collar-${uid})`} />
                </g>

                {/* Plate 2 (20KG Calibrated Plate) */}
                <g>
                  <rect
                    x="928"
                    y="188"
                    width="29"
                    height="200"
                    rx="12"
                    fill="#232A3B"
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth="1.2"
                  />
                  <rect x="930" y="193" width="22" height="190" rx="9" fill={`url(#plate-dark-${uid})`} />
                  <line
                    x1="949"
                    y1="209"
                    x2="949"
                    y2="367"
                    stroke="#F8FAFC"
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* Plate 3 (15KG Championship Gold Calibrated Plate) */}
                <g>
                  <rect x="960" y="206" width="25" height="164" rx="10" fill={`url(#plate-gold-${uid})`} />
                  <rect
                    x="962"
                    y="211"
                    width="19"
                    height="154"
                    rx="8"
                    fill={`url(#plate-dark-${uid})`}
                    stroke="#FACC15"
                    strokeOpacity="0.88"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="978"
                    y1="224"
                    x2="978"
                    y2="352"
                    stroke="#FEF08A"
                    strokeOpacity="0.72"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </g>

                {/* Plate 4 (10KG Outer Change Plate) */}
                <rect
                  x="988"
                  y="230"
                  width="18"
                  height="116"
                  rx="8"
                  fill="#1C2230"
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="1.1"
                />

                {/* Competition Locking Jaw Collar */}
                <rect
                  x="1008"
                  y="266"
                  width="18"
                  height="44"
                  rx="5"
                  fill={`url(#plate-blaze-${uid})`}
                  stroke="rgba(255,255,255,0.48)"
                  strokeWidth="1"
                />
                {/* Right Chrome Sleeve Tip */}
                <rect
                  x="1026"
                  y="273"
                  width="32"
                  height="30"
                  rx="5"
                  fill={`url(#collar-${uid})`}
                  stroke="rgba(255,255,255,0.32)"
                  strokeWidth="0.9"
                />
              </g>

              {/* Kinetic Energy Arcs Radiating From Barbell Center */}
              <path
                d="M 445 245 Q 600 218 755 245"
                fill="none"
                stroke={primaryGlow}
                strokeOpacity={isBeast ? '0.52' : '0.32'}
                strokeWidth="1.6"
                strokeDasharray="6 10"
              />
              <path
                d="M 465 332 Q 600 356 735 332"
                fill="none"
                stroke={secondaryGlow}
                strokeOpacity={isBeast ? '0.42' : '0.24'}
                strokeWidth="1.3"
                strokeDasharray="4 12"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* Bottom Atmospheric Fade Into Deep Carbon Canvas (#090A0D) */}
      <div className="absolute inset-x-0 bottom-0 h-32 sm:h-36 bg-gradient-to-t from-[#090A0D] via-[#090A0D]/72 to-transparent" />
      {/* Subtle Top Vignette Blending With Floating Header */}
      <div className="absolute inset-x-0 top-0 h-16 sm:h-24 bg-gradient-to-b from-[#090A0D]/62 to-transparent" />
    </div>
  );
};
