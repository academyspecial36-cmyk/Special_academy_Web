export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hVal = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hVal = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: hVal = ((b - r) / d + 2) / 6; break;
      case b: hVal = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(hVal * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToCss(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

export function generateShadeCssVars(hex: string): Record<string, string> {
  const { h, s, l } = hexToHsl(hex);
  const shades: Record<string, number> = {
    "50": 95, "100": 85, "200": 70, "300": 55,
    "400": 40, "500": 30, "600": 20, "700": 12,
    "800": 8, "900": 4,
  };
  const vars: Record<string, string> = {
    "--primary": hslToCss(h, s, l),
    "--primary-foreground": l > 50 ? "0 0% 5%" : "0 0% 100%",
  };
  for (const [shade, lightness] of Object.entries(shades)) {
    vars[`--primary-${shade}`] = hslToCss(h, s, lightness);
  }
  return vars;
}
