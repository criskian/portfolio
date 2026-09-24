import { describe, expect, it } from "vitest";

import { en } from "@/i18n/dictionaries/en";
import { es } from "@/i18n/dictionaries/es";

type Tree = { [key: string]: unknown };

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return `array(${value.length})`;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Tree).map(([k, v]) => [k, shape(v)]));
  }
  return typeof value;
}

describe("dictionaries", () => {
  it("have identical structure in English and Spanish", () => {
    expect(shape(es)).toEqual(shape(en));
  });

  it("have no empty strings", () => {
    const empty: string[] = [];
    const walk = (value: unknown, path: string) => {
      if (typeof value === "string" && !value.trim()) empty.push(path);
      else if (value && typeof value === "object")
        Object.entries(value as Tree).forEach(([k, v]) => walk(v, `${path}.${k}`));
    };
    walk(en, "en");
    walk(es, "es");
    expect(empty).toEqual([]);
  });
});
