import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'arc-bg': '#050510',
        'arc-card': 'rgba(255,255,255,0.03)',
        'arc-border': 'rgba(255,255,255,0.08)',
        'arc-green': '#00FF88',
        'arc-cyan': '#06B6D4',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
