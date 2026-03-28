import { BASE_URL } from '$env/static/private';
import { ApiError } from './api-error';

/**
 * 通用 API 请求函数
 * @param {typeof fetch} fetch - fetch 函数
 * @param {string} url - 请求 URL
 * @param {object} options - 请求选项
 * @param {string} options.method - HTTP 方法
 * @param {object|undefined} [options.headers] - 请求头
 * @param {object|undefined} [options.payload] - 请求体
 * @returns {Promise<any>}
 */
export async function apiFetch(fetch, url, options) {
	// 清理 URL
	const cleanBaseURL = (BASE_URL || '').replace(/\/$/, '');
	const cleanUrl = (url || '').replace(/^\//, '');
	const finalUrl = cleanUrl ? `${cleanBaseURL}/${cleanUrl}` : cleanBaseURL;

	// 准备请求选项
	const { headers, payload, ...rest } = options;
	const fetchOptions = {
		...rest,
		headers: {
			'Content-Type': 'application/json',
			...headers
		}
	};

	// 如果有 payload，自动序列化到 body
	if (payload !== undefined) {
		fetchOptions.body = JSON.stringify(payload);
	}

	try {
		const response = await fetch(finalUrl, fetchOptions);

		// 处理非 2xx 响应
		if (!response.ok) {
			// 尝试解析错误信息
			let errorData = {};
			const contentType = response.headers.get('content-type');

			if (contentType && contentType.includes('application/json')) {
				errorData = await response.json().catch(() => ({}));
			} else {
				const text = await response.text().catch(() => '');
				errorData = { message: text || `HTTP ${response.status}` };
			}

			// 构造自定义错误对象
			throw new ApiError(
				response.status,
				errorData.code,
				errorData.message || `HTTP ${response.status}`,
				errorData.traceId,
				errorData.errors
			);
		}

		// 处理无内容响应
		if (response.status === 204) {
			return null;
		}

		// 解析成功响应
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			return await response.json();
		}

		return await response.text();
	} catch (error) {
		// 如果是 ApiError，直接抛出
		if (error instanceof ApiError) {
			throw error;
		}

		// 其他错误（如网络错误）包装后抛出
		throw new ApiError(0, 'NETWORK_ERROR', error.message || 'Network request failed', null, null);
	}
}

/**
 * 快捷方法：GET 请求
 * @param {typeof fetch} fetch
 * @param {string} url
 * @param {object} options
 * @returns
 */
export async function get(fetch, url, options = {}) {
	return apiFetch(fetch, url, { ...options, method: 'GET' });
}

/**
 * 快捷方法：POST 请求
 * @param {typeof fetch} fetch
 * @param {string} url
 * @param {object} payload
 * @param {object} options
 * @returns
 */
export async function post(fetch, url, payload = {}, options = {}) {
	return apiFetch(fetch, url, { ...options, payload, method: 'POST' });
}

/**
 * 快捷方法：PUT 请求
 * @param {typeof fetch} fetch
 * @param {string} url
 * @param {object} payload
 * @param {object} options
 * @returns
 */
export async function put(fetch, url, payload = {}, options = {}) {
	return apiFetch(fetch, url, { ...options, payload, method: 'PUT' });
}

/**
 *
 * @param {typeof fetch} fetch
 * @param {string} url
 * @param {object} payload
 * @param {object} options
 * @returns
 */
export async function patch(fetch, url, payload = {}, options = {}) {
	return apiFetch(fetch, url, { ...options, payload, method: 'PATCH' });
}

/**
 * 快捷方法：DELETE 请求
 * @param {typeof fetch} fetch
 * @param {string} url
 * @param {object} payload
 * @param {object} options
 * @returns
 */
export async function del(fetch, url, payload = {}, options = {}) {
	return apiFetch(fetch, url, { ...options, payload, method: 'DELETE' });
}
