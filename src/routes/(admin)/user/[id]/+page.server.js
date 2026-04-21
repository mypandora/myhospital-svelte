import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';
import * as api from '$lib/api/index.js';

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

		const body = await api.patch(fetch, `users/${user.id}`, user);

		if (body.errors) {
			return fail(401, body);
		}

		redirect(307, '/user');
	},
	delete: async ({ locals, request, fetch }) => {
		if (!locals.user) error(401);

		const data = await request.formData();
		const id = data.get('id');

		await api.del(fetch, `users/${id}`);
		redirect(307, '/user');
	}
};
