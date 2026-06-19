/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        tajawal: ["Tajawal", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#923333",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        tomoh: {
          burgundy: "#923333",
          "burgundy-dark": "#7C2525",
          "burgundy-light": "#fdf2f2",
          orange: "#D97706",
          "orange-light": "#F59E0B",
          ivory: "#FEFCF0",
          charcoal: "#374151",
        },
        burgundy: {
          50:  "#fdf2f2",
          100: "#fce7e7",
          200: "#f9d2d2",
          300: "#f4b0b0",
          400: "#ec8080",
          500: "#e15555",
          600: "#cd3333",
          700: "#ab2626",
          800: "#8e2323",
          900: "#762323",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft:  "0 4px 20px -4px hsl(220 20% 10% / 0.08)",
        card:  "0 8px 32px -8px hsl(220 20% 10% / 0.1)",
        hover: "0 12px 40px -8px hsl(350 65% 42% / 0.2)",
      },
      backgroundImage: {
        "gradient-hero":     "linear-gradient(135deg, #923333 0%, #7C2525 50%, #5C1A1A 100%)",
        "gradient-burgundy": "linear-gradient(135deg, #cd3333 0%, #ab2626 50%, #8e2323 100%)",
        "gradient-soft":     "linear-gradient(135deg, #fdf2f2 0%, #fce7e7 100%)",
        "gradient-card":     "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(210 20% 98%) 100%)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":  "fade-in 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out",
        "fade-up":  "fade-up 0.6s ease-out forwards",
        float:      "float 3s ease-in-out infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in":  { "0%": { opacity: "0" },                               "100%": { opacity: "1" } },
        slideUp:    { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        "fade-up":  { "0%": { opacity: "0", transform: "translateY(20px)" },"100%": { opacity: "1", transform: "translateY(0)" } },
        float:      { "0%, 100%": { transform: "translateY(0)" },            "50%": { transform: "translateY(-10px)" } },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
