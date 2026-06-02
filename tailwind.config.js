module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'Inter'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        bg:      "#0c0c0c",
        surface: "#1a1a1a",
        sidebar: "#111111",
        border:  "#2a2a2a",
        amber:   "#f59e0b",
        text:    "#fafafa",
        muted:   "#6b7280",
      },
    },
  },
  plugins: [],
}