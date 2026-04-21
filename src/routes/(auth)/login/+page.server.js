import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import * as api from '$lib/api/index.js';
import { ApiError } from '$lib/api/api-error';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if (locals.user) redirect(307, '/');

	const form = await superValidate(zod4(formSchema));
	const provinceStats = [
		{ name: '北京', value: 4253 },
		{ name: '天津', value: 3538 },
		{ name: '上海', value: 2981 },
		{ name: '重庆', value: 11797 },
		{ name: '河北', value: 51780 },
		{ name: '河南', value: 58997 },
		{ name: '云南', value: 18297 },
		{ name: '辽宁', value: 15924 },
		{ name: '黑龙江', value: 4007 },
		{ name: '湖南', value: 39937 },
		{ name: '安徽', value: 21921 },
		{ name: '山东', value: 60757 },
		{ name: '新疆', value: 3357 },
		{ name: '江苏', value: 21885 },
		{ name: '浙江', value: 11243 },
		{ name: '江西', value: 22363 },
		{ name: '湖北', value: 29367 },
		{ name: '广西', value: 18496 },
		{ name: '甘肃', value: 21055 },
		{ name: '山西', value: 27822 },
		{ name: '内蒙古', value: 9665 },
		{ name: '陕西', value: 25466 },
		{ name: '吉林', value: 3585 },
		{ name: '福建', value: 15922 },
		{ name: '贵州', value: 23332 },
		{ name: '广东', value: 30420 },
		{ name: '青海', value: 4974 },
		{ name: '西藏', value: 4609 },
		{ name: '四川', value: 26478 },
		{ name: '宁夏', value: 1796 },
		{ name: '海南', value: 3134 },
		{ name: '台湾', value: 0 },
		{ name: '香港', value: 0 },
		{ name: '澳门', value: 0 }
	];

	const cityCoordPoints = [
		{ name: '北京', value: [116.4074, 39.9042, 4253] },
		{ name: '天津', value: [117.2008, 39.0842, 3538] },
		{ name: '上海', value: [121.4737, 31.2304, 2981] },
		{ name: '重庆', value: [106.5516, 29.5630, 11797] },
		{ name: '广州', value: [113.2644, 23.1291, 2897] },
		{ name: '深圳', value: [114.0579, 22.5431, 3927] },
		{ name: '杭州', value: [120.1551, 30.2741, 4105] },
		{ name: '成都', value: [104.0665, 30.5728, 7559] },
	];

	return {
		form,
		provinceStats,
		cityCoordPoints
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, fetch, cookies }) => {
		const form = await superValidate(request, zod4(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			const body = await api.post(fetch, 'auth/email/login', form.data);
			if (body?.errors) {
				return fail(401, body);
			}

			const value = JSON.stringify(body);
			cookies.set('jwt', value, { path: '/' });

			redirect(307, '/');
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof ApiError) {
				return fail(error.status, {
					form,
					errors: error.data
				});
			}

			return fail(500, {
				form,
				errors: { message: '服务器错误，请稍后再试' }
			});
		}
	}
};
