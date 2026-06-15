"use client";

import { useEffect } from "react";
import { useAppContext } from "@/lib/app-context";
import { generateShadeCssVars } from "@/lib/theme-utils";

const FONT_URLS: Record<string, string> = {
  Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
  Roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
  "Open Sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap",
  Lato: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap",
  Montserrat: "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap",
  Poppins: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap",
  "Plus Jakarta Sans": "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useAppContext();
  const theme = settings.config?.theme;

  useEffect(() => {
    const root = document.documentElement;
    const color = theme?.primaryColor || "#07220B";
    const font = theme?.fontFamily || "Inter";

    const vars = generateShadeCssVars(color);
    for (const [key, val] of Object.entries(vars)) {
      root.style.setProperty(key, val);
    }
    root.style.setProperty("--font-sans", `"${font}"`);

    const linkId = "theme-font-link";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    const url = FONT_URLS[font];
    if (url) {
      if (!link) {
        link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = url;
    } else if (link) {
      link.remove();
    }
  }, [theme?.primaryColor, theme?.fontFamily]);

  return <>{children}</>;
}
