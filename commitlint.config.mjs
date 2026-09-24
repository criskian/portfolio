/** @type {import("@commitlint/types").UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      1,
      "always",
      [
        "a11y",
        "ci",
        "cursor",
        "deps",
        "docs",
        "hero",
        "i18n",
        "images",
        "layout",
        "manifesto",
        "perf",
        "projects",
        "release",
        "seo",
        "theme",
        "transitions",
        "ui",
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "body-max-line-length": [1, "always", 100],
  },
};

export default config;
