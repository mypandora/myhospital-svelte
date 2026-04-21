import { error, redirect } from '@sveltejs/kit';
import * as api from '$lib/api/index.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url, fetch }) {
	if (!locals.user) redirect(302, '/login');

	const page = url.searchParams.get('page') ?? 1;
	const limit = url.searchParams.get('limit') || 10;

	const params = new URLSearchParams();
	params.set('page', '' + page);
	params.set('limit', '' + limit);

	const body = await api.get(fetch, `users?${params}`);

	return {
		users: body.data,
		hasNextPage: body.hasNextPage
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	delete: async ({ locals, request, fetch }) => {
		if (!locals.user) error(401);

		const data = await request.formData();
		const id = data.get('id');

		await api.del(fetch, `users/${id}`);

		redirect(307, '/user');
	}
};
