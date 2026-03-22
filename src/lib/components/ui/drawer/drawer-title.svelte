<script>
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { cn } from '$lib/utils.js';

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<DrawerPrimitive.Title
	bind:ref
	class={cn('text-lg leading-none font-semibold tracking-tight', className)}
	{...restProps}
/>
