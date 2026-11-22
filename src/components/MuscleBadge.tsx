import React, { useId } from 'react';
import { MuscleGroup } from '../types';

/**
 * Sharp geometric athletic barbell/dumbbell emblem for the LIFTLAB brand mark.
 */
export const LiftLabLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    {/* Machined Matte Iron Container with Brushed Steel Edge */}
    <rect
      x="1"
      y="1"
      width="34"
      height="34"
      rx="9"
      fill="#141418"
      stroke="rgba(228,228,231,0.28)"
      strokeWidth="1.5"
    />
    {/* Left plates (Blaze Orange-Red + Brushed Steel) */}
    <rect x="6" y="10" width="3.5" height="16" rx="1.2" fill="#FF4500" />
    <rect x="10.5" y="12.5" width="2.5" height="11" rx="1" fill="#E4E4E7" />
    {/* Center knurled barbell shaft (Championship Gold) */}
    <rect x="13" y="16.5" width="10" height="3" rx="0.75" fill="#FACC15" />
    {/* Right plates (Brushed Steel + Blaze Orange-Red) */}
    <rect x="23" y="12.5" width="2.5" height="11" rx="1" fill="#E4E4E7" />
    <rect x="26.5" y="10" width="3.5" height="16" rx="1.2" fill="#FF4500" />
  </svg>
);

interface AnatomicalMuscleIconProps {
  muscle: MuscleGroup;
  className?: string;
  activeGlow?: boolean;
  showSecondary?: boolean;
}

/**
 * High-Detail 3D Studio Anatomical Muscle Illustrations (viewBox 0 0 120 120).
 * Inspired by Hevy, Strong, and Nike Training Club dark-studio anatomical plates:
 * - Sculpted athletic torso/limbs with subtle studio rim lighting & vignette edge dissolve
 * - Primary target muscles glowing in Blaze Orange (#FF4500) with fine fiber striations
 * - Secondary synergist muscles shaded in cool cyan (#38BDF8) for immediate anatomical clarity
 */
export const AnatomicalMuscleIcon: React.FC<AnatomicalMuscleIconProps> = ({
  muscle,
  className = 'w-12 h-12',
  activeGlow = true,
  showSecondary = true,
}) => {
  const uid = useId().replace(/:/g, '');
  const maskId = `anat-vignette-${muscle}-${uid}`;
  const radialFadeId = `anat-radfade-${muscle}-${uid}`;
  const vertFadeId = `anat-vertfade-${muscle}-${uid}`;
  const glowId = `anat-glow-${muscle}-${uid}`;
  const secGlowId = `anat-secglow-${muscle}-${uid}`;
  const auraId = `anat-aura-${muscle}-${uid}`;
  const bodySculptId = `anat-body-${muscle}-${uid}`;
  const bodyShadowId = `anat-shadow-${muscle}-${uid}`;
  const bodySheenId = `anat-sheen-${muscle}-${uid}`;
  const muscleMainId = `anat-mmain-${muscle}-${uid}`;
  const muscleDeepId = `anat-mdeep-${muscle}-${uid}`;
  const muscleCrownId = `anat-mcrown-${muscle}-${uid}`;
  const secondaryGradId = `anat-sec-${muscle}-${uid}`;
  const tendonGradId = `anat-tendon-${muscle}-${uid}`;

  // Refined studio stroke & micro-detail palette
  const silhouetteEdge = 'rgba(148, 163, 184, 0.36)';
  const rimHighlight = 'rgba(226, 232, 240, 0.42)';
  const fasciaCrease = 'rgba(10, 12, 18, 0.62)';
  const contourSoft = 'rgba(148, 163, 184, 0.22)';
  const fiberLight = 'rgba(255, 220, 192, 0.36)';
  const fiberShadow = 'rgba(115, 18, 0, 0.34)';
  const muscleEdge = 'rgba(120, 22, 0, 0.5)';
  const muscleRim = 'rgba(255, 204, 166, 0.58)';
  const secondaryEdge = 'rgba(14, 116, 144, 0.45)';
  const secondaryRim = 'rgba(186, 230, 253, 0.44)';

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        {/* Smooth Radial Studio Vignette Alpha Mask (Eliminates Harsh Straight Cutoffs) */}
        <radialGradient id={radialFadeId} cx="50%" cy="50%" r="52%" fx="50%" fy="48%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="62%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.62" />
          <stop offset="92%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        {/* Soft Top/Bottom Edge Dissolve Gradient */}
        <linearGradient id={vertFadeId} x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.72" />
          <stop offset="14%" stopColor="#000000" stopOpacity="0" />
          <stop offset="84%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.88" />
        </linearGradient>

        <mask id={maskId}>
          <rect x="0" y="0" width="120" height="120" fill={`url(#${radialFadeId})`} />
          <rect x="0" y="0" width="120" height="120" fill={`url(#${vertFadeId})`} />
        </mask>

        {/* Subtle Studio Subsurface Blaze Muscle Bloom */}
        <filter id={glowId} x="-26%" y="-26%" width="152%" height="152%">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={activeGlow ? '2.4' : '0.9'}
            result="blur"
          />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 0.32
                    0 0 0 0 0.04
                    0 0 0 0.52 0"
            result="coloredGlow"
          />
          <feMerge>
            <feMergeNode in="coloredGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft Studio Ambient Backlight inside #14171F */}
        <radialGradient id={auraId} cx="50%" cy="48%" r="46%">
          <stop offset="0%" stopColor="#FF4500" stopOpacity={activeGlow ? '0.24' : '0.07'} />
          <stop offset="58%" stopColor="#FF7847" stopOpacity={activeGlow ? '0.08' : '0.02'} />
          <stop offset="100%" stopColor="#14171F" stopOpacity="0" />
        </radialGradient>

        {/* Sculptural Studio Body Volume Gradient (Matte Anatomical Slate-Graphite) */}
        <linearGradient id={bodySculptId} x1="22" y1="8" x2="98" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4B5565" />
          <stop offset="38%" stopColor="#323947" />
          <stop offset="76%" stopColor="#212632" />
          <stop offset="100%" stopColor="#171B24" />
        </linearGradient>

        {/* Deep Anatomical Recess / Rear Limb Depth Gradient */}
        <linearGradient id={bodyShadowId} x1="24" y1="12" x2="96" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#282E3B" />
          <stop offset="55%" stopColor="#1A1E28" />
          <stop offset="100%" stopColor="#11141C" />
        </linearGradient>

        {/* Soft Upper Studio Key-Light Sheen on Neutral Anatomy */}
        <linearGradient id={bodySheenId} x1="26" y1="6" x2="78" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.22" />
          <stop offset="48%" stopColor="#94A3B8" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#14171F" stopOpacity="0" />
        </linearGradient>

        {/* Primary 3D Blaze Orange-Red Muscle Belly (#FF7847 -> #FF4500 -> #B92B00) */}
        <linearGradient id={muscleMainId} x1="24" y1="16" x2="94" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF8A5C" />
          <stop offset="30%" stopColor="#FF6733" />
          <stop offset="64%" stopColor="#FF4500" />
          <stop offset="100%" stopColor="#B82900" />
        </linearGradient>

        {/* Secondary Recessed / Overlapping Muscle Head Depth Shading */}
        <linearGradient id={muscleDeepId} x1="24" y1="20" x2="96" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7240" />
          <stop offset="48%" stopColor="#E63900" />
          <stop offset="100%" stopColor="#8F1D00" />
        </linearGradient>

        {/* 3D Spherical Crown Specular Overlay for Sculpted Muscle Volume */}
        <radialGradient id={muscleCrownId} cx="36%" cy="30%" r="64%">
          <stop offset="0%" stopColor="#FFD2B8" stopOpacity="0.48" />
          <stop offset="45%" stopColor="#FF7847" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#7C1800" stopOpacity="0.22" />
        </radialGradient>

        {/* Cool Cyan Secondary Synergist Soft Bloom */}
        <filter id={secGlowId} x="-22%" y="-22%" width="144%" height="144%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={activeGlow ? '1.6' : '0.6'} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.22
                    0 0 0 0 0.74
                    0 0 0 0 0.97
                    0 0 0 0.42 0"
            result="cyanGlow"
          />
          <feMerge>
            <feMergeNode in="cyanGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Secondary Synergist Cool Cyan 3D Muscle Gradient (#7DD3FC -> #38BDF8 -> #0369A1) */}
        <linearGradient id={secondaryGradId} x1="22" y1="16" x2="96" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.9" />
          <stop offset="48%" stopColor="#38BDF8" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#0369A1" stopOpacity="0.88" />
        </linearGradient>

        {/* Realistic Silvery-Warm Tendon / Aponeurosis Fascia Gradient */}
        <linearGradient id={tendonGradId} x1="60" y1="48" x2="60" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#525B6C" stopOpacity="0.88" />
          <stop offset="50%" stopColor="#384050" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#232834" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Studio Backdrop Glow */}
      <circle cx="60" cy="58" r="54" fill={`url(#${auraId})`} />

      {/* Masked Studio Anatomy Layer — Soft Vignette Dissolve Into #14171F */}
      <g mask={`url(#${maskId})`}>
        {/* ========================================================================
            1. CHEST (อก): Natural anterior upper-torso & shoulder anatomy with
               fan-shaped Pectoralis Major curving from sternum to humerus,
               clavicular upper-chest line, and smooth delt/ribcage transition.
           ======================================================================== */}
        {muscle === 'Chest' && (
          <g>
            {/* Full Upper-Torso, Neck, Traps, Shoulders, Upper Arms & Tapered Ribcage */}
            <path
              d="M47 2C47.4 9.5 47.2 15.8 45.2 19.6C40.4 23.2 33.4 25.4 24.4 27.6C13.8 30.2 7.2 37.8 5.6 50.6L1.8 92C1.6 95 4 98 7 98H22.2L26.8 62.6C29.4 67.4 31.8 73.2 33.2 80.2L36.2 124H83.8L86.8 80.2C88.2 73.2 90.6 67.4 93.2 62.6L97.8 98H113C116 98 118.4 95 118.2 92L114.4 50.6C112.8 37.8 106.2 30.2 95.6 27.6C86.6 25.4 79.6 23.2 74.8 19.6C72.8 15.8 72.6 9.5 73 2H47Z"
              fill={`url(#${bodySculptId})`}
              stroke={silhouetteEdge}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />

            {/* Soft Studio Key-Light Across Traps, Clavicles & Upper Delts */}
            <path
              d="M46.5 19.4C52.5 23.8 67.5 23.8 73.5 19.4L86.4 28.4C76.2 31.8 67.8 33.4 60 33.4C52.2 33.4 43.8 31.8 33.6 28.4L46.5 19.4Z"
              fill={`url(#${bodySheenId})`}
            />

            {/* Natural Armpit, Sub-Clavicular & Lateral Ribcage Shadow Recesses */}
            <path
              d="M23.8 43.4C26.4 50.2 27.6 57.2 26.8 62.6L32.8 71.2C32.2 61.6 29.8 51.4 23.8 43.4Z"
              fill={`url(#${bodyShadowId})`}
            />
            <path
              d="M96.2 43.4C93.6 50.2 92.4 57.2 93.2 62.6L87.2 71.2C87.8 61.6 90.2 51.4 96.2 43.4Z"
              fill={`url(#${bodyShadowId})`}
            />
            {/* Neutral Anterior Deltoid Cap Contours & Sternocleidomastoid / Clavicle Lines */}
            <path
              d="M50.5 6.5C51.6 15.2 54.6 22.8 58.6 28.4M69.5 6.5C68.4 15.2 65.4 22.8 61.4 28.4M32.4 29.6C41.8 32 50.8 33 58.2 31.4M87.6 29.6C78.2 32 69.2 33 61.8 31.4M19.8 36.2C23.2 44.2 25 52.8 25.2 60.8M100.2 36.2C96.8 44.2 95 52.8 94.8 60.8"
              stroke={contourSoft}
              strokeWidth="1.05"
              strokeLinecap="round"
            />
            {/* Subtle Ribcage, Serratus & Upper Ab Contours Below Pecs */}
            <path
              d="M60 70.5V118M45.5 76.2C50.2 78 54.8 78 58.2 76.6M74.5 76.2C69.8 78 65.2 78 61.8 76.6M46.5 90.4C50.8 92 55 92 58.2 90.8M73.5 90.4C69.2 92 65 92 61.8 90.8M35.4 73.2L41.4 77M84.6 73.2L78.6 77M36.8 83L42.4 86.2M83.2 83L77.6 86.2"
              stroke={contourSoft}
              strokeWidth="0.95"
              strokeLinecap="round"
            />

            {/* SECONDARY SYNERGISTS (Cool Cyan): Anterior Deltoids */}
            {showSecondary && (
              <g filter={`url(#${secGlowId})`} opacity="0.88">
                <path
                  d="M25.6 29.2C18.2 31.4 12.6 37.8 10.8 47.4C10.2 52.2 11.4 56.8 14.4 60.2L22.6 55.6C23.8 48.8 24.4 41.2 26.8 34.4L25.6 29.2Z"
                  fill={`url(#${secondaryGradId})`}
                  stroke={secondaryEdge}
                  strokeWidth="0.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M94.4 29.2C101.8 31.4 107.4 37.8 109.2 47.4C109.8 52.2 108.6 56.8 105.6 60.2L97.4 55.6C96.2 48.8 95.6 41.2 93.2 34.4L94.4 29.2Z"
                  fill={`url(#${secondaryGradId})`}
                  stroke={secondaryEdge}
                  strokeWidth="0.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.4 43.2C16.2 37.6 19.6 33.8 24.2 31.8M105.6 43.2C103.8 37.6 100.4 33.8 95.8 31.8"
                  stroke={secondaryRim}
                  strokeWidth="0.75"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* Soft Sternal Furrow Shadow */}
            <path
              d="M58.2 34.4H61.8L61.4 67.6C60.6 69.2 59.4 69.2 58.6 67.6L58.2 34.4Z"
              fill={fasciaCrease}
            />

            {/* ACTIVE TARGET MUSCLE: Bilateral Fan-Shaped Pectoralis Major */}
            <g filter={`url(#${glowId})`}>
              {/* Left Pectoralis Major (Sternum + Clavicle -> Converging into Left Humerus) */}
              <path
                d="M23.8 43.2C28.2 36.6 38.6 33.4 49.4 33.8C54 34 57.6 35.4 58.4 37.8V62.4C58.4 65 56.6 67.2 53.6 68.1C44.4 70.8 33.4 68.6 28.4 61.6C24.8 56.6 22.8 49.6 23.8 43.2Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.85"
                strokeLinejoin="round"
              />
              {/* Right Pectoralis Major (Sternum + Clavicle -> Converging into Right Humerus) */}
              <path
                d="M96.2 43.2C91.8 36.6 81.4 33.4 70.6 33.8C66 34 62.4 35.4 61.6 37.8V62.4C61.6 65 63.4 67.2 66.4 68.1C75.6 70.8 86.6 68.6 91.6 61.6C95.2 56.6 97.2 49.6 96.2 43.2Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.85"
                strokeLinejoin="round"
              />
              {/* 3D Volume Crown Overlay & Lower-Costal Depth Shadow */}
              <path
                d="M26 44.6C31.6 37.8 43.6 35.2 56.4 38.4V57.2C47.8 60.4 36.2 59.8 29.2 54.4C26 51.8 24.8 48 26 44.6Z"
                fill={`url(#${muscleCrownId})`}
              />
              <path
                d="M94 44.6C88.4 37.8 76.4 35.2 63.6 38.4V57.2C72.2 60.4 83.8 59.8 90.8 54.4C94 51.8 95.2 48 94 44.6Z"
                fill={`url(#${muscleCrownId})`}
              />
              <path
                d="M28.8 59.8C35.8 65.4 46.8 66.8 56.8 64.2C55.6 67.6 46.2 69.8 36.8 67.4C32.4 66 29.8 63 28.8 59.8Z"
                fill={`url(#${muscleDeepId})`}
                fillOpacity="0.68"
              />
              <path
                d="M91.2 59.8C84.2 65.4 73.2 66.8 63.2 64.2C64.4 67.6 73.8 69.8 83.2 67.4C87.6 66 90.2 63 91.2 59.8Z"
                fill={`url(#${muscleDeepId})`}
                fillOpacity="0.68"
              />
            </g>

            {/* Clavicular Head Separation Crease & Ultra-Fine Fanning Fiber Highlights */}
            <path
              d="M26.2 45.4C35.8 42.2 46.2 41.2 56.6 42.2M93.8 45.4C84.2 42.2 73.8 41.2 63.4 42.2"
              stroke={fiberShadow}
              strokeWidth="0.85"
              strokeLinecap="round"
            />
            <path
              d="M27.4 48.8C36.8 46.6 46.8 46.8 56.6 48.2M28.2 53.6C37.4 52.6 47.2 53.2 56.4 54.8M30.8 58.6C39 59.2 47.6 59.8 55.6 60.8M92.6 48.8C83.2 46.6 73.2 46.8 63.4 48.2M91.8 53.6C82.6 52.6 72.8 53.2 63.6 54.8M89.2 58.6C81 59.2 72.4 59.8 64.4 60.8"
              stroke={fiberLight}
              strokeWidth="0.72"
              strokeLinecap="round"
            />
            <path
              d="M29.4 40.2C37.4 36.2 46.6 35.6 55.2 37.6M90.6 40.2C82.6 36.2 73.4 35.6 64.8 37.6"
              stroke={muscleRim}
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M11.6 44.6C13.8 35.4 19.6 30.2 28.4 28.2M108.4 44.6C106.2 35.4 100.4 30.2 91.6 28.2"
              stroke={rimHighlight}
              strokeWidth="0.95"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ========================================================================
            2. BACK (หลัง): Realistic posterior upper-body V-taper anatomy with
               natural neck/trapezius slope, wide sweeping Latissimus Dorsi,
               teres major & central spinal furrow.
           ======================================================================== */}
        {muscle === 'Back' && (
          <g>
            {/* Posterior Athletic V-Taper Silhouette (Neck -> Traps -> Rear Delts -> Waist) */}
            <path
              d="M47.6 2C47.8 9.2 47.4 15.2 45.4 19C39.6 22.8 31.8 25.4 22.4 27.8C12.2 30.4 6.2 38.2 4.8 50.2L1.6 92C1.4 95 3.8 98 6.8 98H21.6L26.2 60.8C29.8 72.2 34.4 82.6 38.8 92.2L41.8 124H78.2L81.2 92.2C85.6 82.6 90.2 72.2 93.8 60.8L98.4 98H113.2C116.2 98 118.6 95 118.4 92L115.2 50.2C113.8 38.2 107.8 30.4 97.6 27.8C88.2 25.4 80.4 22.8 74.6 19C72.6 15.2 72.2 9.2 72.4 2H47.6Z"
              fill={`url(#${bodySculptId})`}
              stroke={silhouetteEdge}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />

            {/* Neutral Rear Deltoids, Scapular Spine & Erector Spinae Lower Back Contours */}
            <path
              d="M19.2 35.4C22.6 42.6 24.8 50.8 25.4 59.4M100.8 35.4C97.4 42.6 95.2 50.8 94.6 59.4M49.6 94.6C50.4 102.4 50.6 110.2 50 118M70.4 94.6C69.6 102.4 69.4 110.2 70 118"
              stroke={contourSoft}
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* SECONDARY SYNERGISTS (Cool Cyan): Rear Deltoids & Lower Erector Spinae */}
            {showSecondary && (
              <g filter={`url(#${secGlowId})`} opacity="0.86">
                <path
                  d="M23.8 29.2C16.2 31.6 10.8 38.2 9.4 47.8C9 52.4 10.4 56.4 13.4 59.4L22.6 53.6C23.4 45.8 23.6 37.8 25.2 31.2L23.8 29.2Z"
                  fill={`url(#${secondaryGradId})`}
                  stroke={secondaryEdge}
                  strokeWidth="0.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M96.2 29.2C103.8 31.6 109.2 38.2 110.6 47.8C111 52.4 109.6 56.4 106.6 59.4L97.4 53.6C96.6 45.8 96.4 37.8 94.8 31.2L96.2 29.2Z"
                  fill={`url(#${secondaryGradId})`}
                  stroke={secondaryEdge}
                  strokeWidth="0.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M51.4 91.2C54 89.2 56.4 89.4 58.2 91.6V110.6C55.2 109.4 52.6 105.6 51.2 100.4L51.4 91.2Z"
                  fill={`url(#${secondaryGradId})`}
                  fillOpacity="0.72"
                />
                <path
                  d="M68.6 91.2C66 89.2 63.6 89.4 61.8 91.6V110.6C64.8 109.4 67.4 105.6 68.8 100.4L68.6 91.2Z"
                  fill={`url(#${secondaryGradId})`}
                  fillOpacity="0.72"
                />
              </g>
            )}

            {/* Subtle Thoracolumbar Fascia Diamond in Lower Center Back */}
            <path
              d="M60 78.4L71.2 96.4L60 115.2L48.8 96.4L60 78.4Z"
              fill={`url(#${bodyShadowId})`}
              fillOpacity="0.65"
            />

            {/* ACTIVE TARGET MUSCLES: Trapezius Hood + Teres Major + Wide Sweeping Lats */}
            <g filter={`url(#${glowId})`}>
              {/* Natural Upper & Mid Trapezius Slope */}
              <path
                d="M60 15.6C65.4 19.2 73.2 24.4 81.8 29.2C83.6 30.2 84 32 82.8 33.8L70.8 56.2L60 66.2L49.2 56.2L37.2 33.8C36 32 36.4 30.2 38.2 29.2C46.8 24.4 54.6 19.2 60 15.6Z"
                fill={`url(#${muscleDeepId})`}
                fillOpacity="0.88"
                stroke={muscleEdge}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />

              {/* Left Teres Major (Tucked Under Rear Delt & Infraspinatus) */}
              <path
                d="M24.2 39.2C30.8 38.2 38.6 41.4 44.4 48.2C39.2 51.6 33.4 52.8 27.6 51.2C24.8 47.4 23.6 43.2 24.2 39.2Z"
                fill={`url(#${muscleDeepId})`}
                stroke={muscleEdge}
                strokeWidth="0.75"
                strokeLinejoin="round"
              />
              {/* Right Teres Major */}
              <path
                d="M95.8 39.2C89.2 38.2 81.4 41.4 75.6 48.2C80.8 51.6 86.6 52.8 92.4 51.2C95.2 47.4 96.4 43.2 95.8 39.2Z"
                fill={`url(#${muscleDeepId})`}
                stroke={muscleEdge}
                strokeWidth="0.75"
                strokeLinejoin="round"
              />

              {/* Left Wide Sweeping V-Taper Latissimus Dorsi Wing */}
              <path
                d="M25.6 47.2C34.2 48.2 44.8 54.4 57.6 66.8L57.2 93.4C47.4 89.2 40.2 82.2 35.2 72.2L28.2 57.8C26.4 54.2 25.4 50.6 25.6 47.2Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.85"
                strokeLinejoin="round"
              />
              {/* Right Wide Sweeping V-Taper Latissimus Dorsi Wing */}
              <path
                d="M94.4 47.2C85.8 48.2 75.2 54.4 62.4 66.8L62.8 93.4C72.6 89.2 79.8 82.2 84.8 72.2L91.8 57.8C93.6 54.2 94.6 50.6 94.4 47.2Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.85"
                strokeLinejoin="round"
              />

              {/* Soft 3D Volume Highlight Across Lat Wings */}
              <path
                d="M27.6 50.4C35.2 52.2 44.8 58.2 55 69.2L54.8 84.4C46.2 80.2 39.6 73.6 34.4 64.4L27.6 50.4Z"
                fill={`url(#${muscleCrownId})`}
              />
              <path
                d="M92.4 50.4C84.8 52.2 75.2 58.2 65 69.2L65.2 84.4C73.8 80.2 80.4 73.6 85.6 64.4L92.4 50.4Z"
                fill={`url(#${muscleCrownId})`}
              />
            </g>

            {/* Realistic Central Spinal Furrow (Soft Anatomical Groove) */}
            <path
              d="M58.4 16.4H61.6L61.2 114C60.6 115.6 59.4 115.6 58.8 114L58.4 16.4Z"
              fill={fasciaCrease}
            />
            <path
              d="M60 19V112"
              stroke="rgba(148, 163, 184, 0.22)"
              strokeWidth="0.7"
              strokeLinecap="round"
            />

            {/* Ultra-Fine Sweeping Diagonal Lat & Trapezius Striation Highlights */}
            <path
              d="M44.2 30.8L56.8 37.8M75.8 30.8L63.2 37.8M47.6 40.4L56.8 46.2M72.4 40.4L63.2 46.2M29.4 53.2C38.6 56.8 47.2 62.8 55.2 71.2M32.4 61.6C40.4 65.8 48.2 71.8 55.2 79.4M36.6 70.8C43.2 75.2 49.4 80.6 55 86.8M90.6 53.2C81.4 56.8 72.8 62.8 64.8 71.2M87.6 61.6C79.6 65.8 71.8 71.8 64.8 79.4M83.4 70.8C76.8 75.2 70.6 80.6 65 86.8"
              stroke={fiberLight}
              strokeWidth="0.72"
              strokeLinecap="round"
            />
            <path
              d="M28.2 49.8C29.4 56.2 31.8 62.6 35.6 69.2M91.8 49.8C90.6 56.2 88.2 62.6 84.4 69.2"
              stroke={muscleRim}
              strokeWidth="0.95"
              strokeLinecap="round"
            />
            <path
              d="M11.6 43.2C13.6 34.8 19.2 29.8 28.4 27.6M108.4 43.2C106.4 34.8 100.8 29.8 91.6 27.6"
              stroke={rimHighlight}
              strokeWidth="0.95"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ========================================================================
            3. SHOULDERS (ไหล่): 3/4 athletic shoulder & upper-arm profile clearly
               sculpting the 3 distinct deltoid heads (anterior, lateral, posterior)
               wrapping smoothly over the shoulder joint.
           ======================================================================== */}
        {muscle === 'Shoulders' && (
          <g>
            {/* Far-Side Torso Depth Silhouette (3/4 Perspective) */}
            <path
              d="M21 31.2C13.6 33.8 8.4 40.4 7.2 50.4L4.2 82.5H19.4L25.8 62.4L32.4 34.8L21 31.2Z"
              fill={`url(#${bodyShadowId})`}
              stroke={silhouetteEdge}
              strokeWidth="0.9"
              strokeLinejoin="round"
            />

            {/* Main 3/4 Neck, Upper Torso & Sculpted Foreground Arm Silhouette */}
            <path
              d="M42.8 2C42.6 10.6 42.2 17.8 40.4 22.2C34.2 26.8 28.8 31.8 25.4 39.2C21.8 47.4 20.6 58.6 19.6 74.2L17.4 124H65.8L68.4 98.4C70 89.2 73.2 82.8 76.6 79.4L79.8 124H106.4L109.2 61.6C110 46.2 103.2 34.6 91.8 29.6C83.6 26 75.8 23.6 69.2 19.6C67.4 14.8 66.8 8.8 66.6 2H42.8Z"
              fill={`url(#${bodySculptId})`}
              stroke={silhouetteEdge}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />

            {/* Studio Key-Light on Neck/Trap Slope & Neutral Chest/Arm Contours */}
            <path
              d="M42.4 21.8C48.8 27.6 58.6 30.2 68.4 28.4L69.2 19.6C60.6 18 51.2 18.2 42.4 21.8Z"
              fill={`url(#${bodySheenId})`}
            />
            {/* SECONDARY SYNERGISTS (Cool Cyan): Upper Trapezius & Upper Triceps Edge */}
            {showSecondary && (
              <g filter={`url(#${secGlowId})`} opacity="0.86">
                <path
                  d="M44.6 19.8C51.6 24.4 60.4 26.8 68.6 26.6L81.4 28.8C76.2 24.6 71.2 21.8 67.8 18.6C61.2 17.6 52.8 17.4 44.6 19.8Z"
                  fill={`url(#${secondaryGradId})`}
                  stroke={secondaryEdge}
                  strokeWidth="0.68"
                  strokeLinejoin="round"
                />
                <path
                  d="M84.4 79.6L96.8 77.6C99.8 87.2 99.6 97.6 96.8 107.4L86.4 105.6C87.8 96.8 87.2 87.8 84.4 79.6Z"
                  fill={`url(#${secondaryGradId})`}
                  fillOpacity="0.74"
                  stroke={secondaryEdge}
                  strokeWidth="0.65"
                  strokeLinejoin="round"
                />
              </g>
            )}

            <path
              d="M44.2 23.8C49.6 28.8 56.6 31.2 64.2 30.4M27.6 39.6C36.6 36.2 47.2 35.8 55.6 38.6M28.4 61.8C39.6 66.2 52.8 65.8 64.2 60.4M29.4 80.2C39.2 83.4 49.4 83.2 58.4 80.8M92.4 79.6L90.2 116M84.4 79.8C87.2 90.4 87.6 102.8 86 116"
              stroke={contourSoft}
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* ACTIVE TARGET MUSCLE: 3 Distinct Deltoid Heads (Anterior, Lateral, Posterior) */}
            <g filter={`url(#${glowId})`}>
              {/* Subtle Far-Side Anterior Delt Hint (Enhances 3/4 Bilateral Depth) */}
              <path
                d="M25.4 32.6C18.6 33.8 13.4 39.2 11.4 47.4C10.6 51.8 11.4 56.2 13.6 59.6L21.4 54C21.8 46.2 23.4 38.6 25.4 32.6Z"
                fill={`url(#${muscleDeepId})`}
                fillOpacity="0.62"
              />

              {/* HEAD 1 — Anterior Deltoid (Sweeps Over Front Shoulder / Clavicle) */}
              <path
                d="M67.4 28.8C61.2 29.8 56.2 34.4 54.6 41.8C52.8 49.6 56.8 61.4 68.4 70.6L76.2 74.8C72.6 61.6 71.2 45.8 71.8 32.2C70.6 30 69 28.6 67.4 28.8Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.85"
                strokeLinejoin="round"
              />

              {/* HEAD 2 — Lateral (Medial) Deltoid (Prominent 3D Central Dome) */}
              <path
                d="M88.8 29.4C82.4 26.8 74.6 27.6 71.2 32.4C68.6 44.2 70.8 60.8 78.6 76.2C81.2 79.4 84.8 79.8 87.2 76.8C93.2 66.6 96.4 50.4 93.8 36.2C93 32.6 91.2 30.4 88.8 29.4Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.9"
                strokeLinejoin="round"
              />

              {/* HEAD 3 — Posterior Deltoid (Sculpted Rear Wrapping Head) */}
              <path
                d="M94.8 34.4C102.2 38.6 107.6 47.4 107.2 59.2C107 67.8 102 75.4 93.8 79.4L87.6 76.4C93.6 65.2 96.6 50.2 94.8 34.4Z"
                fill={`url(#${muscleDeepId})`}
                stroke={muscleEdge}
                strokeWidth="0.85"
                strokeLinejoin="round"
              />

              {/* 3D Spherical Crown Light Across Lateral & Anterior Delts */}
              <path
                d="M72.6 33.4C77.8 29.8 85.4 30.2 90.4 35.6C92.4 45.8 90.2 58.6 84.8 69.8C78.4 59.2 73.6 46.2 72.6 33.4Z"
                fill={`url(#${muscleCrownId})`}
              />
            </g>

            {/* Subtle Inter-Head Fascia Separation & Multipennate Converging Striations */}
            <path
              d="M71.4 33.6C69.6 45.6 71.4 59.2 76.8 72.4M93.4 36.2C94.8 49.2 92.6 62.8 86.8 74.6"
              stroke={fiberShadow}
              strokeWidth="0.85"
              strokeLinecap="round"
            />
            <path
              d="M61.8 37.8C62.4 47.8 66 58.4 72.2 67.6M77.8 34.6C76.6 47.2 78.2 60.2 82.2 71.6M86.6 35.4C87.6 47.2 86.8 59.2 83.8 70.8M99.2 44.6C100.4 53.6 98.8 63.4 92.4 71.8"
              stroke={fiberLight}
              strokeWidth="0.72"
              strokeLinecap="round"
            />
            <path
              d="M73.6 32.2C78.4 29.8 84.4 29.8 89.2 32.4M59.2 35.4C61.8 32.6 65 31.6 68.2 32"
              stroke={muscleRim}
              strokeWidth="1.05"
              strokeLinecap="round"
            />
            <path
              d="M104.2 42.6C108.4 49.4 109.4 57.8 108.6 66.8"
              stroke={rimHighlight}
              strokeWidth="0.95"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ========================================================================
            4. LEGS (ขา): Realistic anterior-3/4 athletic leg silhouette (hip to
               mid-calf) sculpting the 4 Quadriceps heads (Rectus Femoris, Vastus
               Lateralis, and iconic VMO teardrop above the kneecap) + shin/knee.
           ======================================================================== */}
        {muscle === 'Legs' && (
          <g>
            {/* Shaded Rear Supporting Leg (Natural 3/4 Depth Parallax) */}
            <path
              d="M66 4H94.8L100.2 34.6C101.8 46.8 98.4 59.6 92.4 69.8L88.8 124H71.2L73.6 74.2L63.8 48.2L66 4Z"
              fill={`url(#${bodyShadowId})`}
              stroke={silhouetteEdge}
              strokeWidth="0.9"
              strokeLinejoin="round"
            />

            {/* Foreground Athletic 3/4 Hip/Pelvis, Sculpted Thigh, Knee & Upper Calf */}
            <path
              d="M22.4 2H78.6L81.4 20.6C85 35.6 84.2 52.4 77.6 68.2C74.6 75.4 72.4 82.4 72 90.4L69.4 124H44.6L43.8 92.8C42.2 84.6 37.4 77.8 32.2 69.8C22 54.6 17.6 36.6 20.6 19.6L22.4 2Z"
              fill={`url(#${bodySculptId})`}
              stroke={silhouetteEdge}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />

            {/* Realistic Patella (Kneecap), Patellar Tendon, Tibia Shin & Calf Contours */}
            <path
              d="M55.2 76.8C59.8 73.6 66.4 74 70.2 77.8C71 82.6 67.2 87 62 87C57 87 54 82.6 55.2 76.8Z"
              fill={`url(#${tendonGradId})`}
              stroke={contourSoft}
              strokeWidth="0.95"
              strokeLinejoin="round"
            />
            {/* SECONDARY SYNERGISTS (Cool Cyan): Glute/Outer Hip Sweep & Upper Calf */}
            {showSecondary && (
              <g filter={`url(#${secGlowId})`} opacity="0.86">
                <path
                  d="M23.4 4.8L38.4 8.2C34.2 15.8 31.6 24.4 29.8 33.6L21.2 27.4C20.2 19.6 21 11.8 23.4 4.8Z"
                  fill={`url(#${secondaryGradId})`}
                  stroke={secondaryEdge}
                  strokeWidth="0.68"
                  strokeLinejoin="round"
                />
                <path
                  d="M46.2 92.6C51.4 91.6 56.6 93.4 60.2 98.4L57.8 117.4H47.6C46.2 109.2 45.8 100.8 46.2 92.6Z"
                  fill={`url(#${secondaryGradId})`}
                  fillOpacity="0.76"
                  stroke={secondaryEdge}
                  strokeWidth="0.65"
                  strokeLinejoin="round"
                />
              </g>
            )}

            <path
              d="M62.4 87.2V98.6M47.4 92.6C50.6 101.8 51.4 110.8 50.2 120M65.2 92.2C64.6 101.8 63.4 110.8 61.6 120M22.8 11.4C38.6 15.6 59.4 16 79.4 12.2"
              stroke={contourSoft}
              strokeWidth="0.95"
              strokeLinecap="round"
            />

            {/* ACTIVE TARGET MUSCLES: 4-Head Sculpted Quadriceps (with Iconic VMO Teardrop) */}
            <g filter={`url(#${glowId})`}>
              {/* Subtle Lateral Hamstring / IT-Band Shadow Frame on Rear Thigh */}
              <path
                d="M26.8 19.2C20.2 31.2 19.8 48.8 28.4 65.4C32.2 72.6 37.2 78.2 41.2 81.8L45.4 76C38.6 62.6 35.4 44.6 36.6 24.4L26.8 19.2Z"
                fill={`url(#${muscleDeepId})`}
                fillOpacity="0.62"
              />

              {/* HEAD 1 — Vastus Lateralis (Powerful Outer Thigh Sweep) */}
              <path
                d="M36.8 18.6C33.8 36.8 37.2 56.6 46.2 73.8L54.4 72.4C51.8 55.8 51.6 36.4 53.6 18.4L36.8 18.6Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.85"
                strokeLinejoin="round"
              />

              {/* HEAD 2 — Rectus Femoris (Central Feathered Spindle Descending to Tendon) */}
              <path
                d="M54 18.4C51.6 35.6 52.2 54.4 55.8 71.6L65.4 69.2C69.2 53 69.8 34.8 66.2 18.4H54Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.85"
                strokeLinejoin="round"
              />

              {/* HEAD 3 — Vastus Medialis Obliquus / VMO (Unmistakable Teardrop Above Inner Knee) */}
              <path
                d="M70.6 41.2C78.4 45.2 81.2 58.6 75.8 69.8C73.2 74.6 68.4 76.2 64.6 73.2C63 64.8 65.8 52.2 70.6 41.2Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.9"
                strokeLinejoin="round"
              />

              {/* HEAD 4 — Upper Inner Adductor / Vastus Intermedius Depth Blend */}
              <path
                d="M67.2 19.2L77.8 21.4C79.4 28.8 79 36.8 75.4 44.2L68.4 41.8C69.2 34.2 68.8 26.4 67.2 19.2Z"
                fill={`url(#${muscleDeepId})`}
                fillOpacity="0.82"
              />

              {/* 3D Studio Specular Volume on Rectus Femoris & VMO */}
              <path
                d="M55.4 21.4C54 36.4 54.4 51.2 57.2 64.6L63.8 63C66.4 49.8 66.8 35.2 64.2 21.4H55.4Z"
                fill={`url(#${muscleCrownId})`}
              />
            </g>

            {/* Quadriceps Tendon Sheen Above Kneecap + Ultra-Fine Feathering Striations */}
            <path
              d="M54.6 69.8C58.6 72.4 64.2 72.4 68.2 69.8"
              stroke="rgba(255, 224, 200, 0.42)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M44.2 26.8C43.4 41.8 45.6 56.2 50.4 68.4M60.2 25.4C60.6 40.4 60.6 53.8 59.6 66.2M72.6 50.4C72.8 58.2 71.2 64.8 68.4 69.8"
              stroke={fiberLight}
              strokeWidth="0.72"
              strokeLinecap="round"
            />
            <path
              d="M53.4 22.4C51.6 37.8 52.2 53.6 55.2 68.8M68.6 44.6C65.8 52.6 64.2 61.8 64.8 70.6"
              stroke={fiberShadow}
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <path
              d="M58.4 25.2C57.6 36.8 57.6 48.8 58.8 59.2M72.4 46.2C75.2 51.4 75.2 59.4 72.2 65.8"
              stroke={muscleRim}
              strokeWidth="0.95"
              strokeLinecap="round"
            />
            <path
              d="M21.4 23.2C19.2 37.8 22.4 53.8 30.8 67.6"
              stroke={rimHighlight}
              strokeWidth="0.95"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ========================================================================
            5. BICEPS (หน้าแขน): Natural flexed-arm anatomy (shoulder to wrist)
               sculpting the Biceps Brachii peak, underlying Brachialis, and
               natural forearm taper.
           ======================================================================== */}
        {muscle === 'Biceps' && (
          <g>
            {/* Natural Flexed Athletic Arm (Deltoid Shoulder -> Upper Arm -> Elbow -> Forearm -> Wrist) */}
            <path
              d="M114 48.2C108.4 42.6 99.6 40.8 90.4 43.4L76.4 47.6L52.8 29.8L60.2 17.8C62.2 14.4 61.2 10.2 57.6 8.2L44.2 2C40.4 0.4 36 2 33.8 5.8L16.4 35.8C10.8 45.4 10 57.8 14.4 68.4L22.2 88.2C26.4 97.6 35.8 103.6 47.6 103.8H96.8C109.2 103.8 118.2 94.2 119.4 79.8L121.6 58.6C121.6 54.4 118.6 51.2 114 48.2Z"
              fill={`url(#${bodySculptId})`}
              stroke={silhouetteEdge}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />

            {/* Underside Triceps Shadow & Natural Forearm Brachioradialis Contours */}
            <path
              d="M34.6 87.2C52.6 92.6 71.8 93.2 90.2 88.8C82.4 97.4 68.8 101.2 51.2 100.6L34.6 87.2Z"
              fill={`url(#${bodyShadowId})`}
            />
            {/* SECONDARY SYNERGISTS (Cool Cyan): Forearm Brachioradialis & Anterior Delt Cap */}
            {showSecondary && (
              <g filter={`url(#${secGlowId})`} opacity="0.86">
                <path
                  d="M36.2 14.8L48.4 24.4C45.2 38.4 40.4 50.6 34.4 61.2L20.8 51.4C24.2 38.2 29.4 25.8 36.2 14.8Z"
                  fill={`url(#${secondaryGradId})`}
                  stroke={secondaryEdge}
                  strokeWidth="0.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M95.6 46.8C103.6 47.4 111.4 51.8 114.6 60.2C115.6 68.4 113.2 76.8 106.4 83.2L97.4 76.2C99.2 66.2 98.8 56.2 95.6 46.8Z"
                  fill={`url(#${secondaryGradId})`}
                  fillOpacity="0.76"
                  stroke={secondaryEdge}
                  strokeWidth="0.65"
                  strokeLinejoin="round"
                />
              </g>
            )}

            <path
              d="M25.4 46.8C32.4 53.2 40 59.6 46.8 65.8M18.8 56.6C24.2 66.8 28.4 78.2 31.2 90.2M91.4 46.4C89.2 59.6 89.8 74.6 92.6 91.2M42.8 87.8C58.2 91.2 73.2 91.2 86.2 87.6"
              stroke={contourSoft}
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* ACTIVE TARGET MUSCLES: Sculpted Biceps Brachii Peak + Underlying Brachialis */}
            <g filter={`url(#${glowId})`}>
              {/* High-Sculpted Biceps Brachii Peak (Long & Short Heads + Distal Tendon Taper) */}
              <path
                d="M44.2 66.8C47.6 48.4 63.4 36.8 82.4 39.8C93.2 41.6 100.2 50.2 98.4 62.6C94.8 72.4 84.8 79.4 69.6 79.8C58.8 80 48.8 75.4 44.2 66.8Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.9"
                strokeLinejoin="round"
              />

              {/* Underlying Brachialis Muscle Belly (Pushes Bicep Peak Higher) */}
              <path
                d="M47.4 73.4C56.2 79.8 68.4 81.4 80.2 79C85.8 77.8 90.2 75.8 93.4 73.4C90.2 83.2 79.4 89 65.2 88.6C55.6 88.4 49.2 82.4 47.4 73.4Z"
                fill={`url(#${muscleDeepId})`}
                stroke={muscleEdge}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />

              {/* 3D Spherical Crown Light Across Bicep Peak */}
              <path
                d="M49.6 62.2C53.6 48.8 66.2 41.4 81.4 43.2C89.2 44.4 93.8 49.8 92.6 58.2C88.8 65.8 79.8 71.2 67.6 71.4C58.6 71.6 52.2 68 49.6 62.2Z"
                fill={`url(#${muscleCrownId})`}
              />
            </g>

            {/* Long/Short Head Natural Groove + Arching Fiber Highlights + Distal Tendon Sheen */}
            <path
              d="M50.6 64.2C61.2 57.2 74.8 55.8 89.8 59.6"
              stroke={fiberShadow}
              strokeWidth="0.85"
              strokeLinecap="round"
            />
            <path
              d="M55.4 55.2C64.6 49.8 75.8 48.8 86.8 51.4M54.6 69.8C64.8 65.4 76.4 64.8 87.8 68.2M56.2 80.4C64.8 82.6 74.2 82.8 82.6 80.6"
              stroke={fiberLight}
              strokeWidth="0.72"
              strokeLinecap="round"
            />
            <path
              d="M54.2 48.6C63.6 42.2 75.6 41.2 86.8 45.2"
              stroke={muscleRim}
              strokeWidth="1.15"
              strokeLinecap="round"
            />
            <path
              d="M17.8 37.6L34.6 7.8M109.6 55.4C114.8 62.6 116.2 72.4 113.8 82.4"
              stroke={rimHighlight}
              strokeWidth="0.95"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ========================================================================
            6. TRICEPS (หลังแขน): Natural posterior/3-4 extended arm anatomy
               sculpting the distinct 3-head "horseshoe" Triceps Brachii
               (lateral, long, and medial heads) and olecranon tendon.
           ======================================================================== */}
        {muscle === 'Triceps' && (
          <g>
            {/* Extended Posterior-3/4 Athletic Arm (Rear Delt -> Upper Arm -> Elbow -> Forearm) */}
            <path
              d="M34.2 2C48.8 0.4 70.6 5.2 81.8 17.6C92.8 30.2 95.6 51.4 88.2 72.6L80.2 124H48.6L46.4 78.6C35.2 71.2 28.4 55.6 29 37.8C29.4 24.4 31 11.4 34.2 2Z"
              fill={`url(#${bodySculptId})`}
              stroke={silhouetteEdge}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />

            {/* SECONDARY SYNERGISTS (Cool Cyan): Rear Deltoid Cap & Forearm Extensors */}
            {showSecondary && (
              <g filter={`url(#${secGlowId})`} opacity="0.86">
                <path
                  d="M36.4 8.6C51.2 6.8 67.2 10.6 78.4 20.6L76.2 26.8C61.8 31.6 46.2 32.2 33.4 27.6C33.4 20.8 34.4 14.4 36.4 8.6Z"
                  fill={`url(#${secondaryGradId})`}
                  stroke={secondaryEdge}
                  strokeWidth="0.68"
                  strokeLinejoin="round"
                />
                <path
                  d="M52.8 87.4C58.8 89.8 65.8 89.8 72.2 87.4L73.6 113.4H52.4L52.8 87.4Z"
                  fill={`url(#${secondaryGradId})`}
                  fillOpacity="0.72"
                  stroke={secondaryEdge}
                  strokeWidth="0.65"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* Neutral Rear Deltoid Cap, Olecranon Elbow & Forearm Extensor Contours */}
            <path
              d="M32.6 27.6C45.6 32.4 63.4 31.4 78.8 25.4M53.2 83.4C58.6 86.8 66.2 86.8 71.8 83.4M62.4 89.2V118M54.6 90.4L53.2 118M70.4 90.4L71.6 118"
              stroke={contourSoft}
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* ACTIVE TARGET MUSCLES: 3-Head "Horseshoe" Triceps Brachii */}
            <g filter={`url(#${glowId})`}>
              {/* HEAD 1 — Lateral Head (Outer Sweeping Horn of Horseshoe) */}
              <path
                d="M34.6 33.4C44.2 33.8 53.8 38.6 58.8 48.6L55.8 73.6C44.2 68.8 34.4 55.8 34.6 33.4Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.9"
                strokeLinejoin="round"
              />

              {/* HEAD 2 — Long Head (Massive Inner-Posterior Sweeping Belly) */}
              <path
                d="M84.6 31.6C75.8 33.4 67.2 39.2 63.4 49.2L65.2 77.2C78 72.2 86.2 55.2 84.6 31.6Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.9"
                strokeLinejoin="round"
              />

              {/* HEAD 3 — Medial Head (Lower Deep Cushion & Horseshoe Arch Bridge) */}
              <path
                d="M50.2 69.4C56.4 77.2 64.2 80 71.4 69.8L68 51.2C64.6 45.4 58.2 45.2 55 51.2L50.2 69.4Z"
                fill={`url(#${muscleDeepId})`}
                stroke={muscleEdge}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />

              {/* 3D Studio Volume Specular on Lateral & Long Heads */}
              <path
                d="M37.4 37.2C44.4 38.6 51.2 43.2 54.6 50.8L52.8 66.8C44.6 62.6 38.2 52.8 37.4 37.2Z"
                fill={`url(#${muscleCrownId})`}
              />
              <path
                d="M81.8 35.8C75.4 38 69.2 43.2 66.6 51.2L68 69.2C76.6 64.4 82.2 51.4 81.8 35.8Z"
                fill={`url(#${muscleCrownId})`}
              />
            </g>

            {/* Recessed Flat Olecranon Triceps Tendon Diamond (Sculpts the Horseshoe!) */}
            <path
              d="M54.8 69.8L61.2 57.6L67.6 69.8L61.2 83.2Z"
              fill={`url(#${tendonGradId})`}
              stroke="rgba(226, 232, 240, 0.24)"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />

            {/* Chevron-Angled Muscle-Fiber Striations Flowing Into Central Tendon */}
            <path
              d="M40.2 41.6C43.2 49.8 46.6 57.4 51.4 64.4M45.6 46.6C47.8 52.6 50.4 58 53.8 63.4M78.8 40.8C76.2 49.8 73 58 69.4 65.8M73.6 46.6C71.6 53.2 69.6 58.8 67.2 64.6"
              stroke={fiberLight}
              strokeWidth="0.72"
              strokeLinecap="round"
            />
            <path
              d="M38.2 37.8C39.2 48.4 42.2 58.2 47.6 65.2M81.2 36.6C80.8 48.2 78.2 59.2 73 67.2"
              stroke={muscleRim}
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M88.2 35.2C91.8 47.4 90.8 60.8 85.8 72.8"
              stroke={rimHighlight}
              strokeWidth="0.95"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ========================================================================
            7. ABS / CORE (หน้าท้อง): Natural athletic midsection contour (lower
               pecs to pelvis) sculpting the 6-pack Rectus Abdominis separated by
               the central Linea Alba, tendinous intersections & side Obliques.
           ======================================================================== */}
        {muscle === 'Abs' && (
          <g>
            {/* Athletic Midsection Contour (Lower Pecs -> Tapered Ribcage & Waist -> Pelvis) */}
            <path
              d="M16.4 2H103.6L100.4 34.4C98 49.8 93.6 63.6 91 76.2C89.2 85.8 92.4 96.8 97.4 109.6L100.2 124H19.8L22.6 109.6C27.6 96.8 30.8 85.8 29 76.2C26.4 63.6 22 49.8 19.6 34.4L16.4 2Z"
              fill={`url(#${bodySculptId})`}
              stroke={silhouetteEdge}
              strokeWidth="1.05"
              strokeLinejoin="round"
            />

            {/* Lower Pectoral Shelf, Ribcage Arch & Iliac V-Cut Pelvic Landmarks */}
            <path
              d="M22.2 18.8C34.2 25.2 47.2 25.6 58.4 20.6M97.8 18.8C85.8 25.2 72.8 25.6 61.6 20.6M26.2 96.4C36.4 104.8 47.4 111.2 58 114.8M93.8 96.4C83.6 104.8 72.6 111.2 62 114.8"
              stroke={contourSoft}
              strokeWidth="1.05"
              strokeLinecap="round"
            />

            {/* Central Linea Alba Tendinous Furrow */}
            <path
              d="M58.4 27.6H61.6L61.2 108.4C60.6 110 59.4 110 58.8 108.4L58.4 27.6Z"
              fill={fasciaCrease}
            />

            {/* SECONDARY SYNERGISTS (Cool Cyan): Serratus Anterior & External Obliques */}
            {showSecondary && (
              <g filter={`url(#${secGlowId})`} opacity="0.88">
                <path
                  d="M23.4 33.4C28.8 35.8 33.6 42.4 35.8 52.2L37 86.2C32 82.8 28.8 76.2 27.4 67.2C25.6 56.4 23.4 44.6 23.4 33.4Z"
                  fill={`url(#${secondaryGradId})`}
                  stroke={secondaryEdge}
                  strokeWidth="0.72"
                  strokeLinejoin="round"
                />
                <path
                  d="M96.6 33.4C91.2 35.8 86.4 42.4 84.2 52.2L83 86.2C88 82.8 91.2 76.2 92.6 67.2C94.4 56.4 96.6 44.6 96.6 33.4Z"
                  fill={`url(#${secondaryGradId})`}
                  stroke={secondaryEdge}
                  strokeWidth="0.72"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* ACTIVE TARGET MUSCLES: 6-Pack Rectus Abdominis */}
            <g filter={`url(#${glowId})`}>

              {/* Row 1 — Upper Rectus Abdominis (Left & Right) */}
              <path
                d="M40.6 30.8C46.4 27.8 53.4 28.2 58.2 31.2V45.4C53.2 47.4 46.2 46.8 40.8 43.8C39.2 39.8 39.2 34.4 40.6 30.8Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
              <path
                d="M79.4 30.8C73.6 27.8 66.6 28.2 61.8 31.2V45.4C66.8 47.4 73.8 46.8 79.2 43.8C80.8 39.8 80.8 34.4 79.4 30.8Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />

              {/* Row 2 — Middle Rectus Abdominis (Left & Right) */}
              <path
                d="M40.8 49.4C46.6 48.2 53.4 48.4 58.2 50V65.4C53.2 67.2 46.6 66.8 41.2 63.8C39.8 59.6 39.8 53.8 40.8 49.4Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
              <path
                d="M79.2 49.4C73.4 48.2 66.6 48.4 61.8 50V65.4C66.8 67.2 73.4 66.8 78.8 63.8C80.2 59.6 80.2 53.8 79.2 49.4Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />

              {/* Row 3 — Lower 6-Pack Rectus Abdominis (Left & Right) */}
              <path
                d="M41.8 69.2C47.2 68.4 53.4 68.6 58.2 70V84.8C53.8 86.6 47.6 86 42.6 82.8C41 78.6 40.8 73.2 41.8 69.2Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
              <path
                d="M78.2 69.2C72.8 68.4 66.6 68.6 61.8 70V84.8C66.2 86.6 72.4 86 77.4 82.8C79 78.6 79.2 73.2 78.2 69.2Z"
                fill={`url(#${muscleMainId})`}
                stroke={muscleEdge}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />

              {/* Lower Tapered V-Core Abdominal Insertions */}
              <path
                d="M44.8 88.6C49.6 88 54.4 88 58.2 89.2V104.8C52.8 103 48.4 99.2 45.4 94L44.8 88.6Z"
                fill={`url(#${muscleDeepId})`}
                stroke={muscleEdge}
                strokeWidth="0.75"
                strokeLinejoin="round"
              />
              <path
                d="M75.2 88.6C70.4 88 65.6 88 61.8 89.2V104.8C67.2 103 71.6 99.2 74.6 94L75.2 88.6Z"
                fill={`url(#${muscleDeepId})`}
                stroke={muscleEdge}
                strokeWidth="0.75"
                strokeLinejoin="round"
              />
            </g>

            {/* Subtle Natural Navel (Umbilicus) Landmark */}
            <ellipse cx="60" cy="70.2" rx="1.6" ry="2.2" fill="rgba(10, 12, 18, 0.72)" />

            {/* Serratus Digit Contours & Soft Upper-Belly Studio Specular Highlights */}
            <path
              d="M26.4 43.2L33.8 49.4M27.8 53.4L34.4 59.8M29.8 64.4L34.8 70.6M93.6 43.2L86.2 49.4M92.2 53.4L85.6 59.8M90.2 64.4L85.2 70.6"
              stroke={fiberLight}
              strokeWidth="0.72"
              strokeLinecap="round"
            />
            <path
              d="M43.2 32.4C47.4 30.8 52.2 31 55.8 32.4M76.8 32.4C72.6 30.8 67.8 31 64.2 32.4M43.2 51.2C47.4 50.2 52.2 50.4 55.8 51.4M76.8 51.2C72.6 50.2 67.8 50.4 64.2 51.4M44 71C48 70.2 52.4 70.4 55.8 71.2M76 71C72 70.2 67.6 70.4 64.2 71.2"
              stroke={muscleRim}
              strokeWidth="0.95"
              strokeLinecap="round"
            />
            <path
              d="M20.2 26.8L22.6 46.8C24.4 57.6 27.6 67.8 29.2 76.6M99.8 26.8L97.4 46.8C95.6 57.6 92.4 67.8 90.8 76.6"
              stroke={rimHighlight}
              strokeWidth="0.95"
              strokeLinecap="round"
            />
          </g>
        )}
      </g>
    </svg>
  );
};

interface MuscleBadgeIconProps {
  muscle: MuscleGroup;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'thumb';
  tone?: 'cobalt' | 'volt' | 'amber' | 'muted';
  recommended?: boolean;
}

/**
 * Reusable Dark-Carbon 3D Anatomical Muscle Thumbnail:
 * - sm: 40x40px (compact readiness cards, routine chips)
 * - md: 48x48px (Active Workout logger, Swap modal)
 * - thumb: 56x56px rounded-xl (Exercise Library & Recommended Exercise rows with optional gold star corner badge)
 * - lg / xl: 56x56px rounded-2xl (Exercise Guide Modal header & featured displays)
 */
export const MuscleBadgeIcon: React.FC<MuscleBadgeIconProps> = ({
  muscle,
  size = 'md',
  tone = 'cobalt',
  recommended = false,
}) => {
  const boxClass =
    size === 'thumb'
      ? 'w-[60px] h-[60px] rounded-xl'
      : size === 'xl' || size === 'lg'
        ? 'w-14 h-14 rounded-2xl'
        : size === 'sm'
          ? 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl'
          : 'w-12 h-12 rounded-xl';

  const borderToneClass =
    tone === 'volt'
      ? 'border-[#FF4500]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(8,10,14,0.9)]'
      : tone === 'amber'
        ? 'border-[#FACC15]/38 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(8,10,14,0.9)]'
        : tone === 'muted'
          ? 'border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(8,10,14,0.9)]'
          : 'border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(8,10,14,0.92)]';

  const backlightGradient =
    tone === 'volt'
      ? 'radial-gradient(circle at 50% 44%, rgba(255,69,0,0.22) 0%, rgba(56,189,248,0.07) 58%, rgba(14,17,24,0) 82%)'
      : tone === 'amber'
        ? 'radial-gradient(circle at 50% 44%, rgba(250,204,21,0.14) 0%, rgba(255,69,0,0.06) 55%, rgba(14,17,24,0) 82%)'
        : tone === 'muted'
          ? 'radial-gradient(circle at 50% 44%, rgba(148,163,184,0.07) 0%, rgba(14,17,24,0) 74%)'
          : 'radial-gradient(circle at 50% 44%, rgba(255,85,0,0.16) 0%, rgba(56,189,248,0.07) 58%, rgba(10,12,16,0) 82%)';

  return (
    <div
      className={`${boxClass} ${borderToneClass} relative z-0 isolate border bg-gradient-to-br from-[#1C212C] via-[#12151C] to-[#0A0C10] flex items-center justify-center shrink-0 overflow-hidden`}
      title={recommended ? `${muscle} · ท่าแนะนำ` : muscle}
    >
      {/* Subtle Studio Radial Backlight inside Dark Carbon Container */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: backlightGradient }}
      />
      {/* Crisp Top Rim Highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1.5 top-0 z-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      <AnatomicalMuscleIcon
        muscle={muscle}
        className="w-full h-full relative z-0"
        activeGlow={tone !== 'muted'}
        showSecondary
      />
      {/* Minimal Gold Star Corner Badge — Strictly z-10 Inside Isolated Container */}
      {recommended && (
        <span
          aria-label="ท่าแนะนำ"
          title="ท่าแนะนำ (Recommended)"
          className="absolute top-1 right-1 z-10 w-4 h-4 rounded-full bg-[#090A0D]/90 ring-1 ring-[#FACC15]/60 flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.75)] pointer-events-none"
        >
          <svg
            viewBox="0 0 16 16"
            className="w-2.5 h-2.5 text-[#FACC15] fill-current"
            aria-hidden="true"
          >
            <path d="M8 1.4l1.9 3.85 4.25.62-3.08 3 .73 4.23L8 11.1l-3.8 2 .73-4.23-3.08-3 4.25-.62L8 1.4z" />
          </svg>
        </span>
      )}
    </div>
  );
};
