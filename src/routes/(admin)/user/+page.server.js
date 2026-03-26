import { error, redirect } from '@sveltejs/kit';
import * as api from '$lib/api.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url, cookies }) {
	if (!locals.user) redirect(302, '/login');

	const page = url.searchParams.get('page') ?? 1;
	const limit = url.searchParams.get('limit') || 10;

	const params = new URLSearchParams();
	params.set('page', '' + page);
	params.set('limit', '' + limit);

	const body = await api.get(`users?${params}`, { cookies });

	return {
		users: body.data,
		hasNextPage: body.hasNextPage
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	delete: async ({ locals, request, cookies }) => {
		if (!locals.user) error(401);

		const data = await request.formData();
		const id = data.get('id');

		await api.del(`users/${id}`, { cookies });
		// const result = await api.del(`users/${id}`, { cookies });
		// if (result.error) error(result.status, result.error);

		redirect(307, '/user');
	}
};
