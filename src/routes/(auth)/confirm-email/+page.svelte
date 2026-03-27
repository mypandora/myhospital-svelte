<script>
	import { onMount } from 'svelte';

	/** @type {string} */
	let hash;

	let confirmationMessage = $state('');

	async function confirmEmail() {
		try {
			const response = await fetch('/confirm-email', {
				method: 'POST',
				body: JSON.stringify({ hash })
			});
			if (response.success) {
				confirmationMessage = '邮箱已确认！';
			} else {
				confirmationMessage = '确认失败，请检查链接或联系支持。';
			}
		} catch (error) {
			confirmationMessage = '网络请求出错，请稍后再试。';
		}
	}

	onMount(() => {
		const urlHash = window.location.hash.replace('#', '');
		hash = urlHash || '';
		confirmEmail();
	});
</script>

<div>
	{#if confirmationMessage}
		<p>{confirmationMessage}</p>
	{:else}
		<p>正在加载...</p>
	{/if}
</div>
