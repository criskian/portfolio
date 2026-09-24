import { cn } from "@/lib/utils";

import { parseRich, RICH_CLASS } from "./rich";

/** Static rich text (server-safe). */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {parseRich(text).map((segment, i) =>
        segment.kind === "plain" ? (
          segment.text
        ) : (
          <span key={i} className={cn(RICH_CLASS[segment.kind])}>
            {segment.text}
          </span>
        ),
      )}
    </span>
  );
}
