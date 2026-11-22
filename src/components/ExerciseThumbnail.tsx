import React, { useId } from 'react';
import { Exercise } from '../types';

interface ExerciseThumbnailProps {
  exercise: Pick<Exercise, 'id' | 'name' | 'muscle' | 'motionType' | 'equipment' | 'isRecommended'>;
  sizeClass?: string;
}

/**
 * Exercise-Specific Sculpted 3D Anatomical Action Vignette (64x64px default).
 * Renders a tailored dynamic biomechanical silhouette + subtle equipment + glowing
 * Blaze Orange (#FF4500) primary muscle striations & cool cyan (#38BDF8) synergist accents
 * for every movement in the LIFTLAB Exercise Library.
 */
export const ExerciseThumbnail: React.FC<ExerciseThumbnailProps> = ({
  exercise,
  sizeClass = 'w-16 h-16',
}) => {
  const uid = useId().replace(/:/g, '');
  const bodyGrad = `et-body-${uid}`;
  const rearGrad = `et-rear-${uid}`;
  const muscleGrad = `et-musc-${uid}`;
  const cyanGrad = `et-cyan-${uid}`;
  const steelGrad = `et-steel-${uid}`;
  const padGrad = `et-pad-${uid}`;
  const auraGrad = `et-aura-${uid}`;
  const glowFilter = `et-glow-${uid}`;

  const rim = 'rgba(226, 232, 240, 0.34)';
  const fiber = 'rgba(255, 224, 198, 0.54)';
  const cableStroke = 'rgba(148, 163, 184, 0.55)';
  const arcStroke = 'rgba(255, 90, 31, 0.45)';
  const floorStroke = 'rgba(148, 163, 184, 0.22)';

  const renderScene = () => {
    switch (exercise.id) {
      // ================================================================
      // CHEST (6 Distinct Vignettes)
      // ================================================================
      case 'barbell-bench-press':
      case 'close-grip-bench-press': {
        const isTricepsFocus = exercise.id === 'close-grip-bench-press';
        return (
          <g>
            {/* Gym floor & Bench silhouette */}
            <line x1="6" y1="68" x2="74" y2="68" stroke={floorStroke} strokeWidth="1" />
            <rect x="16" y="54" width="44" height="5" rx="2" fill={`url(#${padGrad})`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
            <path d="M22 59V68M54 59V68" stroke={`url(#${steelGrad})`} strokeWidth="2.4" strokeLinecap="round" />

            {/* Rack upright hint */}
            <line x1="20" y1="16" x2="20" y2="68" stroke="rgba(148,163,184,0.22)" strokeWidth="2" />

            {/* Supine Athlete: Head, Torso, Legs */}
            <circle cx="19" cy="48.5" r="5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.6" />
            <path
              d="M25 46.5C32 43.5 42 44.5 50 48.5L56 53.5L65 55.5L67 67H62.5L60.5 59.5L49 56.5L26 53.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.65"
              strokeLinejoin="round"
            />
            {/* Rear pressing arm */}
            <path
              d={isTricepsFocus ? 'M32 45L36 34L35 23' : 'M31 45L33 33L33 21'}
              stroke={`url(#${rearGrad})`}
              strokeWidth="4.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Primary glowing muscle: Chest OR Triceps */}
            <g filter={`url(#${glowFilter})`}>
              {isTricepsFocus ? (
                <>
                  <path
                    d="M29 45.5C34 43 40 44 43 47.5C38 49 32 49 29 45.5Z"
                    fill={`url(#${cyanGrad})`}
                    opacity="0.82"
                  />
                  <path
                    d="M28 45L31 33L31 22"
                    stroke={`url(#${muscleGrad})`}
                    strokeWidth="5.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M28.5 41L30.2 34.5" stroke={fiber} strokeWidth="0.9" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <path
                    d="M26 46C31.5 42 40.5 43.2 44 48C39.5 51 31.5 51.2 26 46Z"
                    fill={`url(#${muscleGrad})`}
                  />
                  <path d="M29 46.5C34 45 38.5 45.8 41.5 47.5M30 48.5C34.5 48 38 48.4 40.5 49.4" stroke={fiber} strokeWidth="0.8" strokeLinecap="round" />
                </>
              )}
            </g>

            {/* Foreground pressing arm (when chest focus) */}
            {!isTricepsFocus && (
              <>
                <path
                  d="M28 46L30 33L30 21"
                  stroke={`url(#${bodyGrad})`}
                  strokeWidth="4.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="28.5" cy="45.5" r="3" fill={`url(#${cyanGrad})`} opacity="0.8" />
              </>
            )}

            {/* Olympic Barbell + Calibrated Plates */}
            <line x1="15" y1="20" x2="48" y2="20" stroke={`url(#${steelGrad})`} strokeWidth="2.2" strokeLinecap="round" />
            <ellipse cx="31.5" cy="20" rx="4.2" ry="9.5" fill="#181C26" stroke="#FF4500" strokeWidth="1.5" />
            <ellipse cx="31.5" cy="20" rx="1.6" ry="3.8" fill={`url(#${steelGrad})`} />
            <path d="M40 16L43 11M46 16L49 11" stroke={arcStroke} strokeWidth="1.1" strokeLinecap="round" />
          </g>
        );
      }

      case 'incline-dumbbell-press':
        return (
          <g>
            <line x1="6" y1="69" x2="74" y2="69" stroke={floorStroke} strokeWidth="1" />
            {/* 30-degree Inclined Bench */}
            <path d="M14 55L40 34L44 38L18 59Z" fill={`url(#${padGrad})`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
            <path d="M40 56H57V60H40Z" fill={`url(#${padGrad})`} />
            <path d="M22 57V69M52 60V69" stroke={`url(#${steelGrad})`} strokeWidth="2.3" strokeLinecap="round" />

            {/* Athlete on 30° Incline */}
            <circle cx="21" cy="37" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.6" />
            <path
              d="M24 41.5L43 51.5L56 53.5L62 67.5H57.5L52.5 58L40 56.5L21 46Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.65"
              strokeLinejoin="round"
            />
            {/* Rear arm + Dumbbell */}
            <path d="M31 41L41 31L39 20" stroke={`url(#${rearGrad})`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="33.5" y="15.5" width="11" height="4.8" rx="1.5" fill={`url(#${steelGrad})`} opacity="0.75" />

            {/* Upper-Chest Blaze Orange Highlight */}
            <g filter={`url(#${glowFilter})`}>
              <path
                d="M25.5 41C31 39.5 37.5 43.2 39.5 48C34.5 49.5 28.5 46.8 25.5 41Z"
                fill={`url(#${muscleGrad})`}
              />
              <path d="M28 42.5L36.5 46.2M27.5 44.5L35 47.6" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>

            {/* Foreground Pressing Arm + Hex Dumbbell */}
            <path d="M26 43L33 32L31 20" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="27" cy="42.5" r="2.8" fill={`url(#${cyanGrad})`} opacity="0.82" />
            <g transform="translate(24, 14) rotate(-8)">
              <rect x="0" y="1" width="3.5" height="7.5" rx="1.1" fill="#232836" stroke="#FF4500" strokeWidth="0.9" />
              <rect x="3.5" y="3.5" width="5.5" height="2.4" fill={`url(#${steelGrad})`} />
              <rect x="9" y="1" width="3.5" height="7.5" rx="1.1" fill="#232836" stroke="#FF4500" strokeWidth="0.9" />
            </g>
            <path d="M47 20L49 12" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      case 'cable-chest-fly':
        return (
          <g>
            {/* Dual Cable Tower Lines */}
            <line x1="4" y1="16" x2="17" y2="39" stroke={cableStroke} strokeWidth="1.1" strokeDasharray="2 1.5" />
            <line x1="76" y1="16" x2="63" y2="39" stroke={cableStroke} strokeWidth="1.1" strokeDasharray="2 1.5" />
            <circle cx="6" cy="17" r="2.2" fill={`url(#${steelGrad})`} />
            <circle cx="74" cy="17" r="2.2" fill={`url(#${steelGrad})`} />

            {/* Athletic Front-3/4 Torso in Crossover Tension */}
            <circle cx="40" cy="17" r="5.2" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M27 28C32 24.5 48 24.5 53 28L49 55L45 73H35L31 55Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Sweeping Curved Fly Arms */}
            <path
              d="M27 29C17 32 14 39 21 44L30 46"
              stroke={`url(#${bodyGrad})`}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M53 29C63 32 66 39 59 44L50 46"
              stroke={`url(#${bodyGrad})`}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Cyan Front Delts */}
            <circle cx="26.5" cy="29.5" r="3.4" fill={`url(#${cyanGrad})`} opacity="0.82" />
            <circle cx="53.5" cy="29.5" r="3.4" fill={`url(#${cyanGrad})`} opacity="0.82" />

            {/* Bilateral Glowing Pecs Squeezing Inward */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M28 31C32 28.5 37.5 29.2 39.2 31.5V41.5C34.5 43.2 29.8 41.2 28 37Z" fill={`url(#${muscleGrad})`} />
              <path d="M52 31C48 28.5 42.5 29.2 40.8 31.5V41.5C45.5 43.2 50.2 41.2 52 37Z" fill={`url(#${muscleGrad})`} />
              <path d="M30 34.5H38M30.5 38H37.8M50 34.5H42M49.5 38H42.2" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>

            {/* Inward Squeeze Tension Arrows */}
            <path d="M24 52C30 56 35 56 38 54M56 52C50 56 45 56 42 54" stroke="#FF4500" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          </g>
        );

      case 'chest-dip':
        return (
          <g>
            {/* Parallel Chrome Dip Bars */}
            <path d="M12 42H68M16 42V72M64 42V72" stroke={`url(#${steelGrad})`} strokeWidth="2.8" strokeLinecap="round" />
            <line x1="18" y1="47" x2="62" y2="47" stroke="rgba(148,163,184,0.35)" strokeWidth="2" />

            {/* Suspended Leaning Athlete */}
            <circle cx="46" cy="18" r="5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M42 23.5C36 25 32 32 30 42L37 56L33 69H38.5L44 55L47 41C48 33 47 26.5 42 23.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Bent Dipping Arm */}
            <path d="M39 27L28 33L34 42" stroke={`url(#${bodyGrad})`} strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M35 29L29 33" stroke={`url(#${cyanGrad})`} strokeWidth="3.6" strokeLinecap="round" opacity="0.85" />

            {/* Glowing Lower Chest */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M40 27.5C45.5 29 48.5 34.5 46.5 40.5C42 40.5 38 37 37.5 31.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M40 31.5L45.5 35.5M39.5 35L44.5 38.2" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            {/* Vertical Motion Cue */}
            <path d="M56 26V36M53.5 33.5L56 36.5L58.5 33.5" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'push-up':
        return (
          <g>
            {/* Gym Mat Floor */}
            <line x1="6" y1="62" x2="74" y2="62" stroke={floorStroke} strokeWidth="1.4" strokeLinecap="round" />

            {/* Low-Angle Horizontal Plank Athlete */}
            <circle cx="62" cy="36" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M57 38.5L34 44.5L12 58.5L15 61.5L36 50.5L56 46Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Rear Arm */}
            <path d="M54 41L50 51L55 61" stroke={`url(#${rearGrad})`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Glowing Chest & Cyan Core */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M46 41.5C51.5 39.5 57.5 40.5 58 45.2C54 48.2 48.5 47.8 45.5 44.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M48 43.2L55.5 43.8M48.5 45.5L54.5 45.8" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M35 47L45 45" stroke={`url(#${cyanGrad})`} strokeWidth="2.8" strokeLinecap="round" opacity="0.78" />

            {/* Foreground Bent Arm Planted on Floor */}
            <path d="M51 43L46 52L52 61.5" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M62 24V30M59.5 26.5L62 23.5L64.5 26.5" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'incline-push-up':
        return (
          <g>
            <line x1="6" y1="67" x2="74" y2="67" stroke={floorStroke} strokeWidth="1.2" />
            {/* Elevated Plyo Bench on Right */}
            <rect x="49" y="42" width="21" height="25" rx="3" fill={`url(#${padGrad})`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
            <line x1="49" y1="45" x2="70" y2="45" stroke={`url(#${steelGrad})`} strokeWidth="1.2" opacity="0.5" />

            {/* Inclined Body Alignment (~35 deg) */}
            <circle cx="59" cy="21" r="4.6" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M54 25L33 44L14 63.5L17.5 66.5L36.5 49.5L55 32.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Glowing Lower Chest */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M44 33C49 28.5 55 27.5 56 32C53 36.2 47.8 37.5 44 35Z" fill={`url(#${muscleGrad})`} />
              <path d="M46.5 33.2L53.2 31.2" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            {/* Arms Planted on Bench Edge */}
            <path d="M49 30L47 37L53 42.5" stroke={`url(#${bodyGrad})`} strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="49" cy="30" r="2.4" fill={`url(#${cyanGrad})`} opacity="0.8" />
          </g>
        );

      // ================================================================
      // BACK (6 Distinct Vignettes)
      // ================================================================
      case 'lat-pulldown':
        return (
          <g>
            {/* Overhead Pulley & Curved Lat Bar */}
            <line x1="40" y1="4" x2="40" y2="16" stroke={cableStroke} strokeWidth="1.4" />
            <path d="M13 21L24 16H56L67 21" stroke={`url(#${steelGrad})`} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            {/* Seat Pad */}
            <rect x="26" y="64" width="28" height="6" rx="2.5" fill={`url(#${padGrad})`} />

            {/* Posterior V-Taper Athlete Pulling Wide */}
            <circle cx="40" cy="25" r="5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M25 34C31 30 49 30 55 34L48 63H32Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Wide Pulling Arms */}
            <path d="M26 35L14 31L16 20" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M54 35L66 31L64 20" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="25.5" cy="34.5" r="3" fill={`url(#${cyanGrad})`} opacity="0.8" />
            <circle cx="54.5" cy="34.5" r="3" fill={`url(#${cyanGrad})`} opacity="0.8" />

            {/* Glowing V-Taper Lats */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M26.5 36.5C32 37.5 36.5 41.5 39 48V58C33.5 55.5 30 49.5 26.5 36.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M53.5 36.5C48 37.5 43.5 41.5 41 48V58C46.5 55.5 50 49.5 53.5 36.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M29.5 42L37.5 47M31.5 48L37.5 52M50.5 42L42.5 47M48.5 48L42.5 52" stroke={fiber} strokeWidth="0.8" strokeLinecap="round" />
            </g>
            <path d="M12 37V44M68 37V44" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      case 'barbell-bent-over-row':
        return (
          <g>
            <line x1="6" y1="69" x2="74" y2="69" stroke={floorStroke} strokeWidth="1.2" />
            {/* 45° Hinged Athletic Side-3/4 Torso & Legs */}
            <circle cx="57" cy="24" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M52 28L28 38.5L23 53L28 68H33.5L30.5 53.5L36 44.5L54 35.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Glowing Upper Back & Lats */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M33 36.5C40 32.2 48.5 29.8 53 31.8C50 37.2 42 40.5 34.5 41Z" fill={`url(#${muscleGrad})`} />
              <path d="M37 36.5L48.5 32.5M38.5 38.8L48 35.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            {/* Cyan Hamstring / Glute Stabilizer */}
            <path d="M26 42L24 52" stroke={`url(#${cyanGrad})`} strokeWidth="3.2" strokeLinecap="round" opacity="0.75" />

            {/* Pulling Arm + Loaded Barbell */}
            <path d="M47 33L42 43L47 52" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="36" y1="53" x2="64" y2="53" stroke={`url(#${steelGrad})`} strokeWidth="2.2" strokeLinecap="round" />
            <ellipse cx="49" cy="53" rx="4.5" ry="9.5" fill="#181C26" stroke="#FF4500" strokeWidth="1.5" />
            <ellipse cx="49" cy="53" rx="1.6" ry="3.6" fill={`url(#${steelGrad})`} />
            <path d="M61 48V40M58.8 42.5L61 39.5L63.2 42.5" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'seated-cable-row':
        return (
          <g>
            <line x1="6" y1="68" x2="74" y2="68" stroke={floorStroke} strokeWidth="1.2" />
            {/* Bench + Footplate + Horizontal Cable */}
            <rect x="26" y="54" width="32" height="6" rx="2" fill={`url(#${padGrad})`} />
            <line x1="8" y1="42" x2="36" y2="42" stroke={cableStroke} strokeWidth="1.4" />
            <circle cx="8" cy="42" r="2.5" fill={`url(#${steelGrad})`} />
            <line x1="12" y1="54" x2="18" y2="66" stroke={`url(#${steelGrad})`} strokeWidth="2.5" strokeLinecap="round" />

            {/* Seated Upright Athlete */}
            <circle cx="49" cy="22" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M46 27.5C43 32 42 42 43 52L27 50L16 58L19.5 61.5L29 55.5L47 56.5C51.5 56 54 45 53 31Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Glowing Mid/Upper Back */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M47.5 30C52 31.5 53.8 39 51.5 46.5C47 45 45.5 37.5 47.5 30Z" fill={`url(#${muscleGrad})`} />
              <path d="M48.5 34L51.2 42" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            {/* Rowing Arm Pulling Back */}
            <path d="M46 33L56 41L37 42" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="46" cy="33" r="2.6" fill={`url(#${cyanGrad})`} opacity="0.8" />
            <path d="M58 41H66M63.5 38.8L66.5 41L63.5 43.2" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'pull-up':
        return (
          <g>
            {/* High Overhead Pull-Up Bar */}
            <line x1="8" y1="13" x2="72" y2="13" stroke={`url(#${steelGrad})`} strokeWidth="3.2" strokeLinecap="round" />
            <line x1="12" y1="13" x2="12" y2="22" stroke="rgba(148,163,184,0.3)" strokeWidth="2" />
            <line x1="68" y1="13" x2="68" y2="22" stroke="rgba(148,163,184,0.3)" strokeWidth="2" />

            {/* Hanging Pulling Posterior Figure */}
            <circle cx="40" cy="20" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M27 29C32 25.5 48 25.5 53 29L46.5 54L44 71H36L33.5 54Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Arms Gripping Overhead Bar */}
            <path d="M27 30L17 24L22 13.5" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M53 30L63 24L58 13.5" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />

            {/* Cyan Biceps/Rear Delts */}
            <path d="M23 27L18 24M57 27L62 24" stroke={`url(#${cyanGrad})`} strokeWidth="3.2" strokeLinecap="round" opacity="0.8" />

            {/* Blazing Orange Lat Wings & Traps */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M28 31.5C33.5 32.5 37.5 37 39.2 43.5V52.5C34 50.5 30.8 44.5 28 31.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M52 31.5C46.5 32.5 42.5 37 40.8 43.5V52.5C46 50.5 49.2 44.5 52 31.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M31 36.5L38 41.5M49 36.5L42 41.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
          </g>
        );

      case 'back-extension':
        return (
          <g>
            <line x1="6" y1="69" x2="74" y2="69" stroke={floorStroke} strokeWidth="1.2" />
            {/* 45° Roman Chair Apparatus */}
            <line x1="16" y1="68" x2="48" y2="44" stroke={`url(#${steelGrad})`} strokeWidth="3" strokeLinecap="round" />
            <line x1="46" y1="45" x2="54" y2="68" stroke={`url(#${steelGrad})`} strokeWidth="2.6" strokeLinecap="round" />
            <rect x="38" y="39" width="12" height="6" rx="2.5" transform="rotate(-24 44 42)" fill={`url(#${padGrad})`} />

            {/* Athlete Extending Back Straight */}
            <circle cx="62" cy="23" r="4.6" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M57 26.5L36 40.5L19 60.5L23.5 64L40 46.5L59 33Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Arms Crossed on Chest */}
            <path d="M54 31L52 39L57 38" stroke={`url(#${bodyGrad})`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Glowing Lower Back Erectors + Cyan Glutes */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M39 38C45 33.5 51.5 31 54.5 33.5C52 37.5 46 41 40.5 41.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M42.5 38L51.5 33.5" stroke={fiber} strokeWidth="0.9" strokeLinecap="round" />
            </g>
            <path d="M33 43L39 40" stroke={`url(#${cyanGrad})`} strokeWidth="4" strokeLinecap="round" opacity="0.82" />
            <path d="M56 17C61 15 66 17 68 21" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      case 'inverted-bodyweight-row':
        return (
          <g>
            <line x1="6" y1="69" x2="74" y2="69" stroke={floorStroke} strokeWidth="1.2" />
            {/* Suspended Bar & Rack Post */}
            <line x1="48" y1="22" x2="48" y2="69" stroke="rgba(148,163,184,0.28)" strokeWidth="2.4" />
            <line x1="36" y1="26" x2="62" y2="26" stroke={`url(#${steelGrad})`} strokeWidth="3" strokeLinecap="round" />

            {/* Inverted Face-Up Suspended Plank */}
            <circle cx="62" cy="40" r="4.6" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M57 42.5L36 51.5L15 65L18.5 68L39.5 56.5L58.5 48.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Glowing Upper Back Underneath */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M42 50C47.5 47.5 54 45.2 57.5 46.8C55 51 48.5 53.5 42.5 53.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M45 51.2L54.5 47.8" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            {/* Pulling Arm up to Bar */}
            <path d="M51 45L45 36L49 26.5" stroke={`url(#${bodyGrad})`} strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="51" cy="44.5" r="2.6" fill={`url(#${cyanGrad})`} opacity="0.8" />
          </g>
        );

      // ================================================================
      // SHOULDERS (5 Distinct Vignettes)
      // ================================================================
      case 'overhead-press':
        return (
          <g>
            {/* Overhead Barbell + Plates */}
            <line x1="8" y1="14" x2="72" y2="14" stroke={`url(#${steelGrad})`} strokeWidth="2.5" strokeLinecap="round" />
            <rect x="11" y="8" width="4" height="12" rx="1.2" fill="#181C26" stroke="#FF4500" strokeWidth="1.2" />
            <rect x="65" y="8" width="4" height="12" rx="1.2" fill="#181C26" stroke="#FF4500" strokeWidth="1.2" />

            {/* Standing Athletic Torso Pressing Overhead */}
            <circle cx="40" cy="27" r="5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M27 36C33 32.5 47 32.5 53 36L48.5 64L46 74H34L31.5 64Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Vertical Pressing Arms */}
            <path d="M27 37L21 26L23 14.5" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M53 37L59 26L57 14.5" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />

            {/* Cyan Upper Traps / Triceps */}
            <path d="M32 33.5L40 31.5L48 33.5" stroke={`url(#${cyanGrad})`} strokeWidth="3" strokeLinecap="round" opacity="0.75" />

            {/* Blazing Orange Deltoid Caps */}
            <g filter={`url(#${glowFilter})`}>
              <ellipse cx="26" cy="36.5" rx="5.2" ry="6" transform="rotate(-14 26 36.5)" fill={`url(#${muscleGrad})`} />
              <ellipse cx="54" cy="36.5" rx="5.2" ry="6" transform="rotate(14 54 36.5)" fill={`url(#${muscleGrad})`} />
              <path d="M24 33.5L26 39.5M56 33.5L54 39.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
          </g>
        );

      case 'dumbbell-lateral-raise':
        return (
          <g>
            {/* Standing Athlete Raising Wing Arms */}
            <circle cx="40" cy="20" r="5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M29 30C34 27 46 27 51 30L47.5 60L45 73H35L32.5 60Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Lateral Extended Arms */}
            <path d="M28 32L13 35" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" />
            <path d="M52 32L67 35" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" />
            {/* Dumbbells at Ends */}
            <rect x="8.5" y="31.5" width="4.8" height="8.5" rx="1.4" fill="#1C212C" stroke={`url(#${steelGrad})`} strokeWidth="1.1" />
            <rect x="66.7" y="31.5" width="4.8" height="8.5" rx="1.4" fill="#1C212C" stroke={`url(#${steelGrad})`} strokeWidth="1.1" />

            {/* Curved Upward Motion Arcs */}
            <path d="M13 50C10 45 10 41 12 38M67 50C70 45 70 41 68 38" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />

            {/* Cyan Upper Traps */}
            <path d="M33 28L40 26L47 28" stroke={`url(#${cyanGrad})`} strokeWidth="2.8" strokeLinecap="round" opacity="0.75" />

            {/* Glowing Blaze Orange Lateral Delts */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M29 29C24 29 21 32 21.5 36.5C25 38 29 36.5 30 33Z" fill={`url(#${muscleGrad})`} />
              <path d="M51 29C56 29 59 32 58.5 36.5C55 38 51 36.5 50 33Z" fill={`url(#${muscleGrad})`} />
              <path d="M24 32.5L27.5 34.5M56 32.5L52.5 34.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
          </g>
        );

      case 'face-pull':
        return (
          <g>
            {/* High Cable Rope on Left */}
            <circle cx="7" cy="24" r="2.4" fill={`url(#${steelGrad})`} />
            <line x1="9" y1="24" x2="34" y2="25" stroke={cableStroke} strokeWidth="1.5" />
            <path d="M34 25L41 21M34 25L41 29" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />

            {/* Standing Athlete Pulling High to Forehead */}
            <circle cx="51" cy="23" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M47 28.5C43 32 42 44 44 57L46 72H56L57 54C58 43 57 32.5 53 28.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* High Flared Pulling Arm */}
            <path d="M51 32L62 29L43 24" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />

            {/* Glowing Rear Delt & Upper Back */}
            <g filter={`url(#${glowFilter})`}>
              <ellipse cx="52.5" cy="33" rx="5.2" ry="4.8" fill={`url(#${muscleGrad})`} />
              <path d="M49.5 32.5H55.5M50 35H55" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M47 38L52 44" stroke={`url(#${cyanGrad})`} strokeWidth="3" strokeLinecap="round" opacity="0.78" />
          </g>
        );

      case 'rear-delt-dumbbell-fly':
        return (
          <g>
            <line x1="6" y1="69" x2="74" y2="69" stroke={floorStroke} strokeWidth="1.2" />
            {/* Bent-Over Horizontal Hinge Posture */}
            <circle cx="59" cy="30" r="4.6" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M54 32.5L29 36.5L23 52L27 68H32.5L30.5 53L36 43.5L55 39.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Wing Arm Sweeping Upward-Out */}
            <path d="M49 34L44 21L38 17" stroke={`url(#${rearGrad})`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M49 36L56 46L64 49" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="62" y="45.5" width="5" height="8" rx="1.4" transform="rotate(-18 64.5 49.5)" fill="#1C212C" stroke={`url(#${steelGrad})`} strokeWidth="1.1" />

            {/* Glowing Posterior Deltoid */}
            <g filter={`url(#${glowFilter})`}>
              <ellipse cx="48.5" cy="35.5" rx="5.4" ry="4.4" transform="rotate(-10 48.5 35.5)" fill={`url(#${muscleGrad})`} />
              <path d="M45.5 35L51.5 34.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M36 37L43 36.5" stroke={`url(#${cyanGrad})`} strokeWidth="3.2" strokeLinecap="round" opacity="0.78" />
            <path d="M64 38C68 41 69 44 68 47" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      case 'pike-push-up':
        return (
          <g>
            <line x1="6" y1="66" x2="74" y2="66" stroke={floorStroke} strokeWidth="1.3" />
            {/* Inverted V-Pike Silhouette */}
            <circle cx="57" cy="49" r="4.5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M53 45L38 22L18 63.5L23 65.5L39.5 32.5L51 49.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Arms Planted on Floor */}
            <path d="M51 44L59 53L56 65" stroke={`url(#${bodyGrad})`} strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />

            {/* Blazing Orange Front Deltoids */}
            <g filter={`url(#${glowFilter})`}>
              <circle cx="51" cy="44" r="5" fill={`url(#${muscleGrad})`} />
              <path d="M48.5 42.5L53 45.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M55 49L58 53" stroke={`url(#${cyanGrad})`} strokeWidth="3" strokeLinecap="round" opacity="0.78" />
          </g>
        );

      // ================================================================
      // LEGS (12 Distinct Vignettes)
      // ================================================================
      case 'barbell-back-squat':
      case 'bodyweight-squat': {
        const hasBarbell = exercise.id === 'barbell-back-squat';
        return (
          <g>
            <line x1="6" y1="69" x2="74" y2="69" stroke={floorStroke} strokeWidth="1.2" />
            {/* Deep Athletic Squat Side-3/4 */}
            <circle cx="48" cy="18" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            {/* Torso */}
            <path
              d="M44 23.5L28 41.5L36 48L51 29.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Thigh & Shin in Parallel Squat */}
            <path
              d="M27.5 43.5C35 41 47 42 54.5 45.5L47.5 68H41.5L46.5 51L29 50.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />

            {/* Cyan Glutes */}
            <circle cx="29.5" cy="45.5" r="4.4" fill={`url(#${cyanGrad})`} opacity="0.82" />

            {/* Blazing Orange Quadriceps Sweep */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M34.5 43C41.5 41.8 49.5 43 53.5 46.2C50.5 49.5 42 49.8 34.5 47.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M37 45.2H49.5M38.5 47.4H48.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>

            {hasBarbell ? (
              <>
                <path d="M44 27L37 31L39 24" stroke={`url(#${bodyGrad})`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
                <ellipse cx="41" cy="23.5" rx="4.6" ry="9.5" fill="#181C26" stroke="#FF4500" strokeWidth="1.5" />
                <ellipse cx="41" cy="23.5" rx="1.6" ry="3.5" fill={`url(#${steelGrad})`} />
              </>
            ) : (
              /* Counterbalance Forward Arms for Bodyweight Squat */
              <path d="M46 27L62 32" stroke={`url(#${bodyGrad})`} strokeWidth="4.4" strokeLinecap="round" />
            )}
          </g>
        );
      }

      case 'romanian-deadlift':
        return (
          <g>
            <line x1="6" y1="69" x2="74" y2="69" stroke={floorStroke} strokeWidth="1.2" />
            {/* Crisp Athletic Hip-Hinge RDL */}
            <circle cx="59" cy="24" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M54 27.5L26 35.5L28 43.5L55 34.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Almost-Straight Hinged Legs */}
            <path
              d="M25.5 36.5L32 54L30 68H36.5L39 53L34 39.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Arms Hanging Vertical with Barbell Close to Shins */}
            <path d="M48 33L46 53" stroke={`url(#${bodyGrad})`} strokeWidth="4.5" strokeLinecap="round" />
            <ellipse cx="46" cy="55.5" rx="4.6" ry="9.5" fill="#181C26" stroke="#FF4500" strokeWidth="1.5" />
            <ellipse cx="46" cy="55.5" rx="1.6" ry="3.6" fill={`url(#${steelGrad})`} />

            {/* Blazing Orange Hamstrings + Cyan Glutes */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M26 39C29.5 44 31 50.5 31.5 56.5C34.5 54.5 34.8 46.5 31 39.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M28.8 43.5L31.5 53" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <circle cx="27.5" cy="37.5" r="4.2" fill={`url(#${cyanGrad})`} opacity="0.84" />
          </g>
        );

      case 'leg-press':
        return (
          <g>
            {/* 45° Angled Leg Press Sled & Rail */}
            <line x1="12" y1="66" x2="66" y2="18" stroke="rgba(148,163,184,0.28)" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M10 42L24 58L20 62L6 46Z" fill={`url(#${padGrad})`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
            {/* Angled Metallic Footplate + Plates */}
            <path d="M51 12L67 30L62 34L46 16Z" fill={`url(#${padGrad})`} stroke={`url(#${steelGrad})`} strokeWidth="1.2" />
            <circle cx="62" cy="18" r="6" fill="#181C26" stroke="#FF4500" strokeWidth="1.4" />

            {/* Reclined Athlete Pressing Upward at 45° */}
            <circle cx="17" cy="40" r="4.5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path d="M20 44L32 56L26 60L16 48Z" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M31 55L41 37L55 24"
              stroke={`url(#${bodyGrad})`}
              strokeWidth="6.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Glowing Quads */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M30.5 52C33.5 44 37.5 38.5 42 36C44.5 39.5 40.5 48 34.5 54Z" fill={`url(#${muscleGrad})`} />
              <path d="M33.5 50L40 39.5" stroke={fiber} strokeWidth="0.9" strokeLinecap="round" />
            </g>
            <circle cx="30" cy="56" r="3.6" fill={`url(#${cyanGrad})`} opacity="0.8" />
          </g>
        );

      case 'lying-leg-curl':
        return (
          <g>
            <line x1="6" y1="68" x2="74" y2="68" stroke={floorStroke} strokeWidth="1.2" />
            {/* Prone Curl Machine Bench */}
            <path d="M12 49H56V55H12Z" fill={`url(#${padGrad})`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
            <path d="M18 55V68M50 55V68" stroke={`url(#${steelGrad})`} strokeWidth="2.4" strokeLinecap="round" />

            {/* Prone Athlete Curling Legs Up */}
            <circle cx="15" cy="43.5" r="4.5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M20 44L52 44.5L56 48.5H20Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.65"
              strokeLinejoin="round"
            />
            {/* Curled Lower Leg & Ankle Roller Pad */}
            <path d="M54 46L63 28" stroke={`url(#${bodyGrad})`} strokeWidth="5.2" strokeLinecap="round" />
            <circle cx="63.5" cy="29" r="3.8" fill={`url(#${padGrad})`} stroke="#FF4500" strokeWidth="1.2" />
            <path d="M58 24C63 22 67 24 69 29" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />

            {/* Glowing Hamstrings Along Back of Thigh */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M37 42.5C43.5 41.2 50 41.8 54 44.5C50 47.2 43 47.2 37 45.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M40 44H51" stroke={fiber} strokeWidth="0.9" strokeLinecap="round" />
            </g>
            <ellipse cx="35" cy="44" rx="3.8" ry="2.8" fill={`url(#${cyanGrad})`} opacity="0.78" />
          </g>
        );

      case 'barbell-hip-thrust':
      case 'glute-bridge': {
        const isBench = exercise.id === 'barbell-hip-thrust';
        return (
          <g>
            <line x1="6" y1="66" x2="74" y2="66" stroke={floorStroke} strokeWidth="1.3" />
            {isBench && (
              <rect x="8" y="42" width="16" height="24" rx="2.5" fill={`url(#${padGrad})`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
            )}

            {/* Horizontal Bridge / Thrust Posture */}
            <circle cx={isBench ? 16 : 14} cy={isBench ? 34 : 58} r="4.5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d={
                isBench
                  ? 'M20 37.5L46 39L60 40.5L63 65H57.5L55 46.5L42 46.5L21 43.5Z'
                  : 'M19 60.5L44 43L59 44.5L63 65H57.5L54.5 50L44 50.5L22 64.5Z'
              }
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />

            {/* Blazing Orange Glutes + Cyan Hamstrings */}
            <g filter={`url(#${glowFilter})`}>
              <ellipse
                cx="42"
                cy={isBench ? 43.5 : 46.5}
                rx="6.2"
                ry="4.8"
                fill={`url(#${muscleGrad})`}
              />
              <path
                d={isBench ? 'M38.5 43.5H45.5' : 'M38.5 46.5H45.5'}
                stroke={fiber}
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            </g>
            <path
              d={isBench ? 'M48 45L55 45' : 'M48 48L55 48'}
              stroke={`url(#${cyanGrad})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.8"
            />

            {isBench && (
              <>
                <ellipse cx="42" cy="36.5" rx="4.2" ry="8.5" fill="#181C26" stroke="#FF4500" strokeWidth="1.4" />
                <ellipse cx="42" cy="36.5" rx="1.5" ry="3.2" fill={`url(#${steelGrad})`} />
              </>
            )}
            <path d="M42 22V29M39.5 24.5L42 21.5L44.5 24.5" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      }

      case 'bulgarian-split-squat':
      case 'reverse-lunge': {
        const isBulgarian = exercise.id === 'bulgarian-split-squat';
        return (
          <g>
            <line x1="6" y1="69" x2="74" y2="69" stroke={floorStroke} strokeWidth="1.2" />
            {isBulgarian && (
              <rect x="8" y="48" width="15" height="21" rx="2.5" fill={`url(#${padGrad})`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
            )}

            {/* Split-Stance Athlete */}
            <circle cx="43" cy="17" r="4.6" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path d="M39 22.5L36 42L44 43L46.5 23.5Z" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            {/* Rear Leg */}
            <path
              d={isBulgarian ? 'M38 43L28 56L17 48' : 'M38 43L31 61L18 65'}
              stroke={`url(#${rearGrad})`}
              strokeWidth="5.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Front Working Leg (90/90) */}
            <path
              d="M41 42L58 45L58 67"
              stroke={`url(#${bodyGrad})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Glowing Front Quad & Glute */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M41 40.5C47.5 40 54.5 41.5 58 44.5C55 48 47.5 48.2 41 45.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M44 43.2H54.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <circle cx="38" cy="43" r="4" fill={`url(#${cyanGrad})`} opacity="0.84" />

            {isBulgarian && (
              <>
                <path d="M43 27L45 45" stroke={`url(#${bodyGrad})`} strokeWidth="4" strokeLinecap="round" />
                <rect x="40" y="45" width="9.5" height="4.2" rx="1.4" fill="#1C212C" stroke={`url(#${steelGrad})`} strokeWidth="1" />
              </>
            )}
          </g>
        );
      }

      case 'cable-glute-kickback':
        return (
          <g>
            <line x1="6" y1="69" x2="74" y2="69" stroke={floorStroke} strokeWidth="1.2" />
            {/* Cable Upright on Left + Low Pulley Cable */}
            <line x1="12" y1="12" x2="12" y2="69" stroke={`url(#${steelGrad})`} strokeWidth="2.4" />
            <circle cx="14" cy="61" r="2.2" fill={`url(#${steelGrad})`} />
            <line x1="15" y1="61" x2="64" y2="43" stroke={cableStroke} strokeWidth="1.3" />

            {/* Forward-Leaning Athlete Kicking Back */}
            <circle cx="29" cy="21" r="4.5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path d="M27 26L41 39L37 44L23 31Z" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            {/* Arm Holding Upright */}
            <path d="M26 29L13 33" stroke={`url(#${bodyGrad})`} strokeWidth="4" strokeLinecap="round" />
            {/* Standing Leg */}
            <path d="M38 43L35 67.5" stroke={`url(#${rearGrad})`} strokeWidth="5.4" strokeLinecap="round" />
            {/* Kicking Leg Extending Back & Up */}
            <path d="M40 41L65 43" stroke={`url(#${bodyGrad})`} strokeWidth="5.4" strokeLinecap="round" />

            {/* Blazing Orange Glute + Cyan Hamstring */}
            <g filter={`url(#${glowFilter})`}>
              <ellipse cx="42" cy="40.5" rx="5.5" ry="4.8" fill={`url(#${muscleGrad})`} />
              <path d="M39.5 40.5H45" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M48 41.5L56 42.2" stroke={`url(#${cyanGrad})`} strokeWidth="3.2" strokeLinecap="round" opacity="0.8" />
            <path d="M62 34C66 35 68 38 69 41" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      case 'seated-hip-abduction':
        return (
          <g>
            {/* Front-3/4 Seated Hip Abduction Silhouette */}
            <rect x="24" y="45" width="32" height="7" rx="3" fill={`url(#${padGrad})`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
            <circle cx="40" cy="17" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path d="M31 26H49L46 46H34Z" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" strokeLinejoin="round" />

            {/* Spread Knees Pushing Against Outer Pads */}
            <path d="M34 45L19 52L21 68" stroke={`url(#${bodyGrad})`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M46 45L61 52L59 68" stroke={`url(#${bodyGrad})`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Outer Machine Knee Pads */}
            <rect x="11.5" y="46" width="5" height="12" rx="2" fill={`url(#${padGrad})`} stroke="#FF4500" strokeWidth="1.1" />
            <rect x="63.5" y="46" width="5" height="12" rx="2" fill={`url(#${padGrad})`} stroke="#FF4500" strokeWidth="1.1" />

            {/* Glowing Outer Glutes & Outer Thighs */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M32 43C26 44 21 47.5 19.5 52C23.5 53 29 50.5 33 47Z" fill={`url(#${muscleGrad})`} />
              <path d="M48 43C54 44 59 47.5 60.5 52C56.5 53 51 50.5 47 47Z" fill={`url(#${muscleGrad})`} />
            </g>
            {/* Outward Push Arrows */}
            <path d="M10 38H5M7 35.8L4.5 38L7 40.2M70 38H75M73 35.8L75.5 38L73 40.2" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'standing-calf-raise':
        return (
          <g>
            {/* Elevated Steel Calf Block */}
            <rect x="34" y="61" width="28" height="9" rx="2" fill={`url(#${padGrad})`} stroke={`url(#${steelGrad})`} strokeWidth="1.1" />
            {/* Close-up Sculpted Lower Leg Rising on Forefoot */}
            <path
              d="M32 10H48L46 34C48 42 46 50 43 57L52 60.5H39L32 54C33 44 30 34 32 10Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Blazing Orange Sculpted Gastrocnemius Calf */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M31.5 23C27 29 27.5 39 33 45.5C37.5 43.5 39 34 37.5 24Z" fill={`url(#${muscleGrad})`} />
              <path d="M31.5 28C30.8 33 31.8 38 33.8 42" stroke={fiber} strokeWidth="0.9" strokeLinecap="round" />
            </g>
            {/* Cyan Achilles Tendon Line */}
            <path d="M35.5 46L36 56" stroke={`url(#${cyanGrad})`} strokeWidth="2.4" strokeLinecap="round" opacity="0.82" />
            <path d="M20 42V30M17.5 32.5L20 29.5L22.5 32.5" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      // ================================================================
      // BICEPS (4 Distinct Vignettes)
      // ================================================================
      case 'barbell-bicep-curl':
        return (
          <g>
            {/* Standing Curl Athlete + Barbell */}
            <circle cx="40" cy="17" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path d="M29 26.5C34 24 46 24 51 26.5L47.5 58L45 73H35L32.5 58Z" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.7" />
            {/* Flexed Curling Arms */}
            <path d="M28 28L23 44L30 40" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M52 28L57 44L50 40" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />

            {/* Blazing Orange Bicep Peaks */}
            <g filter={`url(#${glowFilter})`}>
              <ellipse cx="25.5" cy="36.5" rx="3.8" ry="5.5" transform="rotate(14 25.5 36.5)" fill={`url(#${muscleGrad})`} />
              <ellipse cx="54.5" cy="36.5" rx="3.8" ry="5.5" transform="rotate(-14 54.5 36.5)" fill={`url(#${muscleGrad})`} />
              <path d="M25 34L26 39M55 34L54 39" stroke={fiber} strokeWidth="0.8" strokeLinecap="round" />
            </g>
            <path d="M26 42L30 40M54 42L50 40" stroke={`url(#${cyanGrad})`} strokeWidth="2.4" strokeLinecap="round" opacity="0.82" />

            {/* Straight Barbell Across Mid-Frame */}
            <line x1="12" y1="40" x2="68" y2="40" stroke={`url(#${steelGrad})`} strokeWidth="2.4" strokeLinecap="round" />
            <rect x="13" y="34" width="3.8" height="12" rx="1.2" fill="#181C26" stroke="#FF4500" strokeWidth="1.1" />
            <rect x="63.2" y="34" width="3.8" height="12" rx="1.2" fill="#181C26" stroke="#FF4500" strokeWidth="1.1" />
          </g>
        );

      case 'hammer-curl':
        return (
          <g>
            {/* 3/4 Standing Hammer Curl with Vertical Neutral Dumbbell */}
            <circle cx="38" cy="17" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path d="M30 26L46 27L45 58L43 73H33L31 58Z" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.7" />
            {/* Side-3/4 Flexed Arm */}
            <path d="M36 30L35 47L53 41" stroke={`url(#${bodyGrad})`} strokeWidth="5.6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Vertical Hammer Dumbbell */}
            <rect x="50.5" y="32" width="6" height="4.5" rx="1.3" fill="#181C26" stroke="#FF4500" strokeWidth="1.1" />
            <rect x="52.4" y="36.5" width="2.2" height="7" fill={`url(#${steelGrad})`} />
            <rect x="50.5" y="43.5" width="6" height="4.5" rx="1.3" fill="#181C26" stroke="#FF4500" strokeWidth="1.1" />

            {/* Glowing Outer Bicep + Cyan Brachioradialis Forearm */}
            <g filter={`url(#${glowFilter})`}>
              <ellipse cx="36.5" cy="39" rx="4.2" ry="6.2" fill={`url(#${muscleGrad})`} />
              <path d="M36.5 35.5V42.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M40 45.5L50 42" stroke={`url(#${cyanGrad})`} strokeWidth="3.4" strokeLinecap="round" opacity="0.86" />
            <path d="M61 52C64 46 64 41 61 36" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      case 'incline-dumbbell-curl':
        return (
          <g>
            <line x1="6" y1="69" x2="74" y2="69" stroke={floorStroke} strokeWidth="1.2" />
            {/* 45° Incline Bench */}
            <path d="M18 54L40 28L44 31L22 57Z" fill={`url(#${padGrad})`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
            <rect x="38" y="54" width="18" height="5" rx="2" fill={`url(#${padGrad})`} />
            <path d="M24 56V69M52 59V69" stroke={`url(#${steelGrad})`} strokeWidth="2.2" strokeLinecap="round" />

            {/* Reclined Athlete with Arm Stretched Back */}
            <circle cx="29" cy="24" r="4.6" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path d="M31 29.5L44 50L57 52L62 67H57.5L53 57L41 55.5L26 35Z" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            {/* Hanging Back-Stretched Curling Arm */}
            <path d="M33 34L27 50L39 54" stroke={`url(#${bodyGrad})`} strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="37" y="51" width="8.5" height="4.4" rx="1.4" fill="#181C26" stroke={`url(#${steelGrad})`} strokeWidth="1.1" />

            {/* Blazing Orange Stretched Long-Head Biceps */}
            <g filter={`url(#${glowFilter})`}>
              <ellipse cx="30" cy="42.5" rx="3.8" ry="6.4" transform="rotate(18 30 42.5)" fill={`url(#${muscleGrad})`} />
              <path d="M31 39L29 45.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M32 51L37 53" stroke={`url(#${cyanGrad})`} strokeWidth="2.8" strokeLinecap="round" opacity="0.8" />
          </g>
        );

      case 'preacher-curl':
        return (
          <g>
            <line x1="6" y1="69" x2="74" y2="69" stroke={floorStroke} strokeWidth="1.2" />
            {/* Angled Preacher Pad & Seat */}
            <path d="M38 35L53 50L49 54L34 39Z" fill={`url(#${padGrad})`} stroke="rgba(255,255,255,0.14)" strokeWidth="0.8" />
            <line x1="42" y1="45" x2="42" y2="69" stroke={`url(#${steelGrad})`} strokeWidth="2.6" />
            <rect x="16" y="55" width="16" height="5" rx="2" fill={`url(#${padGrad})`} />

            {/* Seated Athlete Braced Over Pad */}
            <circle cx="31" cy="22" r="4.6" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path d="M27 28L23 53H33L36 33Z" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            {/* Braced Upper Arm Curling Up */}
            <path d="M34 32L46 43L55 29" stroke={`url(#${bodyGrad})`} strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="56" cy="27.5" r="4.4" fill="#181C26" stroke="#FF4500" strokeWidth="1.4" />
            <circle cx="56" cy="27.5" r="1.6" fill={`url(#${steelGrad})`} />

            {/* Blazing Orange Short-Head Bicep Peak */}
            <g filter={`url(#${glowFilter})`}>
              <ellipse cx="42" cy="36.5" rx="5.5" ry="3.8" transform="rotate(38 42 36.5)" fill={`url(#${muscleGrad})`} />
              <path d="M39.5 34.5L44.5 38.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M49 38L54 31" stroke={`url(#${cyanGrad})`} strokeWidth="2.8" strokeLinecap="round" opacity="0.8" />
          </g>
        );

      // ================================================================
      // TRICEPS (3 Remaining Distinct Vignettes; close-grip handled above)
      // ================================================================
      case 'tricep-rope-pushdown':
        return (
          <g>
            {/* High Cable Pulley & Split Braided Rope */}
            <line x1="56" y1="6" x2="56" y2="42" stroke={cableStroke} strokeWidth="1.4" />
            <circle cx="56" cy="8" r="2.4" fill={`url(#${steelGrad})`} />
            <path d="M56 42L51 54M56 42L62 54" stroke="#E2E8F0" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="51" cy="55" r="2" fill="#FF4500" />
            <circle cx="62" cy="55" r="2" fill="#FF4500" />

            {/* Standing Athlete Pressing Rope Down */}
            <circle cx="33" cy="18" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path d="M27 25L39 26L38 58L36 73H26L25 58Z" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.7" />
            {/* Locked Elbow Extending Forearm Down */}
            <path d="M34 30L37 44L53 52" stroke={`url(#${bodyGrad})`} strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Glowing Lateral Triceps Horseshoe */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M30.5 31.5C28.5 36.5 30 42 34.5 44.5C37 41 37 35 34.5 31Z" fill={`url(#${muscleGrad})`} />
              <path d="M32 34.5L34 41.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M40 46L48 50" stroke={`url(#${cyanGrad})`} strokeWidth="2.8" strokeLinecap="round" opacity="0.8" />
            <path d="M67 45V56M64.8 53.5L67 56.5L69.2 53.5" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'overhead-dumbbell-extension':
        return (
          <g>
            {/* Standing Athlete Holding Dumbbell Behind Head */}
            <circle cx="42" cy="30" r="4.8" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path d="M34 37H50L48 66L46 74H36L34 66Z" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.7" />
            {/* Vertical Upper Arm Pointed Straight Up + Bent Forearm Back */}
            <path d="M38 40L36 20L27 25" stroke={`url(#${bodyGrad})`} strokeWidth="5.4" strokeLinecap="round" strokeLinejoin="round" />
            {/* Overhead Dumbbell */}
            <rect x="20" y="19" width="7" height="11" rx="2" transform="rotate(-14 23.5 24.5)" fill="#181C26" stroke="#FF4500" strokeWidth="1.2" />

            {/* Blazing Orange Long-Head Triceps Stretch */}
            <g filter={`url(#${glowFilter})`}>
              <ellipse cx="34.5" cy="30.5" rx="3.8" ry="7.4" transform="rotate(6 34.5 30.5)" fill={`url(#${muscleGrad})`} />
              <path d="M34.2 26V35" stroke={fiber} strokeWidth="0.9" strokeLinecap="round" />
            </g>
            <circle cx="38.5" cy="39" r="3" fill={`url(#${cyanGrad})`} opacity="0.78" />
            <path d="M30 12C35 10 40 11 43 15" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      case 'skull-crusher':
        return (
          <g>
            <line x1="6" y1="68" x2="74" y2="68" stroke={floorStroke} strokeWidth="1.2" />
            {/* Flat Bench */}
            <rect x="14" y="54" width="46" height="5" rx="2" fill={`url(#${padGrad})`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
            <path d="M20 59V68M54 59V68" stroke={`url(#${steelGrad})`} strokeWidth="2.3" strokeLinecap="round" />

            {/* Supine Athlete Hinging Bar Over Forehead */}
            <circle cx="20" cy="48.5" r="4.6" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path d="M25 46.5L51 48.5L63 54L65 67H60.5L58.5 58.5L26 53.5Z" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            {/* Angled Upper Arm Locked + Hinged Forearm to Forehead */}
            <path d="M30 46L26 30L16 33" stroke={`url(#${bodyGrad})`} strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="15" cy="33" rx="3.6" ry="7.5" fill="#181C26" stroke="#FF4500" strokeWidth="1.4" />
            <ellipse cx="15" cy="33" rx="1.4" ry="2.8" fill={`url(#${steelGrad})`} />

            {/* Blazing Orange Triceps Back-of-Arm */}
            <g filter={`url(#${glowFilter})`}>
              <ellipse cx="26.2" cy="38.5" rx="3.6" ry="6.5" transform="rotate(14 26.2 38.5)" fill={`url(#${muscleGrad})`} />
              <path d="M26.8 34.5L25.5 42" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M21 22C27 20 33 21 37 25" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      // ================================================================
      // ABS / CORE (6 Distinct Vignettes)
      // ================================================================
      case 'cable-crunch':
        return (
          <g>
            <line x1="6" y1="68" x2="74" y2="68" stroke={floorStroke} strokeWidth="1.2" />
            {/* Overhead Cable Pulley Rope */}
            <line x1="20" y1="6" x2="29" y2="33" stroke={cableStroke} strokeWidth="1.4" />
            <circle cx="20" cy="8" r="2.4" fill={`url(#${steelGrad})`} />

            {/* Kneeling Athlete Curling Spine Into C-Curve */}
            <circle cx="28" cy="37" r="4.6" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M32 34C40 31 50 35 53 46L50 65H66V68H44L45 49C42 44 37 42 32 42Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            <path d="M36 35L28 31" stroke={`url(#${bodyGrad})`} strokeWidth="4.4" strokeLinecap="round" />

            {/* Blazing Orange Upper Abs Crunch */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M35 40.5C39.5 41 44.5 44.5 45.5 50.5C41 51.5 35.5 48.5 34 43.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M36.5 44L43 46.5M37.5 47.5L43 49" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M20 45C22 50 26 53 31 54" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      case 'hanging-leg-raise':
        return (
          <g>
            {/* High Pull-Up Bar */}
            <line x1="12" y1="11" x2="68" y2="11" stroke={`url(#${steelGrad})`} strokeWidth="3" strokeLinecap="round" />

            {/* Hanging Athlete Raising Straight Legs Past 90° */}
            <path d="M33 25L33 12" stroke={`url(#${bodyGrad})`} strokeWidth="4.8" strokeLinecap="round" />
            <circle cx="38" cy="24" r="4.5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M31 29.5H40L41 51L65 44L66.5 49L40 58C33.5 57.5 30 53 31 44Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Blazing Orange Lower Abs + Cyan Hip Flexors */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M34 39C38.5 39 41.5 44.5 41 51.5C36.5 52 33.5 47.5 34 39Z" fill={`url(#${muscleGrad})`} />
              <path d="M36 42.5H40M36 46.5H40" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M43 51L51 49" stroke={`url(#${cyanGrad})`} strokeWidth="3.2" strokeLinecap="round" opacity="0.82" />
            <path d="M62 59C66 56 68 52 68 48" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      case 'ab-wheel-rollout':
        return (
          <g>
            <line x1="6" y1="66" x2="74" y2="66" stroke={floorStroke} strokeWidth="1.3" />
            {/* Metallic Ab Wheel on Right */}
            <circle cx="64" cy="60.5" r="5.5" fill="#181C26" stroke="#FF4500" strokeWidth="1.6" />
            <circle cx="64" cy="60.5" r="2" fill={`url(#${steelGrad})`} />

            {/* Full Extended Rollout Silhouette */}
            <circle cx="52" cy="40" r="4.4" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M47 43L23 50L13 64H28L25 56L48 49Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Straight Extended Arms Gripping Wheel */}
            <path d="M47 45L63 60" stroke={`url(#${bodyGrad})`} strokeWidth="4.6" strokeLinecap="round" />

            {/* Blazing Orange Core Tension Band */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M27 51C34 49 41.5 46.8 46.5 47.5C45 51.5 37.5 54 28.5 54.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M31 52L43 49" stroke={fiber} strokeWidth="0.9" strokeLinecap="round" />
            </g>
            <path d="M43 45L48 44" stroke={`url(#${cyanGrad})`} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          </g>
        );

      case 'russian-twist':
        return (
          <g>
            <line x1="6" y1="67" x2="74" y2="67" stroke={floorStroke} strokeWidth="1.2" />
            {/* Seated V-Sit Rotational Pose */}
            <circle cx="29" cy="23" r="4.6" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M27 28.5L35 54L54 44L66 57L62 60.5L52 51L35 61.5L22 33.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Arms Holding Weight Plate Twisted Forward */}
            <path d="M30 35L45 41" stroke={`url(#${bodyGrad})`} strokeWidth="4.6" strokeLinecap="round" />
            <circle cx="48" cy="41.5" r="5" fill="#181C26" stroke="#FF4500" strokeWidth="1.4" />
            <circle cx="48" cy="41.5" r="1.6" fill={`url(#${steelGrad})`} />

            {/* Blazing Orange Obliques & Midsection */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M27.5 40C32 39 36.5 43.5 36.5 51.5C32 52.5 28 48.5 27.5 40Z" fill={`url(#${muscleGrad})`} />
              <path d="M29.5 43.5L34.5 46M30 47.5L34.5 49.5" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            {/* Twist Arc */}
            <path d="M40 28C48 25 56 27 60 32" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      case 'forearm-plank':
        return (
          <g>
            <line x1="6" y1="62" x2="74" y2="62" stroke={floorStroke} strokeWidth="1.4" />
            {/* Rigid Horizontal Forearm Plank */}
            <circle cx="63" cy="39" r="4.5" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M58 41.5L13 51.5L14 59.5L18 60.5L19 54.5L57 48.5Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Forearms Stacked Under Shoulders */}
            <path d="M55 46L53 60H64" stroke={`url(#${bodyGrad})`} strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />

            {/* Blazing Orange Core Bracing Strip */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M31 48.5C38 46.5 46 45 52 45.5C51 49.5 43 51.5 32 52Z" fill={`url(#${muscleGrad})`} />
              <path d="M35 49.8L48.5 47.5" stroke={fiber} strokeWidth="0.9" strokeLinecap="round" />
            </g>
            <path d="M23 49.5L30 48.5" stroke={`url(#${cyanGrad})`} strokeWidth="3.2" strokeLinecap="round" opacity="0.8" />
          </g>
        );

      case 'basic-abdominal-crunch':
      default:
        return (
          <g>
            <line x1="6" y1="64" x2="74" y2="64" stroke={floorStroke} strokeWidth="1.4" />
            {/* Supine Floor Crunch with Knees Bent 90° */}
            <circle cx="22" cy="37" r="4.6" fill={`url(#${bodyGrad})`} stroke={rim} strokeWidth="0.65" />
            <path
              d="M24 42.5C30 48 37 54 45 55L55 39L66 63H60.5L54 48.5L46 62H35C29 60 24 53.5 21 46Z"
              fill={`url(#${bodyGrad})`}
              stroke={rim}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Fingertips Near Temples */}
            <path d="M26 46L31 38L26 36" stroke={`url(#${bodyGrad})`} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Blazing Orange Upper 6-Pack Abs */}
            <g filter={`url(#${glowFilter})`}>
              <path d="M30 49.5C35 51.5 41 53.5 44.5 55.5C42 59.5 35.5 59.5 30 55.5Z" fill={`url(#${muscleGrad})`} />
              <path d="M33 52.8L41.5 56M32.5 55.5L40 58" stroke={fiber} strokeWidth="0.85" strokeLinecap="round" />
            </g>
            <path d="M26 26C31 25 36 27 38 32" stroke={arcStroke} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <div
      className={`${sizeClass} relative z-0 isolate overflow-hidden shrink-0 rounded-xl bg-gradient-to-br from-[#1C212C] via-[#12151C] to-[#0A0C10] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_4px_12px_-6px_rgba(0,0,0,0.85)] flex items-center justify-center`}
      title={exercise.isRecommended ? `${exercise.name} · ท่าแนะนำ` : exercise.name}
    >
      {/* Subtle Top Rim Studio Highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1.5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="w-full h-full relative z-0"
      >
        <defs>
          {/* Studio Warm Rim & Ambient Backlight */}
          <radialGradient id={auraGrad} cx="52%" cy="46%" r="50%">
            <stop offset="0%" stopColor="#FF4500" stopOpacity="0.24" />
            <stop offset="56%" stopColor="#38BDF8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0A0C10" stopOpacity="0" />
          </radialGradient>

          {/* Sculpted Metallic Graphite/Skin Gradient */}
          <linearGradient id={bodyGrad} x1="12" y1="8" x2="68" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6B7A90" />
            <stop offset="35%" stopColor="#465164" />
            <stop offset="72%" stopColor="#282F3E" />
            <stop offset="100%" stopColor="#191E28" />
          </linearGradient>

          {/* Depth-Recessed Rear Limb Gradient */}
          <linearGradient id={rearGrad} x1="14" y1="12" x2="66" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B4557" />
            <stop offset="60%" stopColor="#232936" />
            <stop offset="100%" stopColor="#141821" />
          </linearGradient>

          {/* Primary Active Blaze Orange 3D Muscle Gradient */}
          <linearGradient id={muscleGrad} x1="18" y1="18" x2="62" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFA472" />
            <stop offset="32%" stopColor="#FF5F1F" />
            <stop offset="68%" stopColor="#FF4500" />
            <stop offset="100%" stopColor="#A62300" />
          </linearGradient>

          {/* Secondary Synergist Cool Cyan Muscle Accent */}
          <linearGradient id={cyanGrad} x1="16" y1="16" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="55%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Brushed Olympic Steel / Chrome Equipment Gradient */}
          <linearGradient id={steelGrad} x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Matte Gym Leather Bench / Pad Gradient */}
          <linearGradient id={padGrad} x1="10" y1="20" x2="70" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#30384A" />
            <stop offset="100%" stopColor="#161A24" />
          </linearGradient>

          {/* Subsurface Blaze Orange Glow Filter */}
          <filter id={glowFilter} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.1" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 1
                      0 0 0 0 0.3
                      0 0 0 0 0.04
                      0 0 0 0.58 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Studio Radial Spotlight Backdrop */}
        <circle cx="40" cy="40" r="36" fill={`url(#${auraGrad})`} />

        {/* Dynamic Exercise-Specific Anatomical Silhouette */}
        {renderScene()}
      </svg>

      {/* Crisp Small Gold Star Corner Badge — Strictly z-10 Inside Isolated Container */}
      {exercise.isRecommended && (
        <span
          aria-label="ท่าแนะนำ"
          title="ท่าแนะนำ (Recommended)"
          className="absolute top-1 right-1 z-10 w-4 h-4 rounded-full bg-[#090A0D]/90 ring-1 ring-[#FACC15]/60 flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.75)]"
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
