import React from 'react';
import { DailyEnergyMode } from '../types';

interface IconProps {
  className?: string;
  glow?: boolean;
}

/**
 * Geometric High-Output Peak Power / Kinetic Flame Icon (Beast Mode)
 */
export const PeakPowerIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', glow = false }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={glow ? { filter: 'drop-shadow(0 0 6px rgba(255, 69, 0, 0.85))' } : undefined}
    aria-hidden="true"
  >
    <path
      d="M10.4 1.8L14.8 7.4L13.1 8.5L16.2 12.6C16.9 14.9 15.1 17.8 11.4 18.2L12.3 14.6L10.1 12.4L8.3 14.7L9.1 18.1C5.2 17.7 3.4 14.7 4.2 12L7.4 7.7L6.1 6.7L10.4 1.8Z"
      fill="currentColor"
    />
    <path
      d="M10.1 8.2L12.1 10.9L10.1 13.1L8.1 10.9L10.1 8.2Z"
      fill="#090A0D"
      fillOpacity="0.45"
    />
  </svg>
);

/**
 * Geometric Precision Lightning / Kinetic Pulse Icon (Standard Mode)
 */
export const KineticPulseIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', glow = false }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={glow ? { filter: 'drop-shadow(0 0 6px rgba(255, 69, 0, 0.85))' } : undefined}
    aria-hidden="true"
  >
    <path
      d="M11.6 1.75L4.1 10.95H9.35L8.2 18.25L15.9 9.05H10.55L11.6 1.75Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * Geometric Cellular Shield / Recovery Pulse Icon (Recovery Mode)
 */
export const RecoveryShieldIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', glow = false }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={glow ? { filter: 'drop-shadow(0 0 6px rgba(255, 69, 0, 0.85))' } : undefined}
    aria-hidden="true"
  >
    <path
      d="M10 1.8L16.8 4.6V9.7C16.8 13.85 13.95 17.15 10 18.35C6.05 17.15 3.2 13.85 3.2 9.7V4.6L10 1.8Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="miter"
    />
    <path
      d="M6.4 10H8.35L9.55 7.4L11.05 12.1L12.1 10H13.6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

/**
 * Geometric Weekly Streak Kinetic Emblem Icon
 */
export const StreakFlameIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', glow = false }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={glow ? { filter: 'drop-shadow(0 0 6px rgba(255, 69, 0, 0.85))' } : undefined}
    aria-hidden="true"
  >
    <path
      d="M10.5 2L14.4 7.3L12.8 8.3L15.6 12.1C16.2 14.5 14.5 17.5 10 18C5.5 17.5 3.8 14.5 4.4 12.1L7.3 8.1L6 7.1L10.5 2Z"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinejoin="miter"
      fill="currentColor"
      fillOpacity={glow ? '0.28' : '0.1'}
    />
    <path d="M10 9.6L11.9 12.4L10 14.8L8.1 12.4L10 9.6Z" fill="currentColor" />
  </svg>
);

export const EnergyModeIcon: React.FC<{
  mode: DailyEnergyMode;
  active?: boolean;
  className?: string;
}> = ({ mode, active = false, className = 'w-3.5 h-3.5' }) => {
  switch (mode) {
    case 'beast':
      return <PeakPowerIcon className={className} glow={active} />;
    case 'standard':
      return <KineticPulseIcon className={className} glow={active} />;
    case 'recovery':
      return <RecoveryShieldIcon className={className} glow={active} />;
  }
};
