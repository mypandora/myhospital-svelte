import { fail, error, redirect, isRedirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema.js';
import { zod } from 'sveltekit-superforms/adapters';
import * as api from '$lib/api/index.js';
import { ApiError } from '$lib/api/api-error';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, fetch, params }) {
	if (!locals.user) redirect(302, '/login');

	/** @type {import('../types').Hospital} */
	const hospital = await api.get(fetch, `hospitals/${params.id}`);

	const form = await superValidate(hospital, zod(formSchema));

	return {
		form
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	update: async ({ request, fetch }) => {
		const data = await request.formData();

		/** @type {import('../types').Hospital} */
		const hospital = {
			id: data.get('id'),
			name: data.get('name'),
			code: data.get('code'),
			lvl: data.get('lvl'),
			type: data.get('type'),
			district: data.get('district'),
			address: data.get('address'),
			introduction: data.get('introduction'),
			zipCode: data.get('zipCode')
		};

		Object.keys(hospital).forEach((key) => {
			if (hospital[key] === '') {
				hospital[key] = null;
			}
		});

		try {
			await api.patch(fetch, `hospitals/${hospital.id}`, hospital);
			redirect(307, '/hospital');
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof ApiError) {
				return fail(error.status, { errors: error.message });
			}
			return fail(500, { errors: '服务器错误，请稍后再试' });
		}
	}
};
