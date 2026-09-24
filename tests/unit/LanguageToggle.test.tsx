import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { I18nProvider } from "@/i18n/I18nProvider";

describe("<LanguageToggle />", () => {
  it("defaults to English and switches to Spanish", async () => {
    render(
      <I18nProvider>
        <LanguageToggle />
      </I18nProvider>,
    );
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.lang).toBe("en");

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.lang).toBe("es");
    expect(window.location.search).toBe("?lang=es");
  });
});
