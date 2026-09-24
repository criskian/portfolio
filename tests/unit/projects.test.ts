import { describe, expect, it } from "vitest";

import { PROJECTS } from "@/content/projects";

describe("project content", () => {
  it("has unique slugs", () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("is fully translated", () => {
    for (const project of PROJECTS) {
      for (const field of [project.tagline, project.summary, project.role, project.impact]) {
        expect(field.en.trim()).not.toBe("");
        expect(field.es.trim()).not.toBe("");
      }
    }
  });

  it("uses only https links", () => {
    for (const { links } of PROJECTS) {
      for (const href of Object.values(links)) expect(href).toMatch(/^https:\/\//);
    }
  });
});
