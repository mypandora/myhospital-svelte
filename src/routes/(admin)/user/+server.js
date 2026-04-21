import { json } from '@sveltejs/kit';
import * as api from '$lib/api/index.js';

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ request, fetch }) {
	const { id, status } = await request.json();

	const body = await api.patch(fetch, `users/${id}`, {
		status: { id: status === 'Active' ? 1 : 2 }
	});

	return json({
		body
	});
}
