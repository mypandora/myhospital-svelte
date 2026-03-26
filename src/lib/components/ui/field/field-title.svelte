<script>
	import { cn } from '$lib/utils.js';
	let { class: className, children, ...restProps } = $props();
</script>

<div
	data-slot="field-title"
	class={cn(
		'flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
