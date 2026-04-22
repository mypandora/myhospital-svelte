import { json } from '@sveltejs/kit';
import * as api from '$lib/api/index.js';
import { ApiError } from '$lib/api/api-error';

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ request, fetch }) {
	const { id, status } = await request.json();

	try {
		const body = await api.patch(fetch, `users/${id}`, {
			status: { id: status === 'Active' ? 1 : 2 }
		});

		return json({ success: true, data: body });
	} catch (error) {
		if (error instanceof ApiError) {
			return json({ success: false, message: error.message }, { status: error.status });
		}
		return json({ success: false, message: '服务器错误' }, { status: 500 });
	}
}
