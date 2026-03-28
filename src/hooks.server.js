import { AMAP_JSCODE, BASE_URL } from '$env/static/private';
import { PUBLIC_AMAP_SERVICE_HOST } from '$env/static/public';
import { ApiError } from '$lib/api/api-error'; // 保持错误类型

/** @type {boolean} */
let isRefreshing = false;
/** @type {Array<{resolve: Function, reject: Function}>} */
let refreshSubscribers = [];

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
	const { pathname, search } = event.url;

	// 高德地图 API 代理转发
	if (pathname.startsWith(PUBLIC_AMAP_SERVICE_HOST)) {
		const targetPath = pathname.replace('/_AMapService', '');
		const params = new URLSearchParams(search);
		params.set('jscode', AMAP_JSCODE || '');

		const targetUrl = `https://restapi.amap.com${targetPath}?${params.toString()}`;

		try {
			const response = await fetch(targetUrl, {
				method: event.request.method,
				headers: {
					Accept: 'application/json'
				}
			});

			return new Response(response.body, {
				status: response.status,
				headers: {
					'Content-Type': response.headers.get('Content-Type') || 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		} catch (error) {
			console.error('高德地图 API 代理请求失败:', error);
			return new Response(JSON.stringify({ error: '代理请求失败' }), {
				status: 502,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}
	}

	const jwt = event.cookies.get('jwt');
	const {
		user = undefined,
		token = undefined,
		refreshToken = undefined
	} = jwt ? JSON.parse(jwt) : {};

	event.locals.user = user;
	event.locals.token = token;
	event.locals.refreshToken = refreshToken;

	return await resolve(event);
};

/**
 * 关键：handleFetch 钩子 - 拦截所有服务端 fetch 请求
 */
export const handleFetch = async ({ event, request, fetch }) => {
	if (!request.url.startsWith(BASE_URL) || request.url.endsWith('/auth/refresh')) {
		return fetch(request);
	}

	const withAuth = (req, token) => {
		const headers = new Headers(req.headers);
		headers.set('Authorization', `Bearer ${token}`);
		return new Request(req, { headers });
	};

	// ⚠️ 关键：一开始就 clone 一份，用于 retry
	const retryableRequest = request.clone();

	let authRequest = request;

	if (event.locals.token) {
		authRequest = withAuth(request, event.locals.token);
	}

	let response = await fetchSafe(fetch, authRequest);

	if (response.status === 401 && event.locals.refreshToken) {
		try {
			const newToken = await handleTokenRefresh(event.locals.refreshToken, event);

			const retryRequest = withAuth(retryableRequest, newToken);
			response = await fetchSafe(fetch, retryRequest);
		} catch {
			event.cookies.delete('jwt', { path: '/' });
			event.locals.user = undefined;
			event.locals.token = undefined;
			event.locals.refreshToken = undefined;
			return response;
		}
	}

	return response;
};

/**
 * 处理 Token 刷新
 * @param {string} refreshToken
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
async function handleTokenRefresh(refreshToken, event) {
	if (!refreshToken || !event) {
		throw new Error('刷新Token需要refreshToken和event参数');
	}

	if (isRefreshing) {
		return new Promise((resolve, reject) => {
			refreshSubscribers.push({ resolve, reject });
		});
	}

	isRefreshing = true;

	try {
		const response = await fetch(`${BASE_URL}/auth/refresh`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${refreshToken}`
			}
		});

		if (!response.ok) {
			throw new ApiError(response.status, 2002, '刷新Token失败');
		}

		const result = await response.json();
		const newJwtData = {
			token: result.token,
			refreshToken: result.refreshToken,
			user: event.locals.user // 保持用户信息
		};

		// 更新 Cookie
		event.cookies.set('jwt', newJwtData);

		// 更新 locals
		event.locals.token = newJwtData.token;
		event.locals.refreshToken = newJwtData.refreshToken;

		// 通知所有等待的请求
		refreshSubscribers.forEach((sub) => sub.resolve(newJwtData.token));
		refreshSubscribers = [];
		isRefreshing = false;

		return newJwtData.token;
	} catch (error) {
		refreshSubscribers.forEach((sub) => sub.reject(error));
		refreshSubscribers = [];
		isRefreshing = false;
		throw error;
	}
}

async function fetchSafe(fetch, request, retries = 1) {
	try {
		return await fetch(request);
	} catch (err) {
		// 如果是连接被重置，且还有重试次数
		if (retries > 0 && (err.code === 'ECONNRESET' || err.message?.includes('ECONNRESET'))) {
			// 稍微等待 50ms（可选）
			return await fetchSafe(fetch, request, retries - 1);
		}
		throw err;
	}
}
