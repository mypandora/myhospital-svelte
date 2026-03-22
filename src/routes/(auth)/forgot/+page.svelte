<script>
	import ForgotForm from './form.svelte';

	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();
</script>

<svelte:head>
	<title>找回密码</title>
</svelte:head>

<div class="flex h-screen items-center justify-center">
	<div class="hidden h-full overflow-hidden lg:block lg:w-3/5">
		<img src="/bg.svg" alt="一张中国地图，支持的区域被高亮" class="h-full object-cover" />
	</div>
	<div
		class="bg-background flex w-full items-center justify-center rounded-xl p-8 shadow sm:max-w-md lg:w-2/5 lg:max-w-full lg:rounded-none lg:p-14 lg:shadow-none"
	>
		<div class="w-full max-w-md space-y-8">
			<div class="text-center">
				<h2 class="mt-6 text-3xl font-bold text-gray-900">找回密码</h2>
			</div>

			<ForgotForm data={data.form} />
		</div>
	</div>
</div>
