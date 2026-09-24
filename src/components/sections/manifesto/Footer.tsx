"use client";

import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { AnimatedLink } from "@/components/skiper/AnimatedLink";
import { SITE, SOCIAL } from "@/content/social";
import { useI18n } from "@/i18n/I18nProvider";
import { SECTION_IDS } from "@/lib/constants";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto mt-28 max-w-7xl px-4 pb-10 sm:mt-36 sm:px-8">
      <div className="flex flex-col gap-8 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <p className="font-mono text-xs text-muted">{t.footer.signature}</p>
          <p className="text-xs text-muted">
            © {year} {SITE.name}. {t.footer.rights}
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <a
            href={SOCIAL.github.href}
            target="_blank"
            rel="noreferrer"
            aria-label={SOCIAL.github.label}
            className="text-muted transition-colors hover:text-accent"
          >
            <GitHubIcon className="size-5" />
          </a>
          <a
            href={SOCIAL.linkedin.href}
            target="_blank"
            rel="noreferrer"
            aria-label={SOCIAL.linkedin.label}
            className="text-muted transition-colors hover:text-accent"
          >
            <LinkedInIcon className="size-5" />
          </a>
          <AnimatedLink href={`#${SECTION_IDS.input}`} external={false} className="text-fg">
            {t.footer.backToTop}
          </AnimatedLink>
        </div>
      </div>
    </footer>
  );
}
