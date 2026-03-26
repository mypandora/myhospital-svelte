<script>
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import { Button } from '$lib/components/ui/button/index.js';

	let { variant = 'ghost', ...restProps } = $props();
</script>

<Button class="" {variant} {...restProps}>Email <ArrowUpDown class="ml-2 size-4" /></Button>
