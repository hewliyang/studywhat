/** @type {import('tailwindcss').Config}*/
const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		extend: {},
	},

	corePlugins: {
		preflight: false,
	},

	plugins: [],
};

module.exports = config;
