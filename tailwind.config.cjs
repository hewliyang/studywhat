/** @type {import('tailwindcss').Config}*/
const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter Variable"],
			},
		},
	},

	plugins: [],
};

module.exports = config;
