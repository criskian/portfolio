import { SITE, SOCIAL } from "@/content/social";

/** schema.org Person structured data (rendered on the server). */
export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE.url,
    jobTitle: SITE.role,
    knowsAbout: [
      "Artificial Intelligence",
      "Machine Learning",
      "Cloud Computing",
      "Data Engineering",
    ],
    sameAs: [SOCIAL.github.href, SOCIAL.linkedin.href],
  };
  return (
    <script
      type="application/ld+json"
      // Safe: every value is a static constant defined in this repo.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
