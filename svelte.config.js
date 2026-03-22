import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		typescript: {
			config(config) {
				config.compilerOptions = {
					...config.compilerOptions,
					verbatimModuleSyntax: true
				};
			}
		}
	}
};

export default config;
