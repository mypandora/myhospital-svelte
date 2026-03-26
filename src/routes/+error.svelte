<script>
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status}</title>
</svelte:head>

<div>
	{#if page.status === 404}
		<h1 class="mx-0 my-40 text-center">Not found!</h1>
	{:else}
		<h1 class="mx-0 my-40 text-center">Something went wrong</h1>
	{/if}
</div>
