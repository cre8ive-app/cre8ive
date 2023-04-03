import adapter from '@sveltejs/adapter-static'

import { vitePreprocess } from '@sveltejs/kit/vite'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	trailingSlash: 'always',

	onwarn: (warning, handler) => {
		// TODO: This is not working
		// This disables A11Y warning in IDE
		if (warning.code.startsWith('a11y-')) {
			return
		}
		handler(warning)
	},

	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			fallback: null,
			precompress: false,
			strict: true
		})
	}
}

export default config
