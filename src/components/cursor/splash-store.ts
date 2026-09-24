/**
 * Shared, React-free state for the SplashCursor.
 *
 * The WebGL loop reads from here every frame and the event handlers query it on
 * every pointer move, so nothing in this file triggers React renders.
 *
 * Zones are the page sections tagged with `data-splash="on" | "off"`. The fluid
 * reacts only while the pointer is over an "on" zone (hero + manifesto) and is
 * clipped so it never paints over an "off" zone (projects).
 */

export type Rgb = { r: number; g: number; b: number };

interface Zone {
  top: number; // document coordinates
  bottom: number;
  on: boolean;
}

const hex = (value: string): Rgb => {
  const n = parseInt(value.replace("#", ""), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
};

/** Saturated electric blues per theme (deep blues on white read as ink, bright ones glow on black). */
export const SPLASH_PALETTES = {
  dark: ["#2f7bff", "#1f5fff", "#00b4ff", "#3d8bff", "#0a84ff"].map(hex),
  light: ["#0038ff", "#1d4ed8", "#3d6bff", "#0057ff"].map(hex),
} as const;

class SplashStore {
  private zones: Zone[] = [];
  palette: readonly Rgb[] = SPLASH_PALETTES.dark;

  /** Re-read section geometry (document coordinates). Call on resize / layout changes. */
  measure() {
    const scrollY = window.scrollY;
    this.zones = Array.from(document.querySelectorAll<HTMLElement>("[data-splash]")).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top + scrollY,
        bottom: rect.bottom + scrollY,
        on: el.dataset.splash === "on",
      };
    });
  }

  /** Is the viewport point at `clientY` over an "on" section? */
  isActiveAt(clientY: number) {
    const y = clientY + window.scrollY;
    const zone = this.zones.find((z) => y >= z.top && y < z.bottom);
    return zone?.on ?? false;
  }

  /**
   * The viewport band (in px) of the most visible "on" section, or `null` when
   * none is visible. Used to clip the canvas.
   */
  visibleBand(): { top: number; bottom: number } | null {
    const viewTop = window.scrollY;
    const viewBottom = viewTop + window.innerHeight;
    let best: { top: number; bottom: number } | null = null;
    let bestSize = 0;
    for (const zone of this.zones) {
      if (!zone.on) continue;
      const top = Math.max(zone.top, viewTop);
      const bottom = Math.min(zone.bottom, viewBottom);
      if (bottom - top > bestSize) {
        bestSize = bottom - top;
        best = { top: top - viewTop, bottom: bottom - viewTop };
      }
    }
    return best;
  }
}

export const splashStore = new SplashStore();
