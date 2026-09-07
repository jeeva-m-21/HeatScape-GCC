/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0F172A", // Deep Slate
        panel: "#1E293B",  // Dark Charcoal
        panelSubtle: "#182234",
        borderPrimary: "#334155",
        accent: {
          DEFAULT: "#F38020", // Cloudflare Orange
          hover: "#EA580C",
        },
        trajectory: {
          emerging: "#EF4444",
          persistent: "#F97316",
          temporary: "#EAB308",
          improving: "#10B981",
          watch: "#64748B",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
