export type DeviceTier = "high" | "medium" | "low";

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

/**
 * Rough performance tier from cheap signals, used to scale WebGL effects.
 * Touch devices are always "low": phones and tablets get the lightweight
 * version of every effect (and the SplashCursor at low resolution).
 */
export function detectDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "medium";
  const nav = navigator as NavigatorHints;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const slowNetwork = nav.connection?.saveData || /2g/.test(nav.connection?.effectiveType ?? "");

  if (coarse || slowNetwork || memory <= 4 || cores <= 4) return "low";
  if (memory < 8 || cores < 8) return "medium";
  return "high";
}

export function hasWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Run `cb` when the main thread is idle (falls back to a timeout on Safari). */
export function onIdle(cb: () => void, timeout = 1500) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(cb, Math.min(timeout, 800));
  return () => clearTimeout(id);
}
