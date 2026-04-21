import { json } from '@sveltejs/kit';
import * as api from '$lib/api/index.js';
import { ApiError } from '$lib/api/api-error';

/**
 * 同步医院数据（全量 / 增量） + 复制医院
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, fetch }) {
	const body = await request.json();

	if (body.mode) {
		const { mode, batchId, regionCode, limit, retryFailed, chunkSize } = body;
		let url;
		if (mode === 'full') {
			const params = new URLSearchParams();
			if (chunkSize) params.set('chunkSize', String(chunkSize));
			url = `hospitals/sync/staging/full?${params.toString()}`;
		} else {
			const params = new URLSearchParams();
			if (batchId) params.set('batchId', batchId);
			if (regionCode) params.set('regionCode', regionCode);
			if (limit) params.set('limit', String(limit));
			if (retryFailed) params.set('retryFailed', 'true');
			url = `hospitals/sync/staging?${params.toString()}`;
		}
		const result = await api.post(fetch, url);
		return json(result);
	}

	const { id } = body;
	if (id) {
		await api.post(fetch, `hospitals/${id}/copy`);
	} else {
		await api.post(fetch, 'hospitals/copy');
	}
	return new Response(null, { status: 204 });
}

/**
 * 定位医院，修改医院的经纬度信息
 * @type {import('./$types').RequestHandler}
 */
export async function PATCH({ request, fetch }) {
	const { id, lng, lat } = await request.json();

	await api.patch(fetch, `hospitals/${id}`, {
		lng,
		lat
	});

	return new Response(null, { status: 204 });
}

/**
 *
 * 删除医院
 * @type {import('./$types').RequestHandler}
 *
 */
export async function DELETE({ request, fetch }) {
	const { id } = await request.json();

	await api.del(fetch, `hospitals/${id}`);

	return new Response(null, { status: 204 });
}
