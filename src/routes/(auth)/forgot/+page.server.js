import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import * as api from '$lib/api/index.js';
import { ApiError } from '$lib/api/api-error';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const { user } = await parent();
	if (user) {
		redirect(307, '/');
	}

	return {
		form: await superValidate(zod(formSchema))
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, fetch }) => {
		const form = await superValidate(request, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			await api.post(fetch, 'auth/forgot/password', form.data);
			redirect(307, '/');
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof ApiError) {
				return fail(error.status, { form, errors: error.errors || error.message });
			}
			return fail(500, { form, errors: '服务器错误，请稍后再试' });
		}
	}
};
