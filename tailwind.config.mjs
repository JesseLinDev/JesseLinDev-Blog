/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				'sans': ['Inter', 'Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				'mono': ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
			},
			colors: {
				surface: {
					DEFAULT: 'var(--color-bg)',
					subtle: 'var(--color-bg-subtle)',
					muted: 'var(--color-bg-muted)',
				},
				content: {
					DEFAULT: 'var(--color-text)',
					secondary: 'var(--color-text-secondary)',
					muted: 'var(--color-text-muted)',
					body: 'var(--color-text-body)',
				},
				line: {
					DEFAULT: 'var(--color-border)',
					strong: 'var(--color-border-strong)',
				},
			},
		},
	},
	plugins: [],
};