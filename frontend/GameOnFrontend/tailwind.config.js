export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#1a0508",
        surface: "#240a0e",
        card: "#2e0e12",
        border: "#4a1a20",
        accent: "#dc1e3c",
        "accent-hover": "#ff2d4a",
        "text-primary": "#ffffff",
        "text-muted": "#8a5a62",
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}