import { fail, error, redirect } from '@sveltejs/kit';

import * as api from '$lib/api/index.js';

/** @type {import('./$types').Actions} */
export const actions = {
	logout: async ({ cookies, locals, fetch }) => {
		if (!locals.user) error(401);

		const body = await api.post(fetch, 'auth/logout');
		if (body.errors) {
			return fail(400, body.errors);
		}

		cookies.delete('jwt', { path: '/' });
		locals.user = null;

		redirect(307, '/login');
	}
};
