/**
 * Subtle haptic feedback for touch interactions (Android).
 * iOS Safari ignores navigator.vibrate — harmless no-op there.
 */
export const tap = (pattern: number | number[] = 10) => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* ignore */
  }
};

/** Light tap for buttons */
export const tapLight = () => tap(8);
/** Slightly stronger tap for confirmations (like, join) */
export const tapMedium = () => tap([12, 30, 12]);
