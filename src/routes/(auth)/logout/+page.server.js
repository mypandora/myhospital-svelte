import { fail, error, redirect, isRedirect } from '@sveltejs/kit';

import * as api from '$lib/api/index.js';
import { ApiError } from '$lib/api/api-error';

/** @type {import('./$types').Actions} */
export const actions = {
	logout: async ({ cookies, locals, fetch }) => {
		if (!locals.user) error(401);

		try {
			await api.post(fetch, 'auth/logout');

			cookies.delete('jwt', { path: '/' });
			locals.user = null;

			redirect(307, '/login');
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof ApiError) {
				return fail(error.status, { errors: error.message });
			}
			return fail(500, { errors: '服务器错误，请稍后再试' });
		}
	}
};
