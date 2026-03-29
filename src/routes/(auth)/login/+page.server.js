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
		{ name: '北京', value: 1 },
		{ name: '天津', value: 0 },
		{ name: '上海', value: 0 },
		{ name: '重庆', value: 0 },
		{ name: '河北', value: 0 },
		{ name: '河南', value: 0 },
		{ name: '云南', value: 0 },
		{ name: '辽宁', value: 0 },
		{ name: '黑龙江', value: 0 },
		{ name: '湖南', value: 0 },
		{ name: '安徽', value: 0 },
		{ name: '山东', value: 0 },
		{ name: '新疆', value: 1 },
		{ name: '江苏', value: 0 },
		{ name: '浙江', value: 0 },
		{ name: '江西', value: 0 },
		{ name: '湖北', value: 0 },
		{ name: '广西', value: 0 },
		{ name: '甘肃', value: 0 },
		{ name: '山西', value: 0 },
		{ name: '内蒙古', value: 0 },
		{ name: '陕西', value: 0 },
		{ name: '吉林', value: 0 },
		{ name: '福建', value: 0 },
		{ name: '贵州', value: 0 },
		{ name: '广东', value: 0 },
		{ name: '青海', value: 0 },
		{ name: '西藏', value: 0 },
		{ name: '四川', value: 0 },
		{ name: '宁夏', value: 0 },
		{ name: '海南', value: 0 },
		{ name: '台湾', value: 0 },
		{ name: '香港', value: 0 },
		{ name: '澳门', value: 0 }
	];

	return {
		form,
		provinceStats
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
