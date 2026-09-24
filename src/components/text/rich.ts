export type RichKind = "plain" | "accent" | "serif";

export interface RichSegment {
  text: string;
  kind: RichKind;
}

const TOKEN = /(\*\*[^*]+\*\*|_[^_]+_)/g;

/** Parse the tiny markup used in the dictionaries: `**accent**` and `_serif italic_`. */
export function parseRich(input: string): RichSegment[] {
  return input
    .split(TOKEN)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return { text: part.slice(2, -2), kind: "accent" as const };
      }
      if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
        return { text: part.slice(1, -1), kind: "serif" as const };
      }
      return { text: part, kind: "plain" as const };
    });
}

/**
 * Split rich text into words for per-word animations. A word may contain
 * several styled pieces (e.g. `_back_.` → "back" serif + "." plain), so
 * punctuation stays glued to the word it follows.
 */
export function richWords(input: string): RichSegment[][] {
  const words: RichSegment[][] = [];
  let current: RichSegment[] = [];

  for (const segment of parseRich(input)) {
    for (const part of segment.text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        if (current.length) words.push(current);
        current = [];
      } else {
        current.push({ text: part, kind: segment.kind });
      }
    }
  }
  if (current.length) words.push(current);
  return words;
}

export const RICH_CLASS: Record<RichKind, string> = {
  plain: "",
  accent: "text-accent",
  serif: "font-serif text-[1.08em] italic",
};

/** Plain-text version (for aria-labels, titles…). */
export const stripRich = (input: string) =>
  parseRich(input)
    .map((s) => s.text)
    .join("");
