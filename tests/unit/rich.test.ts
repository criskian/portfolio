import { describe, expect, it } from "vitest";

import { parseRich, richWords, stripRich } from "@/components/text/rich";

describe("rich text markup", () => {
  it("parses accent and serif segments", () => {
    expect(parseRich("find the **signal** and _talk back_.")).toEqual([
      { text: "find the ", kind: "plain" },
      { text: "signal", kind: "accent" },
      { text: " and ", kind: "plain" },
      { text: "talk back", kind: "serif" },
      { text: ".", kind: "plain" },
    ]);
  });

  it("keeps punctuation glued to the styled word before it", () => {
    const words = richWords("data that _talks back_.");
    expect(words).toHaveLength(4);
    expect(words.at(-1)).toEqual([
      { text: "back", kind: "serif" },
      { text: ".", kind: "plain" },
    ]);
  });

  it("strips markup for accessible names", () => {
    expect(stripRich("Signal over _noise._")).toBe("Signal over noise.");
  });
});
