import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema.js';
import { zod } from 'sveltekit-superforms/adapters';
import * as api from '$lib/api.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, cookies, params }) {
	if (!locals.user) redirect(302, '/login');

	/** @type {import('../types').Hospital} */
	const hospital = await api.get(`hospitals/${params.id}`, { cookies });

	const form = await superValidate(hospital, zod(formSchema));

	return {
		form
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	update: async ({ request, cookies }) => {
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

		const body = await api.patch(`hospitals/${hospital.id}`, hospital, { cookies });

		if (body.errors) {
			return fail(401, body);
		}

		redirect(307, '/hospital');
	}
};
