/**
 * Animated link — adapted from Skiper UI "skiper40" (Link003,
 * https://skiper-ui.com). Free component; attribution to Skiper UI is required.
 * Changes: external-link attributes and focus-visible support.
 */
import { cn } from "@/lib/utils";

interface AnimatedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export function AnimatedLink({ href, children, className, external = true }: AnimatedLinkProps) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "group/link relative inline-flex items-center",
        "before:pointer-events-none before:absolute before:top-[1.35em] before:left-0 before:h-[0.07em] before:w-full before:origin-center before:scale-x-0 before:bg-current before:content-['']",
        "before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:scale-x-100 focus-visible:before:scale-x-100",
        className,
      )}
    >
      {children}
      <svg
        className="mt-0 ml-[0.3em] size-[0.55em] translate-y-1 opacity-0 transition-all duration-300 group-hover/link:translate-y-0 group-hover/link:opacity-100 group-focus-visible/link:translate-y-0 group-focus-visible/link:opacity-100 motion-reduce:transition-none"
        fill="none"
        viewBox="0 0 10 10"
        aria-hidden
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
