import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Paper-Hatch design system
        ink: {
          900: "#1F1B17", // main text
          700: "#4D4136", // headings
        },
        paper: {
          100: "#F4EFE4", // page background
          200: "#E8DDC9", // panels/cards
        },
        hatch: {
          600: "#7A6857", // etched lines/dividers
        },
        hat: {
          400: "#E3A46E", // light accent
          600: "#B7662E", // PRIMARY accent
          700: "#8E4E22", // active/darker
        },
        pine: {
          500: "#2D5A4E", // success
        },
        berry: {
          500: "#7C3A2F", // error/destructive
        },
        // shadcn/ui compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        letterpress: "inset 0 1px 0 rgba(0,0,0,.18), inset 0 -1px 0 rgba(255,255,255,.25)",
        softlift: "0 12px 28px rgba(31,27,23,.18)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
