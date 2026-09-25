export const SITE = {
  name: "Cristian Molina",
  /**
   * Canonical origin for metadata, the sitemap and robots.txt. Defaults to the
   * production domain so previews also point search engines to it.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://molinadev.co",
  role: "Software Engineer — AI solutions, cloud & data",
} as const;

export const SOCIAL = {
  github: {
    label: "GitHub",
    handle: "@criskian",
    href: "https://github.com/criskian",
  },
  linkedin: {
    label: "LinkedIn",
    handle: "cristian-molina-ai-cloud",
    href: "https://www.linkedin.com/in/cristian-molina-ai-cloud/",
  },
} as const;

/** Primary contact channel used by the manifesto CTA. */
export const CONTACT_HREF = SOCIAL.linkedin.href;
