<script>
	import { cn } from '$lib/utils.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	let { class: className, orientation = 'vertical', ...restProps } = $props();
</script>

<Separator
	data-slot="button-group-separator"
	{orientation}
	class={cn('relative !m-0 self-stretch bg-input data-[orientation=vertical]:h-auto', className)}
	{...restProps}
/>
