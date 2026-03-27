import { AMAP_JSCODE } from '$env/static/private';
import { PUBLIC_AMAP_SERVICE_HOST } from '$env/static/public';


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
