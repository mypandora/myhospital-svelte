import { json } from '@sveltejs/kit';
import * as api from '$lib/api/index.js';
import { ApiError } from '$lib/api/api-error';

/**
 * 查询医院
 * @type {import('./$types').RequestHandler}
 *
 */
export async function POST({ fetch, request }) {
	const { lng, lat, radius } = await request.json();

	const q = new URLSearchParams();
	q.set('longitude', lng.toString());
	q.set('latitude', lat.toString());
	q.set('radius', radius.toString());

	try {
		const hospitals = await api.get(fetch, `/hospitals/circle?${q}`);

		return json({ success: true, data: hospitals });
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ success: false, message: err.message }, { status: err.status });
		}
		console.error('[Hospital API Error]:', err);
		return json({ success: false, message: '后端异常' }, { status: 500 });
	}
}
