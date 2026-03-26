import { error } from '@sveltejs/kit';

const baseURL = import.meta.env.VITE_BASE_URL;

/**
 * @typedef {object} RequestHeaders
 * @property {string} [Authorization] The authentication token.
 * @property {string} [Content-Type] The content type of the request.
 */

/**
 * @typedef {object} RequestOptions
 * @property {string} method The HTTP method to use.
 * @property {RequestHeaders} headers The HTTP headers.
 * @property {string|undefined} [body] The request payload as a stringified JSON object.
 */

/**
 * Sends a request to the server.
 *
 * @template T
 * @param {object} options - The request options.
 * @param {string} options.method - The HTTP method to use.
 * @param {string} options.url - The path to the resource.
 * @param {object|null|undefined} [options.data] - The request payload.
 * @param {RequestHeaders} [options.headers] - The HTTP headers.
 * @param {Record<string, any>} [options.cookies] - The cookies for the request.
 * @returns {Promise<T>} - The response from the server, parsed as a JSON object.
 * @throws {HttpError} - If the HTTP status indicates an error.
 * @throws {Error} - If the provided status is invalid.
 */
async function send({ method, url, data, headers = {}, cookies }) {
	/** @type {RequestOptions} */
	const opts = { method, headers };

	// Add request body if data is provided
	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	// Extract and set JWT from cookies
	if (cookies) {
		const jwt = cookies.get?.('jwt');
		if (jwt) {
			const { token } = JSON.parse(jwt);
			setAuthorizationHeader(opts.headers, token);
		}
	}

	// 修复双斜杠问题
	const cleanBaseURL = baseURL.replace(/\/$/, '');
	const cleanUrl = url.replace(/^\//, '');
	const res = await fetch(`${cleanBaseURL}/${cleanUrl}`, opts);

	// Handle successful response
	if (res.ok || res.status === 422) {
		const text = await res.text();
		return text ? JSON.parse(text) : null;
	}

	// Handle token expiration (401)
	if (res.status === 401) {
		return handleTokenRefreshAndRetry({ method, url, data, headers, cookies });
	}

	// Throw an HTTP error for other statuses
	throw error(res.status);
}

/**
 * Handles token refresh and retries the original request.
 *
 * @template T
 * @param {object} options The request options.
 * @param {string} options.method The HTTP method to use.
 * @param {string} options.url The path to the resource.
 * @param {object|null|undefined} [options.data] The request data.
 * @param {RequestHeaders} [options.headers] The HTTP headers.
 * @param {Record<string, any>} [options.cookies] The cookies for authentication.
 * @returns {Promise<T>}
 */
async function handleTokenRefreshAndRetry({ method, url, data, headers, cookies }) {
	const jwt = cookies?.get?.('jwt');
	if (!jwt) {
		throw new Error('Authentication token is missing');
	}

	const { refreshToken, user } = JSON.parse(jwt);
	try {
		const { token: newToken, refreshToken: newRefreshToken } =
			await refreshAccessToken(refreshToken);

		// Update cookies with new tokens
		const updatedJwt = JSON.stringify({ token: newToken, refreshToken: newRefreshToken, user });
		cookies?.set('jwt', updatedJwt, { path: '/' });

		// Retry the original request with new token
		setAuthorizationHeader((headers = {}), newToken);

		return send({ method, url, data, headers, cookies });
	} catch (err) {
		console.error('Token refresh failed', err);
		throw error(401, 'Unauthorized');
	}
}

/**
 * Sets the Authorization header.
 *
 * @param {RequestHeaders} headers The headers object.
 * @param {string} token The token to set.
 */
function setAuthorizationHeader(headers, token) {
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}
}

/**
 * Refreshes the access token.
 *
 * @async
 * @param {string} refreshToken The refresh token.
 * @returns {Promise<{ token: string; refreshToken: string }>}
 * @throws {Error} If token refresh fails.
 */
async function refreshAccessToken(refreshToken) {
	if (refreshingToken) {
		// Wait for the token refresh to complete
		return new Promise((resolve, reject) => {
			subscribers.push({ resolve, reject });
		});
	}

	refreshingToken = true;

	try {
		// 修复双斜杠问题
		const cleanBaseURL = baseURL.replace(/\/$/, '');
		const res = await fetch(`${cleanBaseURL}/auth/refresh`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${refreshToken}`
			}
		});

		if (res.ok) {
			const { token, refreshToken: newRefreshToken } = await res.json();

			// Notify subscribers
			subscribers.forEach(({ resolve }) => resolve({ token, refreshToken: newRefreshToken }));
			subscribers = [];
			refreshingToken = false;

			return { token, refreshToken: newRefreshToken };
		} else {
			throw new Error('Failed to refresh token');
		}
	} catch (err) {
		subscribers.forEach(({ reject }) => reject(err));
		subscribers = [];
		refreshingToken = false;
		throw err;
	}
}

/**
 * Exported HTTP methods.
 */
/**
 * Sends a GET request to the specified URL.
 *
 * @template T
 * @param {string} url - The endpoint to send the GET request to.
 * @param {object} [options] - Additional request options.
 * @param {RequestHeaders} [options.headers] - Headers to include in the request.
 * @param {object} [options.cookies] - Cookies to include in the request.
 * @returns {Promise<T>} - The server's response, parsed as JSON.
 */
export function get(url, options = {}) {
	return send({ method: 'GET', url, ...options });
}

/**
 * Sends a DELETE request to the specified URL.
 *
 * @param {string} url - The endpoint to send the DELETE request to.
 * @param {object|null|undefined} data - The payload to include in the DELETE request.
 * @param {object} [options] - Additional request options.
 * @param {object} [options.headers] - Headers to include in the request.
 * @param {object} [options.cookies] - Cookies to include in the request.
 * @returns {Promise<object|{errors: string}>} - The server's response, parsed as JSON.
 * @throws {Error} If an HTTP error occurs.
 */
export function del(url, data, options = {}) {
	return send({ method: 'DELETE', data, url, ...options });
}

/**
 * Sends a POST request to the specified URL with the provided data.
 *
 * @param {string} url - The endpoint to send the POST request to.
 * @param {object|null|undefined} data - The payload to include in the POST request.
 * @param {object} [options] - Additional request options.
 * @param {object} [options.headers] - Headers to include in the request.
 * @param {object} [options.cookies] - Cookies to include in the request.
 * @returns {Promise<object|{errors: string}>} - The server's response, parsed as JSON.
 * @throws {Error} If an HTTP error occurs.
 */
export function post(url, data, options = {}) {
	return send({ method: 'POST', url, data, ...options });
}

/**
 * Sends a PUT request to the specified URL with the provided data.
 *
 * @param {string} url - The endpoint to send the PUT request to.
 * @param {object|null|undefined} data - The payload to include in the PUT request.
 * @param {object} [options] - Additional request options.
 * @param {object} [options.headers] - Headers to include in the request.
 * @param {object} [options.cookies] - Cookies to include in the request.
 * @returns {Promise<object|{errors: string}>} - The server's response, parsed as JSON.
 * @throws {Error} If an HTTP error occurs.
 */
export function put(url, data, options = {}) {
	return send({ method: 'PUT', url, data, ...options });
}

/**
 * Sends a PATCH request to the specified URL with the provided data.
 *
 * @param {string} url - The endpoint to send the PATCH request to.
 * @param {object|null|undefined} data - The payload to include in the PATCH request.
 * @param {object} [options] - Additional request options.
 * @param {object} [options.headers] - Headers to include in the request.
 * @param {object} [options.cookies] - Cookies to include in the request.
 * @returns {Promise<object|{errors: string}>} - The server's response, parsed as JSON.
 * @throws {Error} If an HTTP error occurs.
 */
export function patch(url, data, options = {}) {
	return send({ method: 'PATCH', url, data, ...options });
}

/** @type {boolean} */
let refreshingToken = false;

/** @type {Array<{resolve: Function, reject: Function}>} */
let subscribers = [];
