import { useTheme } from "next-themes";

import { useMounted } from "./useMounted";

/**
 * Hydration-safe theme flag for values rendered into markup (inline styles,
 * WebGL colours…). next-themes already knows the stored theme during the first
 * client render, but the server HTML was rendered with the default (dark);
 * React keeps mismatched attributes, so we report dark until mounted.
 */
export function useIsLight() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  return mounted && resolvedTheme === "light";
}
