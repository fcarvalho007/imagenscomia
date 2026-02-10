import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "off-white": "hsl(var(--off-white))",
        surface: "hsl(var(--surface))",
        "blue-50": "hsl(var(--blue-50))",
        "blue-100": "hsl(var(--blue-100))",
        "blue-600": "hsl(var(--blue-600))",
        "blue-700": "hsl(var(--blue-700))",
        "green-50": "hsl(var(--green-50))",
        "green-600": "hsl(var(--green-600))",
        "green-700": "hsl(var(--green-700))",
        "amber-50": "hsl(var(--amber-50))",
        "amber-500": "hsl(var(--amber-500))",
        "amber-600": "hsl(var(--amber-600))",
        "red-50": "hsl(var(--red-50))",
        "red-500": "hsl(var(--red-500))",
        "ink-900": "hsl(var(--ink-900))",
        "ink-700": "hsl(var(--ink-700))",
        "ink-500": "hsl(var(--ink-500))",
        "ink-400": "hsl(var(--ink-400))",
        "ink-300": "hsl(var(--ink-300))",
        "cta-free": "hsl(var(--cta-free))",
        "cta-free-hover": "hsl(var(--cta-free-hover))",
        "cta-premium": "hsl(var(--cta-premium))",
        "cta-premium-hover": "hsl(var(--cta-premium-hover))",
        urgency: "hsl(var(--urgency))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
