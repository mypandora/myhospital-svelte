<script>
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';

	const errorConfig = {
		400: { title: '请求错误', description: '请求参数有误，请检查后重试。' },
		401: { title: '未登录', description: '登录已过期，请重新登录。', href: '/login', linkText: '去登录' },
		403: { title: '无权限', description: '您没有权限访问此页面。' },
		404: { title: '页面不存在', description: '您访问的页面不存在。' },
		422: { title: '参数验证失败', description: '提交的数据不符合要求，请检查后重试。' },
		500: { title: '服务器错误', description: '服务器出了点问题，请稍后再试。' },
		502: { title: '网关错误', description: '服务暂时不可用，请稍后再试。' },
		503: { title: '服务不可用', description: '服务正在维护中，请稍后再试。' }
	};

	let config = $derived(
		errorConfig[page.status] || {
			title: '出错了',
			description: page.error?.message || '发生了未知错误。'
		}
	);
</script>

<svelte:head>
	<title>{page.status} - {config.title}</title>
</svelte:head>

<div class="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
	<div class="text-center">
		<h1 class="text-7xl font-bold text-muted-foreground">{page.status}</h1>
		<h2 class="mt-4 text-2xl font-semibold">{config.title}</h2>
		<p class="mt-2 text-muted-foreground">{config.description}</p>
	</div>

	<div class="flex gap-3">
		{#if config.href}
			<Button href={config.href}>{config.linkText}</Button>
		{:else}
			<Button variant="outline" onclick={() => history.back()}>返回上一页</Button>
		{/if}
		<Button variant="outline" href="/">回到首页</Button>
	</div>
</div>
