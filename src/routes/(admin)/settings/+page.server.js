import { fail, error, redirect } from '@sveltejs/kit';

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema as basicFormSchema } from './basic-schema';
import { formSchema as passwordFormSchema } from './password-schema';

import * as api from '$lib/api/index.js';
import { ApiError } from '$lib/api/api-error';

export async function load({ locals }) {
	if (!locals.user) redirect(302, '/login');
	return {
		basicForm: await superValidate(zod(basicFormSchema)),
		passwordForm: await superValidate(zod(passwordFormSchema))
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	upload: async ({ cookies, locals, request, fetch }) => {
		if (!locals.user) error(401);

		const data = await request.formData();

		const user = {
			firstName: data.get('firstName'),
			lastName: data.get('lastName'),
			oldPassword: data.get('oldPassword'),
			password: data.get('password'),
			photo: data.get('photo')
		};

		try {
			const body = await api.patch(fetch, 'files/upload', user);
			locals.user = body.user;
		} catch (error) {
			if (error instanceof ApiError) {
				return fail(error.status, { errors: error.message });
			}
			return fail(500, { errors: '服务器错误，请稍后再试' });
		}
	},
	save: async ({ cookies, locals, request, fetch }) => {
		if (!locals.user) error(401);

		const data = await request.formData();

		const user = {
			firstName: data.get('firstName'),
			lastName: data.get('lastName'),
			oldPassword: data.get('oldPassword'),
			password: data.get('password'),
			photo: data.get('photo')
		};

		try {
			const body = await api.patch(fetch, 'auth/me', user);

			const value = JSON.stringify({
				token: locals.token,
				refreshToken: locals.refreshToken,
				user: body.user
			});
			cookies.set('jwt', value, { path: '/' });

			locals.user = body.user;
		} catch (error) {
			if (error instanceof ApiError) {
				return fail(error.status, { errors: error.message });
			}
			return fail(500, { errors: '服务器错误，请稍后再试' });
		}
	}
};
