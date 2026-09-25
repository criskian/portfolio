export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/**
 * Every user-facing string lives here. Both dictionaries are typed against
 * this interface, so a missing translation is a compile-time error.
 *
 * Inline markup supported by <RichText />: `**accent**` and `_serif italic_`.
 */
export interface Dictionary {
  meta: {
    title: string;
    description: string;
  };
  a11y: {
    skipToContent: string;
    primaryNav: string;
  };
  controls: {
    themeToDark: string;
    themeToLight: string;
    language: string;
    switchTo: string;
  };
  nav: {
    input: string;
    hidden: string;
    output: string;
  };
  hero: {
    label: string;
    greeting: string;
    name: string;
    rolePrefix: string;
    roles: readonly string[];
    intro: string;
    cta: string;
    portraitAlt: string;
    status: string;
  };
  forwardPass: {
    label: string;
    caption: string;
    epoch: string;
    loss: string;
  };
  projects: {
    label: string;
    title: string;
    subtitle: string;
    viewCase: string;
    viewCode: string;
    liveDemo: string;
    present: string;
    placeholder: string;
    featured: string;
    mockNotice: string;
    role: string;
    impact: string;
  };
  activation: {
    bandA: readonly string[];
    bandB: readonly string[];
  };
  manifesto: {
    label: string;
    title: string;
    paragraphs: readonly string[];
    cta: string;
    ctaHint: string;
  };
  footer: {
    signature: string;
    rights: string;
    backToTop: string;
  };
}
