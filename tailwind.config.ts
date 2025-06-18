import type { Config } from 'tailwindcss'
import { withUt } from "uploadthing/tw";

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './**/*.{ts,tsx,mdx}',
  ],
  // ... rest of your configuration
}

export default withUt(config);