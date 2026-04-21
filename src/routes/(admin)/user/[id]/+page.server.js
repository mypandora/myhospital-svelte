import { fail, error, redirect, isRedirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';
import * as api from '$lib/api/index.js';
import { ApiError } from '$lib/api/api-error';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, fetch, params }) {
	if (!locals.user) redirect(302, '/login');

	/** @type {import('../types').User} */
	const user = await api.get(fetch, `users/${params.id}`);

	const form = await superValidate(user, zod(formSchema));

	return {
		form
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	update: async ({ request, fetch }) => {
		const data = await request.formData();
		const oldEmail = data.get('oldEmail');
		const newEmail = data.get('email');

		/** @type {import('../types').User} */
		const user = {
			id: data.get('id'),
			firstName: data.get('firstName'),
			lastName: data.get('lastName')
		};

		if (oldEmail !== newEmail) {
			user.email = newEmail;
		}

		try {
			await api.patch(fetch, `users/${user.id}`, user);
			redirect(307, '/user');
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof ApiError) {
				return fail(error.status, { errors: error.message });
			}
			return fail(500, { errors: '服务器错误，请稍后再试' });
		}
	},
	delete: async ({ locals, request, fetch }) => {
		if (!locals.user) error(401);

		const data = await request.formData();
		const id = data.get('id');

		try {
			await api.del(fetch, `users/${id}`);
			redirect(307, '/user');
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof ApiError) {
				return fail(error.status, { errors: error.message });
			}
			return fail(500, { errors: '服务器错误，请稍后再试' });
		}
	}
};
