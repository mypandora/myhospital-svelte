import * as api from '$lib/api.js';

/**
 * 查询医院
 * @type {import('./$types').RequestHandler}
 *
 */
export async function POST({ request, cookies }) {
	const { lng, lat, radius } = await request.json();

	const q = new URLSearchParams();
	q.set('longitude', lng.toString());
	q.set('latitude', lat.toString());
	q.set('radius', radius.toString());

	const hospitals = await api.get(`hospitals/circle?${q}`, { cookies });

	return new Response(JSON.stringify(hospitals), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
