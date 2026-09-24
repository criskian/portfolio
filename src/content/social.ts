export const SITE = {
  name: "Cristian Molina",
  /** Canonical origin. Set NEXT_PUBLIC_SITE_URL once the deployment domain is decided. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
