import { json } from '@sveltejs/kit';
import * as api from '$lib/api.js';

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ request, cookies }) {
	const { id, status } = await request.json();

	const body = await api.patch(
		`users/${id}`,
		{ status: { id: status === 'Active' ? 1 : 2 } },
		{ cookies }
	);

	return json({
		body
	});
}
