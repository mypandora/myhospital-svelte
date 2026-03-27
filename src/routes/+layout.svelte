<script>
	import { ModeWatcher } from 'mode-watcher';
	import { navigating } from '$app/state';
	import PreloadingIndicator from '$lib/components/PreloadingIndicator.svelte';
	import './layout.css';
	import './style.css';
	import favicon from '$lib/assets/favicon.svg';

	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if navigating.to}
	<PreloadingIndicator />
{/if}

<ModeWatcher />
{@render children?.()}
