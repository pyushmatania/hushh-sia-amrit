/**
 * Haptic feedback utility using the Web Vibration API.
 * Falls back silently on unsupported devices.
 */

export function hapticLight() {
  navigator.vibrate?.(10);
}

export function hapticMedium() {
  navigator.vibrate?.(25);
}

export function hapticHeavy() {
  navigator.vibrate?.([30, 10, 30]);
}

export function hapticSuccess() {
  navigator.vibrate?.([10, 30, 10, 30, 50]);
}

export function hapticError() {
  navigator.vibrate?.([50, 50, 50]);
}

export function hapticSelection() {
  navigator.vibrate?.(5);
}
