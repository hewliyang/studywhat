/** @type {import('tailwindcss').Config}*/
const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		extend: {
			fontFamily: {
				sans: ['Outfit', 'system-ui', 'sans-serif'],
				heading: ['"DM Sans"', 'system-ui', 'sans-serif'],
				mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
			},
			colors: {
				cream: '#FAFAF7',
				ink: '#1a1a1a',
				muted: '#71717a',
				border: '#e8e5df',
				'border-dark': '#d4d0c8',
				accent: '#2563eb',
				'accent-hover': '#1d4ed8',
				gain: '#16a34a',
				loss: '#dc2626',
				'surface': '#ffffff',
				'surface-hover': '#f5f4f0',
			},
		},
	},

	plugins: [],
};

module.exports = config;
