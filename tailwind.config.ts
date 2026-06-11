import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#07220B",
          50: "#E6F0E9",
          100: "#C2D9C9",
          200: "#9DC2A8",
          300: "#78AB87",
          400: "#539466",
          500: "#2E7D45",
          600: "#1A5C2E",
          700: "#07220B",
          800: "#051A08",
          900: "#031105",
        },
        secondary: {
          DEFAULT: "#1A86C8",
          50: "#E3F2FD",
          100: "#BBDEFB",
          200: "#90CAF9",
          300: "#64B5F6",
          400: "#42A5F5",
          500: "#1A86C8",
          600: "#1565C0",
          700: "#0D47A1",
        },
        accent: "#F5F7FA",
        surface: "#FFFFFF",
        muted: "#64748B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(7, 34, 11, 0.08)",
        card: "0 4px 24px -4px rgba(7, 34, 11, 0.12)",
        elevated: "0 8px 32px -8px rgba(7, 34, 11, 0.16)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
