import { redirect } from '@sveltejs/kit';
import * as api from '$lib/api';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url, cookies }) {
	if (!locals.user) redirect(302, '/login');

	/**
	 * @typedef {Object} QueryParams
	 * @property {string} [page]
	 * @property {string} [limit]
	 * @property {string} [type]
	 * @property {string} [lvl]
	 * @property {string} [sort]
	 */
	/** @type {QueryParams} */
	const {
		page = '1',
		limit = '10',
		type = '',
		lvl = '',
		sort = 'zipCode,asc'
	} = Object.fromEntries(url.searchParams);

	const sortParam = sort.split('&').map((param) => {
		const [id, order] = param.split(',');
		return { orderBy: id, order: order || 'asc' };
	});

	const params = createParams({
		page,
		limit,
		sort: sortParam,
		filter: {
			type,
			lvl
		}
	});
	const { data, total } = await api.get(`hospitals/pagination?${params}`, { cookies });

	return {
		hospitals: data,
		total: total,
		page: parseInt(page, 10),
		limit: parseInt(limit, 10),
		type,
		lvl
	};
}

/** @type {import('./$types').Actions} */
export const actions = {};

/**
 * 创建 URLSearchParams 对象
 * @param {{ page: string, limit: string, sort: object[], filter: object }} options
 * @returns {URLSearchParams}
 */
function createParams({ page, limit, sort, filter }) {
	const params = new URLSearchParams();
	params.set('page', page);
	params.set('limit', limit);
	params.set('sort', JSON.stringify(sort));

	// 如果 filter 存在有效属性，则添加到参数中
	const cleanedFilter = Object.fromEntries(
		Object.entries(filter).filter(([, value]) => value !== '')
	);
	if (Object.keys(cleanedFilter).length > 0) {
		params.set('filter', JSON.stringify(cleanedFilter));
	}

	return params;
}
