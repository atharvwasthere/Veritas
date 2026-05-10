/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Titan palette — single source of truth.
        ink: "#111111",
        canvas: "#ffffff",
        sage: "#f3efeb",
        stone: "#e9eaeb",
        gunmetal: "#615e5b",
        concrete: "#d8d3cc",
        action: "#000000",
        accent: "#ff9900",
        risk: { green: "#22c55e", amber: "#ff9900", red: "#ef4444" },
      },
      fontFamily: {
        geist: [
          "Geist",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "Geist Mono",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        caption: ["10px", { lineHeight: "1.2" }],
        "body-sm": ["12px", { lineHeight: "1.2" }],
        body: ["14px", { lineHeight: "1.2" }],
        "body-lg": ["16px", { lineHeight: "1.2" }],
        "heading-sm": ["20px", { lineHeight: "1.2" }],
        heading: ["24px", { lineHeight: "1.2" }],
        "heading-lg": ["32px", { lineHeight: "1.2" }],
        "display-sm": ["40px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        display: ["60px", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
      },
      borderRadius: {
        card: "32px",
        medium: "20px",
        small: "10px",
        nav: "140px",
        pill: "160px",
      },
      spacing: {
        section: "80px",
      },
      maxWidth: {
        page: "1200px",
      },
    },
  },
  plugins: [],
};
