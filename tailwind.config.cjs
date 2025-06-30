const path = require('path');

/* absolute path helper so we can log it later */
const r = p => path.resolve(__dirname, p);

/** @type {import('tailwindcss').Config} */
module.exports = {
  /** 1️⃣ LIST every location where JSX/TSX lives */
  content: [
    r('apps/web/index.html'),
    r('apps/web/src/**/*.{js,jsx,ts,tsx}'),
    r('packages/**/src/**/*.{js,jsx,ts,tsx}')
  ],
  safelist: [
    'min-h-screen', 'bg-gray-50', 'pt-4', 'fixed', 'top-2', 'right-2',
    'text-green-600', 'font-bold', 'hidden', 'grid', 'rounded-lg', 
    'bg-slate-50', 'p-4', 'border', 'shadow-md'
  ],
  theme: { 
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
    } 
  },
  plugins: [require("tailwindcss-animate")],
};

console.log('[Tailwind] looking at', module.exports.content);