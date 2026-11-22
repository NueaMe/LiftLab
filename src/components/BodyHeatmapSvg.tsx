import React, { useId, useState } from 'react';
import { AthleteGender, MuscleGroup } from '../types';
import { MuscleReadinessItem, MuscleReadinessStatus } from '../utils/analytics';

interface BodyHeatmapSvgProps {
  items: MuscleReadinessItem[];
  selectedMuscle: MuscleGroup | null;
  onSelectMuscle: (muscle: MuscleGroup) => void;
  gender?: AthleteGender;
}

const STATUS_META: Record<
  MuscleReadinessStatus,
  {
    gradSuffix: string;
    hoverGlowSuffix: string;
    dotClass: string;
    textClass: string;
    pillBorderClass: string;
  }
> = {
  ready: {
    gradSuffix: 'volt',
    hoverGlowSuffix: 'hglow-volt',
    dotClass: 'bg-[#FF4500] shadow-[0_0_8px_#FF4500]',
    textClass: 'text-[#FF4500]',
    pillBorderClass: 'border-[#FF4500]/55 shadow-[0_0_22px_-8px_rgba(255,69,0,0.5)]',
  },
  recovering: {
    gradSuffix: 'amber',
    hoverGlowSuffix: 'hglow-amber',
    dotClass: 'bg-[#FACC15] shadow-[0_0_8px_#FACC15]',
    textClass: 'text-[#FACC15]',
    pillBorderClass: 'border-[#FACC15]/50 shadow-[0_0_22px_-8px_rgba(250,204,21,0.45)]',
  },
  low_volume: {
    gradSuffix: 'cobalt',
    hoverGlowSuffix: 'hglow-cobalt',
    dotClass: 'bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]',
    textClass: 'text-[#38BDF8]',
    pillBorderClass: 'border-[#38BDF8]/50 shadow-[0_0_22px_-8px_rgba(56,189,248,0.45)]',
  },
};

/**
 * True athletic male V-taper silhouette:
 * - Muscular neck & prominent trapezius rise, broad rounded deltoid shoulder caps
 * - Wide lat spread tapering to a narrow waist, thicker muscular arms/forearms
 * - Strong quadriceps sweep and sculpted calves
 */
function buildBalancedAthleticSilhouette(cx: number, view: 'front' | 'back'): string {
  const rx = (dx: number) => +(cx + dx).toFixed(2);
  const lx = (dx: number) => +(cx - dx).toFixed(2);

  const jawY = view === 'front' ? 58.2 : 55.2;
  const jawDx = view === 'front' ? 8.2 : 9.4;
  const neckDx = view === 'front' ? 9.6 : 10.4;
  const footOuterDx = view === 'front' ? 28.4 : 25.6;
  const footInnerDx = view === 'front' ? 12.2 : 12.4;
  const ankleInnerDx = view === 'front' ? 12.6 : 12.8;

  return [
    `M ${cx} 21.8`,
    `C ${rx(8.4)} 21.8 ${rx(13.8)} 26.2 ${rx(14.2)} 34.4`,
    `C ${rx(15.6)} 35.8 ${rx(15.6)} 41.6 ${rx(14.0)} 45.4`,
    `C ${rx(13.2)} 50.6 ${rx(11.6)} 55.0 ${rx(jawDx)} ${jawY}`,
    `C ${rx(8.6)} 62.2 ${rx(9.0)} 65.8 ${rx(neckDx)} 68.8`,
    `C ${rx(17.8)} 71.0 ${rx(26.8)} 73.0 ${rx(35.0)} 76.2`,
    `C ${rx(41.8)} 79.0 ${rx(45.0)} 86.2 ${rx(44.2)} 96.4`,
    `C ${rx(44.8)} 107.6 ${rx(45.6)} 119.4 ${rx(45.4)} 130.6`,
    `C ${rx(46.2)} 136.6 ${rx(48.2)} 143.4 ${rx(48.6)} 152.2`,
    `C ${rx(48.8)} 161.2 ${rx(47.2)} 169.8 ${rx(45.8)} 177.8`,
    `C ${rx(47.8)} 182.8 ${rx(48.4)} 189.0 ${rx(46.8)} 195.8`,
    `C ${rx(45.6)} 199.4 ${rx(43.2)} 200.4 ${rx(41.4)} 198.2`,
    `C ${rx(40.2)} 196.6 ${rx(40.0)} 192.8 ${rx(39.8)} 190.0`,
    `C ${rx(38.2)} 190.6 ${rx(37.0)} 189.6 ${rx(37.0)} 186.8`,
    `C ${rx(37.0)} 183.4 ${rx(38.0)} 179.8 ${rx(39.2)} 176.6`,
    `C ${rx(37.4)} 166.4 ${rx(35.8)} 155.4 ${rx(34.6)} 144.4`,
    `C ${rx(33.6)} 135.0 ${rx(33.2)} 124.8 ${rx(32.8)} 114.6`,
    `C ${rx(32.4)} 109.2 ${rx(31.8)} 105.4 ${rx(31.0)} 103.2`,
    `C ${rx(32.2)} 113.8 ${rx(29.8)} 127.6 ${rx(24.2)} 140.4`,
    `C ${rx(22.0)} 146.6 ${rx(21.6)} 154.0 ${rx(23.0)} 162.4`,
    `C ${rx(25.2)} 170.6 ${rx(27.6)} 178.4 ${rx(29.2)} 188.6`,
    `C ${rx(32.8)} 204.2 ${rx(32.2)} 223.0 ${rx(27.8)} 241.2`,
    `C ${rx(25.4)} 248.8 ${rx(24.4)} 254.8 ${rx(24.8)} 260.6`,
    `C ${rx(28.8)} 271.2 ${rx(29.2)} 285.0 ${rx(25.6)} 299.2`,
    `C ${rx(22.8)} 310.0 ${rx(20.8)} 319.6 ${rx(20.2)} 328.2`,
    `C ${rx(23.6)} 333.4 ${rx(footOuterDx)} 338.0 ${rx(footOuterDx - 0.6)} 343.2`,
    `C ${rx(footOuterDx - 1.6)} 346.6 ${rx(footInnerDx + 2.0)} 347.0 ${rx(footInnerDx)} 344.4`,
    `C ${rx(footInnerDx - 0.8)} 339.8 ${rx(ankleInnerDx)} 333.8 ${rx(ankleInnerDx)} 328.0`,
    `C ${rx(11.4)} 315.4 ${rx(10.2)} 300.6 ${rx(10.6)} 286.2`,
    `C ${rx(11.4)} 274.8 ${rx(13.2)} 265.6 ${rx(13.0)} 257.2`,
    `C ${rx(11.4)} 249.6 ${rx(9.2)} 241.2 ${rx(8.2)} 230.6`,
    `C ${rx(6.8)} 217.6 ${rx(4.6)} 204.2 ${rx(2.2)} 193.6`,
    `C ${rx(1.1)} 192.0 ${lx(1.1)} 192.0 ${lx(2.2)} 193.6`,
    `C ${lx(4.6)} 204.2 ${lx(6.8)} 217.6 ${lx(8.2)} 230.6`,
    `C ${lx(9.2)} 241.2 ${lx(11.4)} 249.6 ${lx(13.0)} 257.2`,
    `C ${lx(13.2)} 265.6 ${lx(11.4)} 274.8 ${lx(10.6)} 286.2`,
    `C ${lx(10.2)} 300.6 ${lx(11.4)} 315.4 ${lx(ankleInnerDx)} 328.0`,
    `C ${lx(ankleInnerDx)} 333.8 ${lx(footInnerDx - 0.8)} 339.8 ${lx(footInnerDx)} 344.4`,
    `C ${lx(footInnerDx + 2.0)} 347.0 ${lx(footOuterDx - 1.6)} 346.6 ${lx(footOuterDx - 0.6)} 343.2`,
    `C ${lx(footOuterDx)} 338.0 ${lx(23.6)} 333.4 ${lx(20.2)} 328.2`,
    `C ${lx(20.8)} 319.6 ${lx(22.8)} 310.0 ${lx(25.6)} 299.2`,
    `C ${lx(29.2)} 285.0 ${lx(28.8)} 271.2 ${lx(24.8)} 260.6`,
    `C ${lx(24.4)} 254.8 ${lx(25.4)} 248.8 ${lx(27.8)} 241.2`,
    `C ${lx(32.2)} 223.0 ${lx(32.8)} 204.2 ${lx(29.2)} 188.6`,
    `C ${lx(27.6)} 178.4 ${lx(25.2)} 170.6 ${lx(23.0)} 162.4`,
    `C ${lx(21.6)} 154.0 ${lx(22.0)} 146.6 ${lx(24.2)} 140.4`,
    `C ${lx(29.8)} 127.6 ${lx(32.2)} 113.8 ${lx(31.0)} 103.2`,
    `C ${lx(31.8)} 105.4 ${lx(32.4)} 109.2 ${lx(32.8)} 114.6`,
    `C ${lx(33.2)} 124.8 ${lx(33.6)} 135.0 ${lx(34.6)} 144.4`,
    `C ${lx(35.8)} 155.4 ${lx(37.4)} 166.4 ${lx(39.2)} 176.6`,
    `C ${lx(38.0)} 179.8 ${lx(37.0)} 183.4 ${lx(37.0)} 186.8`,
    `C ${lx(37.0)} 189.6 ${lx(38.2)} 190.6 ${lx(39.8)} 190.0`,
    `C ${lx(40.0)} 192.8 ${lx(40.2)} 196.6 ${lx(41.4)} 198.2`,
    `C ${lx(43.2)} 200.4 ${lx(45.6)} 199.4 ${lx(46.8)} 195.8`,
    `C ${lx(48.4)} 189.0 ${lx(47.8)} 182.8 ${lx(45.8)} 177.8`,
    `C ${lx(47.2)} 169.8 ${lx(48.8)} 161.2 ${lx(48.6)} 152.2`,
    `C ${lx(48.2)} 143.4 ${lx(46.2)} 136.6 ${lx(45.4)} 130.6`,
    `C ${lx(45.6)} 119.4 ${lx(44.8)} 107.6 ${lx(44.2)} 96.4`,
    `C ${lx(45.0)} 86.2 ${lx(41.8)} 79.0 ${lx(35.0)} 76.2`,
    `C ${lx(26.8)} 73.0 ${lx(17.8)} 71.0 ${lx(neckDx)} 68.8`,
    `C ${lx(9.0)} 65.8 ${lx(8.6)} 62.2 ${lx(jawDx)} ${jawY}`,
    `C ${lx(11.6)} 55.0 ${lx(13.2)} 50.6 ${lx(14.0)} 45.4`,
    `C ${lx(15.6)} 41.6 ${lx(15.6)} 35.8 ${lx(14.2)} 34.4`,
    `C ${lx(13.8)} 26.2 ${lx(8.4)} 21.8 ${cx} 21.8 Z`,
  ].join(' ');
}

/**
 * True athletic female hourglass silhouette:
 * - Sleek natural shoulders, slender neck/arms, noticeably narrower waist
 * - Wider, fuller curved hips and prominent rounded glutes (enhanced on Posterior Back view)
 * - Toned athletic thighs, knees, and calves
 */
function buildFemaleAthleticSilhouette(cx: number, view: 'front' | 'back'): string {
  const rx = (dx: number) => +(cx + dx).toFixed(2);
  const lx = (dx: number) => +(cx - dx).toFixed(2);

  const jawY = view === 'front' ? 57.4 : 54.6;
  const jawDx = view === 'front' ? 6.0 : 7.2;
  const neckDx = view === 'front' ? 6.2 : 6.8;
  const hipPeakDx = view === 'back' ? 35.4 : 33.8;
  const thighUpperDx = view === 'back' ? 34.4 : 32.8;
  const footOuterDx = view === 'front' ? 24.0 : 22.0;
  const footInnerDx = view === 'front' ? 11.4 : 11.6;
  const ankleInnerDx = view === 'front' ? 11.8 : 12.0;

  return [
    `M ${cx} 23.0`,
    `C ${rx(7.4)} 23.0 ${rx(12.2)} 27.2 ${rx(12.6)} 34.8`,
    `C ${rx(13.4)} 36.2 ${rx(13.4)} 41.2 ${rx(12.2)} 44.6`,
    `C ${rx(11.4)} 49.8 ${rx(9.4)} 54.2 ${rx(jawDx)} ${jawY}`,
    `C ${rx(5.6)} 61.8 ${rx(5.8)} 66.4 ${rx(neckDx)} 71.2`,
    `C ${rx(12.2)} 74.4 ${rx(19.0)} 76.8 ${rx(25.2)} 80.2`,
    `C ${rx(30.2)} 83.0 ${rx(32.6)} 88.8 ${rx(32.4)} 96.8`,
    `C ${rx(32.8)} 107.0 ${rx(34.6)} 118.4 ${rx(36.4)} 129.8`,
    `C ${rx(37.6)} 136.4 ${rx(39.4)} 143.4 ${rx(41.2)} 151.8`,
    `C ${rx(42.4)} 160.4 ${rx(42.2)} 169.0 ${rx(41.8)} 177.2`,
    `C ${rx(43.4)} 181.8 ${rx(44.0)} 187.4 ${rx(42.6)} 193.8`,
    `C ${rx(41.6)} 196.8 ${rx(39.8)} 197.8 ${rx(38.4)} 195.8`,
    `C ${rx(37.6)} 194.2 ${rx(37.4)} 190.8 ${rx(37.2)} 188.2`,
    `C ${rx(36.0)} 188.8 ${rx(35.2)} 187.8 ${rx(35.2)} 185.4`,
    `C ${rx(35.2)} 182.2 ${rx(36.2)} 179.0 ${rx(37.2)} 176.0`,
    `C ${rx(35.6)} 166.0 ${rx(33.4)} 155.4 ${rx(31.4)} 144.6`,
    `C ${rx(29.4)} 135.2 ${rx(27.6)} 125.2 ${rx(25.8)} 114.6`,
    `C ${rx(24.6)} 109.0 ${rx(23.6)} 105.4 ${rx(22.2)} 103.6`,
    `C ${rx(23.0)} 113.0 ${rx(20.8)} 124.2 ${rx(16.8)} 135.8`,
    `C ${rx(15.0)} 142.8 ${rx(15.4)} 149.8 ${rx(19.6)} 157.8`,
    `C ${rx(26.2)} 167.0 ${rx(hipPeakDx)} 176.8 ${rx(hipPeakDx)} 190.4`,
    `C ${rx(thighUpperDx)} 206.8 ${rx(30.4)} 225.2 ${rx(25.2)} 242.2`,
    `C ${rx(22.8)} 249.6 ${rx(21.8)} 255.2 ${rx(22.0)} 260.8`,
    `C ${rx(24.6)} 271.4 ${rx(24.8)} 284.8 ${rx(22.2)} 298.8`,
    `C ${rx(20.0)} 309.8 ${rx(18.4)} 319.4 ${rx(17.8)} 328.4`,
    `C ${rx(20.8)} 333.4 ${rx(footOuterDx)} 338.0 ${rx(footOuterDx - 0.6)} 343.2`,
    `C ${rx(footOuterDx - 1.6)} 346.6 ${rx(footInnerDx + 1.8)} 347.0 ${rx(footInnerDx)} 344.4`,
    `C ${rx(footInnerDx - 0.6)} 339.8 ${rx(ankleInnerDx)} 333.8 ${rx(ankleInnerDx)} 328.2`,
    `C ${rx(11.0)} 315.4 ${rx(10.0)} 300.6 ${rx(10.4)} 286.2`,
    `C ${rx(11.0)} 274.8 ${rx(12.2)} 265.6 ${rx(12.0)} 257.2`,
    `C ${rx(10.6)} 249.6 ${rx(8.6)} 241.2 ${rx(7.4)} 230.6`,
    `C ${rx(6.0)} 217.6 ${rx(4.2)} 204.6 ${rx(1.8)} 195.4`,
    `C ${rx(0.9)} 194.0 ${lx(0.9)} 194.0 ${lx(1.8)} 195.4`,
    `C ${lx(4.2)} 204.6 ${lx(6.0)} 217.6 ${lx(7.4)} 230.6`,
    `C ${lx(8.6)} 241.2 ${lx(10.6)} 249.6 ${lx(12.0)} 257.2`,
    `C ${lx(12.2)} 265.6 ${lx(11.0)} 274.8 ${lx(10.4)} 286.2`,
    `C ${lx(10.0)} 300.6 ${lx(11.0)} 315.4 ${lx(ankleInnerDx)} 328.2`,
    `C ${lx(ankleInnerDx)} 333.8 ${lx(footInnerDx - 0.6)} 339.8 ${lx(footInnerDx)} 344.4`,
    `C ${lx(footInnerDx + 1.8)} 347.0 ${lx(footOuterDx - 1.6)} 346.6 ${lx(footOuterDx - 0.6)} 343.2`,
    `C ${lx(footOuterDx)} 338.0 ${lx(20.8)} 333.4 ${lx(17.8)} 328.4`,
    `C ${lx(18.4)} 319.4 ${lx(20.0)} 309.8 ${lx(22.2)} 298.8`,
    `C ${lx(24.8)} 284.8 ${lx(24.6)} 271.4 ${lx(22.0)} 260.8`,
    `C ${lx(21.8)} 255.2 ${lx(22.8)} 249.6 ${lx(25.2)} 242.2`,
    `C ${lx(30.4)} 225.2 ${lx(thighUpperDx)} 206.8 ${lx(hipPeakDx)} 190.4`,
    `C ${lx(hipPeakDx)} 176.8 ${lx(26.2)} 167.0 ${lx(19.6)} 157.8`,
    `C ${lx(15.4)} 149.8 ${lx(15.0)} 142.8 ${lx(16.8)} 135.8`,
    `C ${lx(20.8)} 124.2 ${lx(23.0)} 113.0 ${lx(22.2)} 103.6`,
    `C ${lx(23.6)} 105.4 ${lx(24.6)} 109.0 ${lx(25.8)} 114.6`,
    `C ${lx(27.6)} 125.2 ${lx(29.4)} 135.2 ${lx(31.4)} 144.6`,
    `C ${lx(33.4)} 155.4 ${lx(35.6)} 166.0 ${lx(37.2)} 176.0`,
    `C ${lx(36.2)} 179.0 ${lx(35.2)} 182.2 ${lx(35.2)} 185.4`,
    `C ${lx(35.2)} 187.8 ${lx(36.0)} 188.8 ${lx(37.2)} 188.2`,
    `C ${lx(37.4)} 190.8 ${lx(37.6)} 194.2 ${lx(38.4)} 195.8`,
    `C ${lx(39.8)} 197.8 ${lx(41.6)} 196.8 ${lx(42.6)} 193.8`,
    `C ${lx(44.0)} 187.4 ${lx(43.4)} 181.8 ${lx(41.8)} 177.2`,
    `C ${lx(42.2)} 169.0 ${lx(42.4)} 160.4 ${lx(41.2)} 151.8`,
    `C ${lx(39.4)} 143.4 ${lx(37.6)} 136.4 ${lx(36.4)} 129.8`,
    `C ${lx(34.6)} 118.4 ${lx(32.8)} 107.0 ${lx(32.4)} 96.8`,
    `C ${lx(32.6)} 88.8 ${lx(30.2)} 83.0 ${lx(25.2)} 80.2`,
    `C ${lx(19.0)} 76.8 ${lx(12.2)} 74.4 ${lx(neckDx)} 71.2`,
    `C ${lx(5.8)} 66.4 ${lx(5.6)} 61.8 ${lx(jawDx)} ${jawY}`,
    `C ${lx(9.4)} 54.2 ${lx(11.4)} 49.8 ${lx(12.2)} 44.6`,
    `C ${lx(13.4)} 41.2 ${lx(13.4)} 36.2 ${lx(12.6)} 34.8`,
    `C ${lx(12.2)} 27.2 ${lx(7.4)} 23.0 ${cx} 23.0 Z`,
  ].join(' ');
}

/**
 * Interactive Dual Front & Back Anatomical Full-Body Muscle Heatmap SVG.
 * Supports balanced Male & Female athletic vector physiques (Nike Training Club & Fitbod inspired)
 * with soft-edged integrated muscle zones sitting flush inside the #181C24 body contour
 * and full interactive hover/click readiness states across all 7 muscle groups.
 */
export const BodyHeatmapSvg: React.FC<BodyHeatmapSvgProps> = ({
  items,
  selectedMuscle,
  onSelectMuscle,
  gender = 'male',
}) => {
  const uid = useId().replace(/:/g, '');
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroup | null>(null);
  const isFemale = gender === 'female';

  const statusByMuscle = items.reduce<Record<MuscleGroup, MuscleReadinessItem>>((acc, item) => {
    acc[item.muscle] = item;
    return acc;
  }, {} as Record<MuscleGroup, MuscleReadinessItem>);

  const activeFocusMuscle = hoveredMuscle ?? selectedMuscle;
  const inspectedInfo = activeFocusMuscle ? statusByMuscle[activeFocusMuscle] : null;
  const inspectedMeta = inspectedInfo ? STATUS_META[inspectedInfo.status] : null;

  const getMuscleVisual = (muscle: MuscleGroup) => {
    const info = statusByMuscle[muscle];
    const status: MuscleReadinessStatus = info?.status ?? 'ready';
    const meta = STATUS_META[status];
    const isSelected = selectedMuscle === muscle;
    const isHovered = hoveredMuscle === muscle;
    const isHighlighted = isSelected || isHovered;
    const isDimmed = activeFocusMuscle !== null && !isHighlighted;

    return {
      fill: `url(#hm-grad-${meta.gradSuffix}-${uid})`,
      fillSecondary: `url(#hm-grad-${meta.gradSuffix}-sub-${uid})`,
      stroke: isHighlighted ? 'rgba(255, 255, 255, 0.36)' : 'none',
      strokeWidth: isHighlighted ? 0.65 : 0,
      opacity: isDimmed ? 0.2 : isHighlighted ? 0.96 : 0.85,
      filter: isHighlighted ? `url(#hm-${meta.hoverGlowSuffix}-${uid})` : undefined,
      title: `${info?.labelTh ?? muscle} (${info?.labelEn ?? muscle}) · ${info?.statusLabelTh ?? 'พร้อมฝึก'} · ${info?.weeklySets ?? 0}/10 เซ็ต`,
      isSelected,
      isHovered,
    };
  };

  const makeInteractiveProps = (muscle: MuscleGroup, visual: ReturnType<typeof getMuscleVisual>) => ({
    onClick: () => onSelectMuscle(muscle),
    onMouseEnter: () => setHoveredMuscle(muscle),
    onMouseLeave: () => setHoveredMuscle((prev) => (prev === muscle ? null : prev)),
    onFocus: () => setHoveredMuscle(muscle),
    onBlur: () => setHoveredMuscle((prev) => (prev === muscle ? null : prev)),
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectMuscle(muscle);
      }
    },
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': visual.title,
    'aria-pressed': visual.isSelected,
    className: `cursor-pointer transition-opacity duration-200 focus:outline-none ${
      visual.isSelected ? 'anim-heatmap-active' : ''
    }`,
    opacity: visual.opacity,
    filter: visual.filter,
  });

  const chestV = getMuscleVisual('Chest');
  const shouldersV = getMuscleVisual('Shoulders');
  const bicepsV = getMuscleVisual('Biceps');
  const absV = getMuscleVisual('Abs');
  const backV = getMuscleVisual('Back');
  const tricepsV = getMuscleVisual('Triceps');
  const legsV = getMuscleVisual('Legs');

  // Balanced, crisp stage (viewBox 0 0 296 356): Front centered at 74, Back centered at 222
  const FX = 74;
  const BX = 222;
  const frontBodyPath = isFemale
    ? buildFemaleAthleticSilhouette(FX, 'front')
    : buildBalancedAthleticSilhouette(FX, 'front');
  const backBodyPath = isFemale
    ? buildFemaleAthleticSilhouette(BX, 'back')
    : buildBalancedAthleticSilhouette(BX, 'back');

  const fr = (dx: number) => +(FX + dx).toFixed(2);
  const fl = (dx: number) => +(FX - dx).toFixed(2);
  const br = (dx: number) => +(BX + dx).toFixed(2);
  const bl = (dx: number) => +(BX - dx).toFixed(2);

  // Subtle, minimal anatomical contour details (zero heavy stripes or harsh plates)
  const anatomyLine = 'rgba(148, 163, 184, 0.16)';
  const anatomyShadow = 'rgba(9, 11, 16, 0.34)';
  const bodyStroke = 'rgba(148, 163, 184, 0.24)';

  return (
    <div className="relative w-full max-w-full overflow-hidden flex flex-col items-center justify-center gap-2">
      <svg
        viewBox="0 0 296 356"
        className="w-full max-w-[356px] h-auto block select-none overflow-hidden"
        role="group"
        aria-label="แผนผังความพร้อมกล้ามเนื้อเต็มตัว 7 กลุ่ม ด้านหน้าและด้านหลัง"
      >
        <defs>
          {/* Clean Dark-Slate Matte Body Base (#181C24) */}
          <linearGradient id={`hm-body-${uid}`} x1="20%" y1="4%" x2="80%" y2="96%">
            <stop offset="0%" stopColor="#222834" />
            <stop offset="35%" stopColor="#1B2029" />
            <stop offset="75%" stopColor="#181C24" />
            <stop offset="100%" stopColor="#13161E" />
          </linearGradient>

          {/* Soft Ambient Studio Lighting Across the Slate Silhouette */}
          <radialGradient id={`hm-ambient-front-${uid}`} cx="38%" cy="22%" r="62%">
            <stop offset="0%" stopColor="rgba(226, 232, 240, 0.08)" />
            <stop offset="60%" stopColor="rgba(148, 163, 184, 0.02)" />
            <stop offset="100%" stopColor="rgba(15, 18, 26, 0)" />
          </radialGradient>
          <radialGradient id={`hm-ambient-back-${uid}`} cx="62%" cy="22%" r="62%">
            <stop offset="0%" stopColor="rgba(226, 232, 240, 0.08)" />
            <stop offset="60%" stopColor="rgba(148, 163, 184, 0.02)" />
            <stop offset="100%" stopColor="rgba(15, 18, 26, 0)" />
          </radialGradient>

          {/* Subtle Short Hair Contour */}
          <linearGradient id={`hm-hair-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0E1117" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#181C24" stopOpacity="0.12" />
          </linearGradient>

          {/* Body ClipPaths so Muscle Zones Sit Seamlessly Integrated Inside the #181C24 Contour */}
          <clipPath id={`hm-front-body-clip-${uid}`}>
            <path d={frontBodyPath} />
          </clipPath>
          <clipPath id={`hm-back-body-clip-${uid}`}>
            <path d={backBodyPath} />
          </clipPath>

          {/* Smooth Subtle Muscle Gradients: Ready (#FF4500) */}
          <linearGradient id={`hm-grad-volt-${uid}`} x1="15%" y1="6%" x2="85%" y2="94%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="48%" stopColor="#FF4500" />
            <stop offset="100%" stopColor="#B82C00" />
          </linearGradient>
          <linearGradient id={`hm-grad-volt-sub-${uid}`} x1="15%" y1="8%" x2="85%" y2="94%">
            <stop offset="0%" stopColor="#F25924" />
            <stop offset="55%" stopColor="#D63700" />
            <stop offset="100%" stopColor="#8F2200" />
          </linearGradient>

          {/* Smooth Subtle Muscle Gradients: Recovering (#FACC15) */}
          <linearGradient id={`hm-grad-amber-${uid}`} x1="15%" y1="6%" x2="85%" y2="94%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#B47B07" />
          </linearGradient>
          <linearGradient id={`hm-grad-amber-sub-${uid}`} x1="15%" y1="8%" x2="85%" y2="94%">
            <stop offset="0%" stopColor="#F4C922" />
            <stop offset="55%" stopColor="#CA9308" />
            <stop offset="100%" stopColor="#8A5E08" />
          </linearGradient>

          {/* Smooth Subtle Muscle Gradients: Low Volume (#38BDF8) */}
          <linearGradient id={`hm-grad-cobalt-${uid}`} x1="15%" y1="6%" x2="85%" y2="94%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id={`hm-grad-cobalt-sub-${uid}`} x1="15%" y1="8%" x2="85%" y2="94%">
            <stop offset="0%" stopColor="#56C2F6" />
            <stop offset="55%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Subtle Animated Athletic Heat-Scan Sweep */}
          <linearGradient id={`hm-scan-trail-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4500" stopOpacity="0" />
            <stop offset="76%" stopColor="#FF4500" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FF7847" stopOpacity="0.22" />
          </linearGradient>

          <clipPath id={`hm-stage-clip-${uid}`}>
            <rect x="2" y="2" width="292" height="352" rx="12" />
          </clipPath>

          {/* Subtle Studio Backdrop Grid */}
          <pattern id={`hm-grid-${uid}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <path
              d="M 18 0 L 0 0 0 18"
              fill="none"
              stroke="rgba(228, 228, 231, 0.035)"
              strokeWidth="0.65"
            />
          </pattern>

          {/* Subtle Ground Shadow */}
          <radialGradient id={`hm-pad-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF4500" stopOpacity="0.16" />
            <stop offset="58%" stopColor="#181C24" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0D0D0F" stopOpacity="0" />
          </radialGradient>

          {/* Refined Soft Hover / Active Focus Glow Filters (Only on Hover/Select — Clean Edges by Default) */}
          <filter id={`hm-hglow-volt-${uid}`} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="2.6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 1   0 0 0 0 0.27   0 0 0 0 0   0 0 0 0.52 0"
              result="tinted"
            />
            <feMerge>
              <feMergeNode in="tinted" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`hm-hglow-amber-${uid}`} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.98   0 0 0 0 0.80   0 0 0 0 0.08   0 0 0 0.48 0"
              result="tinted"
            />
            <feMerge>
              <feMergeNode in="tinted" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`hm-hglow-cobalt-${uid}`} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.22   0 0 0 0 0.74   0 0 0 0 0.97   0 0 0 0.48 0"
              result="tinted"
            />
            <feMerge>
              <feMergeNode in="tinted" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle Studio Backdrop Grid */}
        <rect x="2" y="2" width="292" height="352" rx="12" fill={`url(#hm-grid-${uid})`} />

        {/* Center Axis Divider */}
        <line
          x1="148"
          y1="14"
          x2="148"
          y2="348"
          stroke="rgba(228, 228, 231, 0.1)"
          strokeWidth="1"
          strokeDasharray="3 5"
        />

        {/* View Labels */}
        <text
          x={FX}
          y="14"
          textAnchor="middle"
          fill="#E4E4E7"
          fontSize="10"
          fontWeight="700"
          fontFamily="'Barlow Condensed', sans-serif"
          letterSpacing="2"
        >
          ANTERIOR · FRONT
        </text>
        <text
          x={BX}
          y="14"
          textAnchor="middle"
          fill="#E4E4E7"
          fontSize="10"
          fontWeight="700"
          fontFamily="'Barlow Condensed', sans-serif"
          letterSpacing="2"
        >
          POSTERIOR · BACK
        </text>

        {/* ===================== LEFT FIGURE: ANTERIOR · FRONT (CX = 74) ===================== */}
        <g transform="translate(0, 2)">
          {/* Ground Shadow */}
          <ellipse cx={FX} cy="346" rx={isFemale ? '40' : '44'} ry="5.5" fill={`url(#hm-pad-${uid})`} />

          {/* Sleek High-Crown Athletic Ponytail Contour Peeking Behind Female Head */}
          {isFemale && (
            <g pointerEvents="none">
              <path
                d={`M ${fl(5.6)} 24.4 C ${fl(3.2)} 18.8 ${fr(3.2)} 18.8 ${fr(5.6)} 24.4 Z`}
                fill="#0F131B"
                stroke={bodyStroke}
                strokeWidth="0.7"
              />
              <path
                d={`M ${fl(4.8)} 23.8 C ${fl(13.8)} 18.4 ${fl(21.4)} 24.0 ${fl(20.6)} 34.4 C ${fl(20.0)} 41.0 ${fl(22.6)} 47.0 ${fl(20.4)} 53.8 C ${fl(16.6)} 49.4 ${fl(15.6)} 43.2 ${fl(15.6)} 36.6 C ${fl(15.6)} 31.2 ${fl(12.8)} 27.4 ${fl(6.6)} 26.8 Z`}
                fill={`url(#hm-body-${uid})`}
                stroke={bodyStroke}
                strokeWidth="0.75"
                opacity="0.94"
              />
            </g>
          )}

          {/* Clean Dark-Slate Human Body Base (#181C24) */}
          <path d={frontBodyPath} fill={`url(#hm-body-${uid})`} />
          <path d={frontBodyPath} fill={`url(#hm-ambient-front-${uid})`} pointerEvents="none" />

          {/* Minimal Subtle Anatomical Landmarks */}
          <g pointerEvents="none">
            {isFemale ? (
              <>
                <path
                  d={`M ${fl(12.4)} 35.0 C ${fl(12.0)} 27.0 ${fl(7.4)} 23.0 ${FX} 23.0 C ${fr(7.4)} 23.0 ${fr(12.0)} 27.0 ${fr(12.4)} 35.0 C ${fr(8.8)} 30.6 ${fr(4.0)} 29.6 ${FX} 29.4 C ${fl(4.0)} 29.6 ${fl(8.8)} 30.6 ${fl(12.4)} 35.0 Z`}
                  fill={`url(#hm-hair-${uid})`}
                />
                <path
                  d={`M ${fl(6.0)} 56.8 Q ${FX} 61.8 ${fr(6.0)} 56.8 C ${fr(4.2)} 60.0 ${fl(4.2)} 60.0 ${fl(6.0)} 56.8 Z`}
                  fill={anatomyShadow}
                />
                <g stroke={anatomyLine} strokeWidth="0.72" strokeLinecap="round" fill="none">
                  <path d={`M ${fl(19.6)} 83.2 Q ${fl(10.6)} 85.0 ${fl(1.6)} 83.2 M ${fr(19.6)} 83.2 Q ${fr(10.6)} 85.0 ${fr(1.6)} 83.2`} />
                  {/* Subtle Contoured Feminine Chest / Athletic Sports-Bra Silhouette */}
                  <path
                    d={`M ${fl(21.4)} 104.2 C ${fl(21.2)} 114.0 ${fl(12.6)} 119.6 ${FX} 115.6 C ${fr(12.6)} 119.6 ${fr(21.2)} 114.0 ${fr(21.4)} 104.2`}
                    stroke="rgba(226, 232, 240, 0.24)"
                    strokeWidth="0.85"
                  />
                  <path
                    d={`M ${fl(19.8)} 118.4 Q ${FX} 120.6 ${fr(19.8)} 118.4`}
                    stroke="rgba(148, 163, 184, 0.20)"
                    strokeWidth="0.75"
                  />
                  <path d={`M ${fl(20.2)} 256.0 Q ${fl(17.0)} 253.6 ${fl(13.8)} 256.0 M ${fr(20.2)} 256.0 Q ${fr(17.0)} 253.6 ${fr(13.8)} 256.0`} />
                </g>
              </>
            ) : (
              <>
                <path
                  d={`M ${fl(14.0)} 34.4 C ${fl(13.6)} 26.2 ${fl(8.2)} 21.8 ${FX} 21.8 C ${fr(8.2)} 21.8 ${fr(13.6)} 26.2 ${fr(14.0)} 34.4 C ${fr(10.0)} 30.6 ${fr(5.4)} 29.4 ${FX} 29.4 C ${fl(5.4)} 29.4 ${fl(10.0)} 30.6 ${fl(14.0)} 34.4 Z`}
                  fill={`url(#hm-hair-${uid})`}
                />
                <path
                  d={`M ${fl(8.0)} 57.6 Q ${FX} 63.4 ${fr(8.0)} 57.6 C ${fr(5.4)} 61.2 ${fl(5.4)} 61.2 ${fl(8.0)} 57.6 Z`}
                  fill={anatomyShadow}
                />
                <g stroke={anatomyLine} strokeWidth="0.75" strokeLinecap="round" fill="none">
                  <path d={`M ${fl(28.4)} 80.2 Q ${fl(15.2)} 82.6 ${fl(2.0)} 80.4 M ${fr(28.4)} 80.2 Q ${fr(15.2)} 82.6 ${fr(2.0)} 80.4`} />
                  <path d={`M ${fl(23.0)} 255.8 Q ${fl(19.0)} 253.2 ${fl(15.2)} 255.8 M ${fr(23.0)} 255.8 Q ${fr(19.0)} 253.2 ${fr(15.2)} 255.8`} />
                </g>
              </>
            )}
          </g>

          {/* Integrated Soft-Edged Front Muscle Zones (Clipped Flush Inside Body Contour) */}
          <g clipPath={`url(#hm-front-body-clip-${uid})`}>
            {isFemale ? (
              <>
                <g {...makeInteractiveProps('Shoulders', shouldersV)}>
                  <title>{shouldersV.title}</title>
                  <path d={`M ${fl(21.4)} 80.6 C ${fl(28.2)} 82.4 ${fl(32.4)} 88.2 ${fl(32.4)} 96.8 C ${fl(32.2)} 102.2 ${fl(30.4)} 107.2 ${fl(27.2)} 110.0 C ${fl(24.2)} 104.6 ${fl(21.6)} 96.0 ${fl(19.6)} 86.6 C ${fl(19.4)} 83.8 ${fl(20.0)} 81.4 ${fl(21.4)} 80.6 Z`} fill={shouldersV.fill} stroke={shouldersV.stroke} strokeWidth={shouldersV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(21.4)} 80.6 C ${fr(28.2)} 82.4 ${fr(32.4)} 88.2 ${fr(32.4)} 96.8 C ${fr(32.2)} 102.2 ${fr(30.4)} 107.2 ${fr(27.2)} 110.0 C ${fr(24.2)} 104.6 ${fr(21.6)} 96.0 ${fr(19.6)} 86.6 C ${fr(19.4)} 83.8 ${fr(20.0)} 81.4 ${fr(21.4)} 80.6 Z`} fill={shouldersV.fill} stroke={shouldersV.stroke} strokeWidth={shouldersV.strokeWidth} strokeLinejoin="round" />
                </g>

                <g {...makeInteractiveProps('Chest', chestV)}>
                  <title>{chestV.title}</title>
                  <path d={`M ${fl(1.4)} 90.2 C ${fl(7.2)} 86.4 ${fl(15.6)} 87.2 ${fl(20.4)} 93.4 C ${fl(23.0)} 99.6 ${fl(22.4)} 109.6 ${fl(17.6)} 115.2 C ${fl(12.2)} 119.2 ${fl(4.6)} 118.4 ${fl(1.2)} 113.8 C ${fl(0.8)} 106.4 ${fl(0.8)} 97.4 ${fl(1.4)} 90.2 Z`} fill={chestV.fill} stroke={chestV.stroke} strokeWidth={chestV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(1.4)} 90.2 C ${fr(7.2)} 86.4 ${fr(15.6)} 87.2 ${fr(20.4)} 93.4 C ${fr(23.0)} 99.6 ${fr(22.4)} 109.6 ${fr(17.6)} 115.2 C ${fr(12.2)} 119.2 ${fr(4.6)} 118.4 ${fr(1.2)} 113.8 C ${fr(0.8)} 106.4 ${fr(0.8)} 97.4 ${fr(1.4)} 90.2 Z`} fill={chestV.fill} stroke={chestV.stroke} strokeWidth={chestV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fl(19.6)} 114.0 C ${fl(13.6)} 118.6 ${fl(5.8)} 118.2 ${FX} 114.2 C ${fr(5.8)} 118.2 ${fr(13.6)} 118.6 ${fr(19.6)} 114.0`} fill="none" stroke="rgba(15, 18, 26, 0.36)" strokeWidth="1.0" strokeLinecap="round" pointerEvents="none" />
                </g>

                <g {...makeInteractiveProps('Abs', absV)}>
                  <title>{absV.title}</title>
                  <path d={`M ${fl(18.8)} 123.0 C ${fl(15.4)} 127.6 ${fl(12.6)} 134.0 ${fl(11.4)} 142.0 C ${fl(10.8)} 148.6 ${fl(11.6)} 155.8 ${fl(13.8)} 162.8 C ${fl(16.6)} 159.4 ${fl(17.0)} 152.6 ${fl(15.8)} 145.6 C ${fl(15.6)} 137.8 ${fl(18.2)} 130.6 ${fl(18.8)} 123.0 Z`} fill={absV.fillSecondary} opacity="0.72" stroke={absV.stroke} strokeWidth={absV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(18.8)} 123.0 C ${fr(15.4)} 127.6 ${fr(12.6)} 134.0 ${fr(11.4)} 142.0 C ${fr(10.8)} 148.6 ${fr(11.6)} 155.8 ${fr(13.8)} 162.8 C ${fr(16.6)} 159.4 ${fr(17.0)} 152.6 ${fr(15.8)} 145.6 C ${fr(15.6)} 137.8 ${fr(18.2)} 130.6 ${fr(18.8)} 123.0 Z`} fill={absV.fillSecondary} opacity="0.72" stroke={absV.stroke} strokeWidth={absV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fl(8.8)} 123.4 C ${fl(6.2)} 121.6 ${fl(3.2)} 121.8 ${fl(1.3)} 123.8 C ${fl(1.1)} 135.6 ${fl(1.1)} 148.0 ${fl(1.3)} 159.8 C ${fl(4.0)} 161.0 ${fl(7.0)} 160.2 ${fl(8.6)} 157.8 C ${fl(9.4)} 147.8 ${fl(9.4)} 134.4 ${fl(8.8)} 123.4 Z`} fill={absV.fill} stroke={absV.stroke} strokeWidth={absV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(8.8)} 123.4 C ${fr(6.2)} 121.6 ${fr(3.2)} 121.8 ${fr(1.3)} 123.8 C ${fr(1.1)} 135.6 ${fr(1.1)} 148.0 ${fr(1.3)} 159.8 C ${fr(4.0)} 161.0 ${fr(7.0)} 160.2 ${fr(8.6)} 157.8 C ${fr(9.4)} 147.8 ${fr(9.4)} 134.4 ${fr(8.8)} 123.4 Z`} fill={absV.fill} stroke={absV.stroke} strokeWidth={absV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fl(8.4)} 163.2 C ${fl(6.0)} 162.4 ${fl(3.4)} 162.6 ${fl(1.3)} 163.8 C ${fl(1.1)} 168.4 ${fl(1.3)} 173.4 ${fl(1.7)} 176.8 C ${fl(4.6)} 175.0 ${fl(7.2)} 171.6 ${fl(8.6)} 167.4 Z`} fill={absV.fillSecondary} opacity="0.82" stroke={absV.stroke} strokeWidth={absV.strokeWidth} />
                  <path d={`M ${fr(8.4)} 163.2 C ${fr(6.0)} 162.4 ${fr(3.4)} 162.6 ${fr(1.3)} 163.8 C ${fr(1.1)} 168.4 ${fr(1.3)} 173.4 ${fr(1.7)} 176.8 C ${fr(4.6)} 175.0 ${fr(7.2)} 171.6 ${fr(8.6)} 167.4 Z`} fill={absV.fillSecondary} opacity="0.82" stroke={absV.stroke} strokeWidth={absV.strokeWidth} />
                </g>

                <g {...makeInteractiveProps('Biceps', bicepsV)}>
                  <title>{bicepsV.title}</title>
                  <path d={`M ${fl(28.4)} 109.2 C ${fl(32.0)} 112.4 ${fl(34.6)} 121.2 ${fl(34.6)} 130.8 C ${fl(33.8)} 135.2 ${fl(31.0)} 135.8 ${fl(28.6)} 131.6 C ${fl(26.4)} 125.6 ${fl(25.6)} 116.8 ${fl(26.4)} 110.2 Z`} fill={bicepsV.fill} stroke={bicepsV.stroke} strokeWidth={bicepsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(28.4)} 109.2 C ${fr(32.0)} 112.4 ${fr(34.6)} 121.2 ${fr(34.6)} 130.8 C ${fr(33.8)} 135.2 ${fr(31.0)} 135.8 ${fr(28.6)} 131.6 C ${fr(26.4)} 125.6 ${fr(25.6)} 116.8 ${fr(26.4)} 110.2 Z`} fill={bicepsV.fill} stroke={bicepsV.stroke} strokeWidth={bicepsV.strokeWidth} strokeLinejoin="round" />
                </g>

                <g {...makeInteractiveProps('Legs', legsV)}>
                  <title>{legsV.title}</title>
                  <path d={`M ${fl(22.0)} 163.6 C ${fl(29.8)} 171.2 ${fl(34.0)} 180.6 ${fl(33.2)} 193.4 C ${fl(28.6)} 191.8 ${fl(23.4)} 189.0 ${fl(19.2)} 184.6 C ${fl(18.8)} 177.0 ${fl(19.8)} 169.4 ${fl(22.0)} 163.6 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(22.0)} 163.6 C ${fr(29.8)} 171.2 ${fr(34.0)} 180.6 ${fr(33.2)} 193.4 C ${fr(28.6)} 191.8 ${fr(23.4)} 189.0 ${fr(19.2)} 184.6 C ${fr(18.8)} 177.0 ${fr(19.8)} 169.4 ${fr(22.0)} 163.6 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fl(32.0)} 194.2 C ${fl(32.6)} 209.0 ${fl(30.2)} 226.8 ${fl(24.4)} 244.4 C ${fl(22.2)} 249.8 ${fl(17.8)} 250.6 ${fl(15.2)} 247.0 C ${fl(13.4)} 232.0 ${fl(11.8)} 215.2 ${fl(11.2)} 201.8 C ${fl(13.8)} 196.4 ${fl(17.6)} 192.6 ${fl(21.4)} 190.4 Z`} fill={legsV.fill} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(32.0)} 194.2 C ${fr(32.6)} 209.0 ${fr(30.2)} 226.8 ${fr(24.4)} 244.4 C ${fr(22.2)} 249.8 ${fr(17.8)} 250.6 ${fr(15.2)} 247.0 C ${fr(13.4)} 232.0 ${fr(11.8)} 215.2 ${fr(11.2)} 201.8 C ${fr(13.8)} 196.4 ${fr(17.6)} 192.6 ${fr(21.4)} 190.4 Z`} fill={legsV.fill} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fl(11.2)} 215.6 C ${fl(8.6)} 224.2 ${fl(8.6)} 236.2 ${fl(11.4)} 246.4 C ${fl(12.8)} 249.6 ${fl(15.4)} 250.0 ${fl(16.6)} 246.8 C ${fl(16.0)} 235.6 ${fl(14.2)} 224.8 ${fl(11.2)} 215.6 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(11.2)} 215.6 C ${fr(8.6)} 224.2 ${fr(8.6)} 236.2 ${fr(11.4)} 246.4 C ${fr(12.8)} 249.6 ${fr(15.4)} 250.0 ${fr(16.6)} 246.8 C ${fr(16.0)} 235.6 ${fr(14.2)} 224.8 ${fr(11.2)} 215.6 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                </g>
              </>
            ) : (
              <>
                <g {...makeInteractiveProps('Shoulders', shouldersV)}>
                  <title>{shouldersV.title}</title>
                  <path d={`M ${fl(29.0)} 76.6 C ${fl(38.4)} 78.0 ${fl(44.6)} 85.4 ${fl(44.2)} 96.8 C ${fl(43.8)} 103.6 ${fl(41.2)} 109.6 ${fl(36.8)} 112.8 C ${fl(32.8)} 106.4 ${fl(29.4)} 96.0 ${fl(27.0)} 84.8 C ${fl(26.6)} 81.6 ${fl(27.4)} 78.2 ${fl(29.0)} 76.6 Z`} fill={shouldersV.fill} stroke={shouldersV.stroke} strokeWidth={shouldersV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(29.0)} 76.6 C ${fr(38.4)} 78.0 ${fr(44.6)} 85.4 ${fr(44.2)} 96.8 C ${fr(43.8)} 103.6 ${fr(41.2)} 109.6 ${fr(36.8)} 112.8 C ${fr(32.8)} 106.4 ${fr(29.4)} 96.0 ${fr(27.0)} 84.8 C ${fr(26.6)} 81.6 ${fr(27.4)} 78.2 ${fr(29.0)} 76.6 Z`} fill={shouldersV.fill} stroke={shouldersV.stroke} strokeWidth={shouldersV.strokeWidth} strokeLinejoin="round" />
                </g>

                <g {...makeInteractiveProps('Chest', chestV)}>
                  <title>{chestV.title}</title>
                  <path d={`M ${fl(1.6)} 85.4 C ${fl(10.8)} 82.4 ${fl(23.2)} 83.2 ${fl(29.6)} 90.0 C ${fl(32.4)} 96.8 ${fl(30.4)} 108.4 ${fl(23.6)} 113.8 C ${fl(16.6)} 118.0 ${fl(6.8)} 117.4 ${fl(1.4)} 113.2 C ${fl(0.8)} 104.8 ${fl(1.0)} 94.4 ${fl(1.6)} 85.4 Z`} fill={chestV.fill} stroke={chestV.stroke} strokeWidth={chestV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(1.6)} 85.4 C ${fr(10.8)} 82.4 ${fr(23.2)} 83.2 ${fr(29.6)} 90.0 C ${fr(32.4)} 96.8 ${fr(30.4)} 108.4 ${fr(23.6)} 113.8 C ${fr(16.6)} 118.0 ${fr(6.8)} 117.4 ${fr(1.4)} 113.2 C ${fr(0.8)} 104.8 ${fr(1.0)} 94.4 ${fr(1.6)} 85.4 Z`} fill={chestV.fill} stroke={chestV.stroke} strokeWidth={chestV.strokeWidth} strokeLinejoin="round" />
                </g>

                <g {...makeInteractiveProps('Abs', absV)}>
                  <title>{absV.title}</title>
                  <path d={`M ${fl(26.6)} 119.8 C ${fl(21.8)} 124.8 ${fl(17.8)} 132.0 ${fl(14.8)} 141.0 C ${fl(13.6)} 148.2 ${fl(13.6)} 155.8 ${fl(14.2)} 163.2 C ${fl(18.0)} 160.8 ${fl(20.4)} 154.8 ${fl(21.2)} 147.6 C ${fl(22.8)} 138.6 ${fl(26.6)} 129.2 ${fl(26.6)} 119.8 Z`} fill={absV.fillSecondary} opacity="0.76" stroke={absV.stroke} strokeWidth={absV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(26.6)} 119.8 C ${fr(21.8)} 124.8 ${fr(17.8)} 132.0 ${fr(14.8)} 141.0 C ${fr(13.6)} 148.2 ${fr(13.6)} 155.8 ${fr(14.2)} 163.2 C ${fr(18.0)} 160.8 ${fr(20.4)} 154.8 ${fr(21.2)} 147.6 C ${fr(22.8)} 138.6 ${fr(26.6)} 129.2 ${fr(26.6)} 119.8 Z`} fill={absV.fillSecondary} opacity="0.76" stroke={absV.stroke} strokeWidth={absV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fl(11.4)} 121.4 C ${fl(8.2)} 119.2 ${fl(4.2)} 119.4 ${fl(1.6)} 121.6 C ${fl(1.2)} 125.0 ${fl(1.4)} 128.6 ${fl(1.8)} 131.4 C ${fl(4.8)} 132.6 ${fl(8.8)} 132.2 ${fl(11.4)} 130.0 C ${fl(12.2)} 127.2 ${fl(12.2)} 123.8 ${fl(11.4)} 121.4 Z`} fill={absV.fill} stroke={absV.stroke} strokeWidth={absV.strokeWidth} />
                  <path d={`M ${fr(11.4)} 121.4 C ${fr(8.2)} 119.2 ${fr(4.2)} 119.4 ${fr(1.6)} 121.6 C ${fr(1.2)} 125.0 ${fr(1.4)} 128.6 ${fr(1.8)} 131.4 C ${fr(4.8)} 132.6 ${fr(8.8)} 132.2 ${fr(11.4)} 130.0 C ${fr(12.2)} 127.2 ${fr(12.2)} 123.8 ${fr(11.4)} 121.4 Z`} fill={absV.fill} stroke={absV.stroke} strokeWidth={absV.strokeWidth} />
                  <path d={`M ${fl(11.4)} 135.0 C ${fl(8.4)} 133.6 ${fl(4.4)} 133.8 ${fl(1.6)} 135.4 C ${fl(1.2)} 138.8 ${fl(1.4)} 142.8 ${fl(1.8)} 145.6 C ${fl(4.8)} 146.8 ${fl(8.6)} 146.2 ${fl(11.0)} 144.0 C ${fl(12.0)} 141.0 ${fl(12.0)} 137.6 ${fl(11.4)} 135.0 Z`} fill={absV.fill} stroke={absV.stroke} strokeWidth={absV.strokeWidth} />
                  <path d={`M ${fr(11.4)} 135.0 C ${fr(8.4)} 133.6 ${fr(4.4)} 133.8 ${fr(1.6)} 135.4 C ${fr(1.2)} 138.8 ${fr(1.4)} 142.8 ${fr(1.8)} 145.6 C ${fr(4.8)} 146.8 ${fr(8.6)} 146.2 ${fr(11.0)} 144.0 C ${fr(12.0)} 141.0 ${fr(12.0)} 137.6 ${fr(11.4)} 135.0 Z`} fill={absV.fill} stroke={absV.stroke} strokeWidth={absV.strokeWidth} />
                  <path d={`M ${fl(10.8)} 149.2 C ${fl(7.8)} 148.0 ${fl(4.2)} 148.2 ${fl(1.6)} 149.6 C ${fl(1.2)} 153.2 ${fl(1.4)} 157.0 ${fl(1.8)} 160.0 C ${fl(4.6)} 161.2 ${fl(8.0)} 160.4 ${fl(10.2)} 158.0 C ${fl(11.4)} 155.2 ${fl(11.4)} 151.8 ${fl(10.8)} 149.2 Z`} fill={absV.fill} stroke={absV.stroke} strokeWidth={absV.strokeWidth} />
                  <path d={`M ${fr(10.8)} 149.2 C ${fr(7.8)} 148.0 ${fr(4.2)} 148.2 ${fr(1.6)} 149.6 C ${fr(1.2)} 153.2 ${fr(1.4)} 157.0 ${fr(1.8)} 160.0 C ${fr(4.6)} 161.2 ${fr(8.0)} 160.4 ${fr(10.2)} 158.0 C ${fr(11.4)} 155.2 ${fr(11.4)} 151.8 ${fr(10.8)} 149.2 Z`} fill={absV.fill} stroke={absV.stroke} strokeWidth={absV.strokeWidth} />
                  <path d={`M ${fl(9.4)} 163.2 C ${fl(6.8)} 162.4 ${fl(3.8)} 162.6 ${fl(1.6)} 163.8 C ${fl(1.4)} 168.4 ${fl(1.6)} 173.4 ${fl(2.0)} 176.8 C ${fl(5.2)} 175.0 ${fl(8.0)} 171.6 ${fl(9.6)} 167.6 C ${fl(9.8)} 165.8 ${fl(9.8)} 164.4 ${fl(9.4)} 163.2 Z`} fill={absV.fillSecondary} opacity="0.82" stroke={absV.stroke} strokeWidth={absV.strokeWidth} />
                  <path d={`M ${fr(9.4)} 163.2 C ${fr(6.8)} 162.4 ${fr(3.8)} 162.6 ${fr(1.6)} 163.8 C ${fr(1.4)} 168.4 ${fr(1.6)} 173.4 ${fr(2.0)} 176.8 C ${fr(5.2)} 175.0 ${fr(8.0)} 171.6 ${fr(9.6)} 167.6 C ${fr(9.8)} 165.8 ${fr(9.8)} 164.4 ${fr(9.4)} 163.2 Z`} fill={absV.fillSecondary} opacity="0.82" stroke={absV.stroke} strokeWidth={absV.strokeWidth} />
                </g>

                <g {...makeInteractiveProps('Biceps', bicepsV)}>
                  <title>{bicepsV.title}</title>
                  <path d={`M ${fl(38.0)} 109.6 C ${fl(43.2)} 113.0 ${fl(45.6)} 122.4 ${fl(44.8)} 132.8 C ${fl(43.8)} 138.2 ${fl(39.4)} 139.0 ${fl(35.8)} 134.0 C ${fl(33.2)} 127.0 ${fl(32.8)} 117.4 ${fl(34.4)} 110.4 Z`} fill={bicepsV.fill} stroke={bicepsV.stroke} strokeWidth={bicepsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(38.0)} 109.6 C ${fr(43.2)} 113.0 ${fr(45.6)} 122.4 ${fr(44.8)} 132.8 C ${fr(43.8)} 138.2 ${fr(39.4)} 139.0 ${fr(35.8)} 134.0 C ${fr(33.2)} 127.0 ${fr(32.8)} 117.4 ${fr(34.4)} 110.4 Z`} fill={bicepsV.fill} stroke={bicepsV.stroke} strokeWidth={bicepsV.strokeWidth} strokeLinejoin="round" />
                </g>

                <g {...makeInteractiveProps('Legs', legsV)}>
                  <title>{legsV.title}</title>
                  <path d={`M ${fl(29.0)} 190.0 C ${fl(33.0)} 205.2 ${fl(32.0)} 224.4 ${fl(26.8)} 243.6 C ${fl(24.6)} 249.4 ${fl(19.6)} 250.6 ${fl(16.6)} 246.8 C ${fl(14.8)} 231.6 ${fl(13.2)} 214.4 ${fl(12.6)} 201.4 C ${fl(14.8)} 196.0 ${fl(17.4)} 191.6 ${fl(20.0)} 188.8 Z`} fill={legsV.fill} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(29.0)} 190.0 C ${fr(33.0)} 205.2 ${fr(32.0)} 224.4 ${fr(26.8)} 243.6 C ${fr(24.6)} 249.4 ${fr(19.6)} 250.6 ${fr(16.6)} 246.8 C ${fr(14.8)} 231.6 ${fr(13.2)} 214.4 ${fr(12.6)} 201.4 C ${fr(14.8)} 196.0 ${fr(17.4)} 191.6 ${fr(20.0)} 188.8 Z`} fill={legsV.fill} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fl(12.6)} 214.4 C ${fl(9.4)} 223.4 ${fl(9.4)} 235.6 ${fl(12.6)} 246.2 C ${fl(14.2)} 249.8 ${fl(17.2)} 250.2 ${fl(18.4)} 246.8 C ${fl(17.8)} 235.2 ${fl(15.6)} 224.0 ${fl(12.6)} 214.4 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${fr(12.6)} 214.4 C ${fr(9.4)} 223.4 ${fr(9.4)} 235.6 ${fr(12.6)} 246.2 C ${fr(14.2)} 249.8 ${fr(17.2)} 250.2 ${fr(18.4)} 246.8 C ${fr(17.8)} 235.2 ${fr(15.6)} 224.0 ${fr(12.6)} 214.4 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                </g>
              </>
            )}
          </g>

          {/* Clean Outer Human Silhouette Contour Overlay (Keeps Muscle Zones Integrated Inside) */}
          <path
            d={frontBodyPath}
            fill="none"
            stroke={bodyStroke}
            strokeWidth="0.9"
            strokeLinejoin="round"
            pointerEvents="none"
          />
        </g>

        {/* ===================== RIGHT FIGURE: POSTERIOR · BACK (CX = 222) ===================== */}
        <g transform="translate(0, 2)">
          {/* Ground Shadow */}
          <ellipse cx={BX} cy="346" rx={isFemale ? '40' : '44'} ry="5.5" fill={`url(#hm-pad-${uid})`} />

          {/* Clean Dark-Slate Human Body Base (#181C24) */}
          <path d={backBodyPath} fill={`url(#hm-body-${uid})`} />
          <path d={backBodyPath} fill={`url(#hm-ambient-back-${uid})`} pointerEvents="none" />

          {/* Minimal Subtle Posterior Landmarks */}
          <g pointerEvents="none">
            {isFemale ? (
              <>
                <path d={`M ${bl(12.2)} 44.6 C ${bl(12.8)} 31.8 ${bl(8.0)} 23.0 ${BX} 23.0 C ${br(8.0)} 23.0 ${br(12.8)} 31.8 ${br(12.2)} 44.6 C ${br(9.4)} 50.4 ${br(5.6)} 53.4 ${BX} 53.6 C ${bl(5.6)} 53.4 ${bl(9.4)} 50.4 ${bl(12.2)} 44.6 Z`} fill={`url(#hm-hair-${uid})`} />
                {/* Sleek Centered Tapered Athletic Ponytail with Hairband */}
                <path d={`M ${BX} 36.4 C ${br(5.4)} 37.2 ${br(7.8)} 46.8 ${br(5.6)} 58.6 C ${br(4.2)} 65.4 ${br(1.6)} 71.2 ${BX} 74.0 C ${bl(1.6)} 71.2 ${bl(4.2)} 65.4 ${bl(5.6)} 58.6 C ${bl(7.8)} 46.8 ${bl(5.4)} 37.2 ${BX} 36.4 Z`} fill="#0E1117" fillOpacity="0.92" stroke="rgba(148,163,184,0.26)" strokeWidth="0.72" />
                <rect x={bl(2.8)} y="35.6" width="5.6" height="2.1" rx="1" fill="#FF4500" fillOpacity="0.78" />
                <g stroke={anatomyLine} strokeWidth="0.72" strokeLinecap="round" fill="none">
                  <line x1={BX} y1="76.0" x2={BX} y2="164.0" />
                  <path d={`M ${bl(20.4)} 257.2 Q ${bl(16.8)} 259.4 ${bl(13.2)} 257.2 M ${br(20.4)} 257.2 Q ${br(16.8)} 259.4 ${br(13.2)} 257.2`} />
                  <path d={`M ${bl(16.4)} 304.0 C ${bl(16.2)} 314.8 ${bl(15.8)} 324.2 ${bl(15.6)} 333.2 M ${br(16.4)} 304.0 C ${br(16.2)} 314.8 ${br(15.8)} 324.2 ${br(15.6)} 333.2`} />
                </g>
              </>
            ) : (
              <>
                <path d={`M ${bl(14.0)} 45.4 C ${bl(14.6)} 31.8 ${bl(9.2)} 21.8 ${BX} 21.8 C ${br(9.2)} 21.8 ${br(14.6)} 31.8 ${br(14.0)} 45.4 C ${br(11.0)} 51.6 ${br(6.8)} 54.6 ${BX} 54.8 C ${bl(6.8)} 54.6 ${bl(11.0)} 51.6 ${bl(14.0)} 45.4 Z`} fill={`url(#hm-hair-${uid})`} />
                <g stroke={anatomyLine} strokeWidth="0.75" strokeLinecap="round" fill="none">
                  <line x1={BX} y1="71.0" x2={BX} y2="165.0" />
                  <path d={`M ${bl(23.0)} 256.8 Q ${bl(18.6)} 259.2 ${bl(14.4)} 256.8 M ${br(23.0)} 256.8 Q ${br(18.6)} 259.2 ${br(14.4)} 256.8`} />
                  <path d={`M ${bl(18.2)} 304.0 C ${bl(18.0)} 314.8 ${bl(17.6)} 324.2 ${bl(17.4)} 333.2 M ${br(18.2)} 304.0 C ${br(18.0)} 314.8 ${br(17.6)} 324.2 ${br(17.4)} 333.2`} />
                </g>
              </>
            )}
          </g>

          {/* Integrated Soft-Edged Back Muscle Zones (Clipped Flush Inside Body Contour) */}
          <g clipPath={`url(#hm-back-body-clip-${uid})`}>
            {isFemale ? (
              <>
                <g {...makeInteractiveProps('Shoulders', shouldersV)}>
                  <title>{shouldersV.title}</title>
                  <path d={`M ${bl(21.4)} 80.6 C ${bl(28.2)} 82.4 ${bl(32.4)} 88.2 ${bl(32.4)} 96.8 C ${bl(32.2)} 102.2 ${bl(30.4)} 107.2 ${bl(27.2)} 110.0 C ${bl(24.2)} 104.6 ${bl(21.6)} 96.0 ${bl(19.6)} 86.6 C ${bl(19.4)} 83.8 ${bl(20.0)} 81.4 ${bl(21.4)} 80.6 Z`} fill={shouldersV.fill} stroke={shouldersV.stroke} strokeWidth={shouldersV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(21.4)} 80.6 C ${br(28.2)} 82.4 ${br(32.4)} 88.2 ${br(32.4)} 96.8 C ${br(32.2)} 102.2 ${br(30.4)} 107.2 ${br(27.2)} 110.0 C ${br(24.2)} 104.6 ${br(21.6)} 96.0 ${br(19.6)} 86.6 C ${br(19.4)} 83.8 ${br(20.0)} 81.4 ${br(21.4)} 80.6 Z`} fill={shouldersV.fill} stroke={shouldersV.stroke} strokeWidth={shouldersV.strokeWidth} strokeLinejoin="round" />
                </g>

                <g {...makeInteractiveProps('Back', backV)}>
                  <title>{backV.title}</title>
                  <path d={`M ${BX} 72.8 C ${br(5.8)} 75.0 ${br(12.2)} 77.8 ${br(17.0)} 82.0 C ${br(18.4)} 83.6 ${br(18.6)} 86.6 ${br(17.2)} 90.6 C ${br(14.6)} 98.2 ${br(10.8)} 106.4 ${br(6.6)} 113.2 C ${br(3.8)} 117.4 ${br(1.6)} 119.6 ${BX} 120.4 C ${bl(1.6)} 119.6 ${bl(3.8)} 117.4 ${bl(6.6)} 113.2 C ${bl(10.8)} 106.4 ${bl(14.6)} 98.2 ${bl(17.2)} 90.6 C ${bl(18.6)} 86.6 ${bl(18.4)} 83.6 ${bl(17.0)} 82.0 C ${bl(12.2)} 77.8 ${bl(5.8)} 75.0 ${BX} 72.8 Z`} fill={backV.fillSecondary} stroke={backV.stroke} strokeWidth={backV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${bl(20.2)} 97.2 C ${bl(22.4)} 107.2 ${bl(20.8)} 121.2 ${bl(16.0)} 135.8 C ${bl(13.2)} 145.6 ${bl(8.4)} 151.0 ${bl(1.6)} 151.8 C ${bl(1.2)} 143.2 ${bl(1.2)} 133.6 ${bl(1.6)} 124.8 C ${bl(6.4)} 120.2 ${bl(10.8)} 113.6 ${bl(14.2)} 106.6 C ${bl(16.6)} 102.0 ${bl(18.4)} 98.8 ${bl(20.2)} 97.2 Z`} fill={backV.fill} stroke={backV.stroke} strokeWidth={backV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(20.2)} 97.2 C ${br(22.4)} 107.2 ${br(20.8)} 121.2 ${br(16.0)} 135.8 C ${br(13.2)} 145.6 ${br(8.4)} 151.0 ${br(1.6)} 151.8 C ${br(1.2)} 143.2 ${br(1.2)} 133.6 ${br(1.6)} 124.8 C ${br(6.4)} 120.2 ${br(10.8)} 113.6 ${br(14.2)} 106.6 C ${br(16.6)} 102.0 ${br(18.4)} 98.8 ${br(20.2)} 97.2 Z`} fill={backV.fill} stroke={backV.stroke} strokeWidth={backV.strokeWidth} strokeLinejoin="round" />
                </g>

                <g {...makeInteractiveProps('Triceps', tricepsV)}>
                  <title>{tricepsV.title}</title>
                  <path d={`M ${bl(28.4)} 109.0 C ${bl(32.2)} 112.6 ${bl(34.6)} 121.8 ${bl(34.4)} 131.6 C ${bl(33.6)} 135.6 ${bl(31.4)} 135.4 ${bl(30.0)} 131.2 C ${bl(29.4)} 128.4 ${bl(29.4)} 125.2 ${bl(28.8)} 123.4 C ${bl(28.2)} 125.2 ${bl(28.0)} 128.2 ${bl(27.6)} 130.6 C ${bl(25.8)} 124.6 ${bl(25.4)} 116.0 ${bl(26.4)} 110.0 Z`} fill={tricepsV.fill} stroke={tricepsV.stroke} strokeWidth={tricepsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(28.4)} 109.0 C ${br(32.2)} 112.6 ${br(34.6)} 121.8 ${br(34.4)} 131.6 C ${br(33.6)} 135.6 ${br(31.4)} 135.4 ${br(30.0)} 131.2 C ${br(29.4)} 128.4 ${br(29.4)} 125.2 ${br(28.8)} 123.4 C ${br(28.2)} 125.2 ${br(28.0)} 128.2 ${br(27.6)} 130.6 C ${br(25.8)} 124.6 ${br(25.4)} 116.0 ${br(26.4)} 110.0 Z`} fill={tricepsV.fill} stroke={tricepsV.stroke} strokeWidth={tricepsV.strokeWidth} strokeLinejoin="round" />
                </g>

                <g {...makeInteractiveProps('Legs', legsV)}>
                  <title>{legsV.title}</title>
                  {/* Prominent Full Rounded Female Glutes */}
                  <path d={`M ${bl(1.0)} 161.2 C ${bl(14.8)} 157.4 ${bl(30.6)} 164.8 ${bl(34.4)} 180.0 C ${bl(35.8)} 193.6 ${bl(23.8)} 203.0 ${bl(6.2)} 200.2 C ${bl(2.6)} 199.0 ${bl(1.0)} 195.0 ${bl(1.0)} 190.2 Z`} fill={legsV.fill} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(1.0)} 161.2 C ${br(14.8)} 157.4 ${br(30.6)} 164.8 ${br(34.4)} 180.0 C ${br(35.8)} 193.6 ${br(23.8)} 203.0 ${br(6.2)} 200.2 C ${br(2.6)} 199.0 ${br(1.0)} 195.0 ${br(1.0)} 190.2 Z`} fill={legsV.fill} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${bl(29.0)} 196.4 C ${bl(20.6)} 202.8 ${bl(9.8)} 202.6 ${bl(2.2)} 197.8 M ${br(29.0)} 196.4 C ${br(20.6)} 202.8 ${br(9.8)} 202.6 ${br(2.2)} 197.8`} fill="none" stroke="rgba(12, 15, 22, 0.42)" strokeWidth="1.05" strokeLinecap="round" pointerEvents="none" />
                  <path d={`M ${bl(32.0)} 201.4 C ${bl(32.2)} 216.0 ${bl(29.2)} 232.6 ${bl(23.0)} 248.4 C ${bl(20.4)} 252.4 ${bl(14.6)} 251.4 ${bl(12.6)} 245.8 C ${bl(9.2)} 230.8 ${bl(7.8)} 214.0 ${bl(8.8)} 201.4 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(32.0)} 201.4 C ${br(32.2)} 216.0 ${br(29.2)} 232.6 ${br(23.0)} 248.4 C ${br(20.4)} 252.4 ${br(14.6)} 251.4 ${br(12.6)} 245.8 C ${br(9.2)} 230.8 ${br(7.8)} 214.0 ${br(8.8)} 201.4 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${bl(21.6)} 264.8 C ${bl(24.4)} 275.6 ${bl(24.0)} 290.0 ${bl(19.8)} 302.6 C ${bl(17.8)} 306.4 ${bl(14.8)} 306.0 ${bl(13.4)} 301.4 C ${bl(9.6)} 289.2 ${bl(9.8)} 274.8 ${bl(13.0)} 264.8 C ${bl(15.8)} 263.2 ${bl(18.8)} 263.2 ${bl(21.6)} 264.8 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(21.6)} 264.8 C ${br(24.4)} 275.6 ${br(24.0)} 290.0 ${br(19.8)} 302.6 C ${br(17.8)} 306.4 ${br(14.8)} 306.0 ${br(13.4)} 301.4 C ${br(9.6)} 289.2 ${br(9.8)} 274.8 ${br(13.0)} 264.8 C ${br(15.8)} 263.2 ${br(18.8)} 263.2 ${br(21.6)} 264.8 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                </g>
              </>
            ) : (
              <>
                <g {...makeInteractiveProps('Shoulders', shouldersV)}>
                  <title>{shouldersV.title}</title>
                  <path d={`M ${bl(29.0)} 76.6 C ${bl(38.4)} 78.0 ${bl(44.6)} 85.4 ${bl(44.2)} 96.8 C ${bl(43.8)} 103.6 ${bl(41.2)} 109.6 ${bl(36.8)} 112.8 C ${bl(32.8)} 106.4 ${bl(29.4)} 96.0 ${bl(27.0)} 84.8 C ${bl(26.6)} 81.6 ${bl(27.4)} 78.2 ${bl(29.0)} 76.6 Z`} fill={shouldersV.fill} stroke={shouldersV.stroke} strokeWidth={shouldersV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(29.0)} 76.6 C ${br(38.4)} 78.0 ${br(44.6)} 85.4 ${br(44.2)} 96.8 C ${br(43.8)} 103.6 ${br(41.2)} 109.6 ${br(36.8)} 112.8 C ${br(32.8)} 106.4 ${br(29.4)} 96.0 ${br(27.0)} 84.8 C ${br(26.6)} 81.6 ${br(27.4)} 78.2 ${br(29.0)} 76.6 Z`} fill={shouldersV.fill} stroke={shouldersV.stroke} strokeWidth={shouldersV.strokeWidth} strokeLinejoin="round" />
                </g>

                <g {...makeInteractiveProps('Back', backV)}>
                  <title>{backV.title}</title>
                  <path d={`M ${BX} 67.6 C ${br(8.8)} 70.0 ${br(18.0)} 73.2 ${br(24.8)} 78.2 C ${br(26.8)} 80.2 ${br(26.6)} 84.0 ${br(24.6)} 89.0 C ${br(20.8)} 97.6 ${br(15.2)} 107.0 ${br(9.0)} 114.6 C ${br(5.2)} 119.2 ${br(2.4)} 121.6 ${BX} 122.4 C ${bl(2.4)} 121.6 ${bl(5.2)} 119.2 ${bl(9.0)} 114.6 C ${bl(15.2)} 107.0 ${bl(20.8)} 97.6 ${bl(24.6)} 89.0 C ${bl(26.6)} 84.0 ${bl(26.8)} 80.2 ${bl(24.8)} 78.2 C ${bl(18.0)} 73.2 ${bl(8.8)} 70.0 ${BX} 67.6 Z`} fill={backV.fillSecondary} stroke={backV.stroke} strokeWidth={backV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${bl(28.4)} 94.8 C ${bl(31.8)} 106.2 ${bl(30.4)} 122.6 ${bl(23.4)} 138.2 C ${bl(19.0)} 148.6 ${bl(11.6)} 154.2 ${bl(2.0)} 155.0 C ${bl(1.4)} 145.6 ${bl(1.4)} 135.2 ${bl(1.8)} 126.0 C ${bl(8.4)} 121.0 ${bl(14.8)} 113.8 ${bl(19.8)} 106.0 C ${bl(23.0)} 101.0 ${bl(25.8)} 97.2 ${bl(28.4)} 94.8 Z`} fill={backV.fill} stroke={backV.stroke} strokeWidth={backV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(28.4)} 94.8 C ${br(31.8)} 106.2 ${br(30.4)} 122.6 ${br(23.4)} 138.2 C ${br(19.0)} 148.6 ${br(11.6)} 154.2 ${br(2.0)} 155.0 C ${br(1.4)} 145.6 ${br(1.4)} 135.2 ${br(1.8)} 126.0 C ${br(8.4)} 121.0 ${br(14.8)} 113.8 ${br(19.8)} 106.0 C ${br(23.0)} 101.0 ${br(25.8)} 97.2 ${br(28.4)} 94.8 Z`} fill={backV.fill} stroke={backV.stroke} strokeWidth={backV.strokeWidth} strokeLinejoin="round" />
                </g>

                <g {...makeInteractiveProps('Triceps', tricepsV)}>
                  <title>{tricepsV.title}</title>
                  <path d={`M ${bl(38.0)} 109.2 C ${bl(43.4)} 113.2 ${bl(45.8)} 123.0 ${bl(44.6)} 133.6 C ${bl(43.6)} 138.4 ${bl(40.2)} 138.2 ${bl(38.4)} 133.2 C ${bl(37.6)} 130.0 ${bl(37.6)} 126.2 ${bl(37.0)} 124.2 C ${bl(36.2)} 126.2 ${bl(36.0)} 129.6 ${bl(35.4)} 132.4 C ${bl(33.2)} 125.8 ${bl(32.8)} 116.4 ${bl(34.4)} 110.0 Z`} fill={tricepsV.fill} stroke={tricepsV.stroke} strokeWidth={tricepsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(38.0)} 109.2 C ${br(43.4)} 113.2 ${br(45.8)} 123.0 ${br(44.6)} 133.6 C ${br(43.6)} 138.4 ${br(40.2)} 138.2 ${br(38.4)} 133.2 C ${br(37.6)} 130.0 ${br(37.6)} 126.2 ${br(37.0)} 124.2 C ${br(36.2)} 126.2 ${br(36.0)} 129.6 ${br(35.4)} 132.4 C ${br(33.2)} 125.8 ${br(32.8)} 116.4 ${br(34.4)} 110.0 Z`} fill={tricepsV.fill} stroke={tricepsV.stroke} strokeWidth={tricepsV.strokeWidth} strokeLinejoin="round" />
                </g>

                <g {...makeInteractiveProps('Legs', legsV)}>
                  <title>{legsV.title}</title>
                  <path d={`M ${bl(1.4)} 165.4 C ${bl(12.6)} 162.8 ${bl(24.6)} 168.0 ${bl(27.0)} 180.0 C ${bl(28.0)} 189.0 ${bl(19.2)} 195.2 ${bl(5.6)} 193.2 C ${bl(2.8)} 192.4 ${bl(1.4)} 189.6 ${bl(1.4)} 186.2 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(1.4)} 165.4 C ${br(12.6)} 162.8 ${br(24.6)} 168.0 ${br(27.0)} 180.0 C ${br(28.0)} 189.0 ${br(19.2)} 195.2 ${br(5.6)} 193.2 C ${br(2.8)} 192.4 ${br(1.4)} 189.6 ${br(1.4)} 186.2 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${bl(28.6)} 195.4 C ${bl(32.2)} 211.6 ${bl(30.6)} 230.6 ${bl(25.2)} 248.0 C ${bl(22.2)} 252.4 ${bl(15.6)} 251.4 ${bl(13.6)} 245.6 C ${bl(10.0)} 230.2 ${bl(8.8)} 212.0 ${bl(10.0)} 196.4 Z`} fill={legsV.fill} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(28.6)} 195.4 C ${br(32.2)} 211.6 ${br(30.6)} 230.6 ${br(25.2)} 248.0 C ${br(22.2)} 252.4 ${br(15.6)} 251.4 ${br(13.6)} 245.6 C ${br(10.0)} 230.2 ${br(8.8)} 212.0 ${br(10.0)} 196.4 Z`} fill={legsV.fill} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${bl(24.6)} 264.6 C ${bl(28.4)} 275.4 ${bl(28.0)} 290.0 ${bl(22.8)} 302.8 C ${bl(20.4)} 306.8 ${bl(16.6)} 306.2 ${bl(14.8)} 301.4 C ${bl(10.4)} 289.2 ${bl(10.6)} 274.8 ${bl(14.2)} 264.6 C ${bl(17.6)} 263.0 ${bl(21.2)} 263.0 ${bl(24.6)} 264.6 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                  <path d={`M ${br(24.6)} 264.6 C ${br(28.4)} 275.4 ${br(28.0)} 290.0 ${br(22.8)} 302.8 C ${br(20.4)} 306.8 ${br(16.6)} 306.2 ${br(14.8)} 301.4 C ${br(10.4)} 289.2 ${br(10.6)} 274.8 ${br(14.2)} 264.6 C ${br(17.6)} 263.0 ${br(21.2)} 263.0 ${br(24.6)} 264.6 Z`} fill={legsV.fillSecondary} stroke={legsV.stroke} strokeWidth={legsV.strokeWidth} strokeLinejoin="round" />
                </g>
              </>
            )}
          </g>

          {/* Clean Outer Human Silhouette Contour Overlay (Keeps Muscle Zones Integrated Inside) */}
          <path
            d={backBodyPath}
            fill="none"
            stroke={bodyStroke}
            strokeWidth="0.9"
            strokeLinejoin="round"
            pointerEvents="none"
          />
        </g>

        {/* Subtle Animated Horizontal Athletic Heat-Scan Sweep */}
        <g clipPath={`url(#hm-stage-clip-${uid})`} pointerEvents="none" aria-hidden="true">
          <g className="anim-biometric-scanline">
            <rect x="2" y="0" width="292" height="22" fill={`url(#hm-scan-trail-${uid})`} />
            <line
              x1="6"
              y1="22"
              x2="290"
              y2="22"
              stroke="#FF4500"
              strokeWidth="1"
              strokeOpacity="0.44"
            />
          </g>
        </g>
      </svg>

      {/* Crisp Floating Interactive Muscle Callout Pill (Zero Layout Jump) */}
      <div className="w-full flex items-center justify-center min-h-[36px] px-1">
        {inspectedInfo && inspectedMeta ? (
          <div
            role="status"
            aria-live="polite"
            className={`inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-3.5 py-1.5 rounded-full bg-[#141418]/95 backdrop-blur-md border text-xs tabular-nums transition-all duration-200 ${inspectedMeta.pillBorderClass}`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${inspectedMeta.dotClass}`} />
            <span className="font-bold text-[#F4F4F5]">
              {isFemale && inspectedInfo.muscle === 'Legs'
                ? 'ขา & ก้น (Glutes & Legs)'
                : `${inspectedInfo.labelTh} (${inspectedInfo.labelEn})`}
            </span>
            <span className="text-zinc-600" aria-hidden="true">
              ·
            </span>
            <span className={`font-bold ${inspectedMeta.textClass}`}>
              {inspectedInfo.statusLabelTh}
            </span>
            <span className="text-zinc-600" aria-hidden="true">
              ·
            </span>
            <span className="font-tech font-semibold text-zinc-200">
              {inspectedInfo.weeklySets}/10 เซ็ต
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141418]/90 border border-[#E4E4E7]/14 text-[11px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500]" />
            <span>ชี้หรือแตะมัดกล้ามเนื้อทั้ง 7 กลุ่มเพื่อดูสถานะและกรองท่าฝึก</span>
          </div>
        )}
      </div>
    </div>
  );
};
