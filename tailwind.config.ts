import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* ISACA brand + Finova aliases */
        isaca: {
          dark: "#1d2d5c",
          medium: "#07649d",
          blue: "#00a4e4",
          teal: "#36ac91",
          green: "#6cb33f",
          light: "#e7f0f5",
          red: "#e31837",
          orange: "#e57524",
          yellow: "#fbb034",
          purple: "#6558b1",
        },
        fin: {
          50: "#e7f0f5",
          100: "#d0e8f5",
          200: "#a3d4ef",
          300: "#5bb8e8",
          400: "#00a4e4",
          500: "#07649d",
          600: "#065a8c",
          700: "#1d2d5c",
          800: "#162448",
          900: "#0f1830",
          950: "#0a1020",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        brand: "0 10px 40px -10px rgba(7, 100, 157, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
