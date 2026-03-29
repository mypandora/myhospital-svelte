<script>
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Command from '@lucide/svelte/icons/command';

	const resolve = (path) => path;
</script>

<Sidebar.Menu class="">
	<Sidebar.MenuItem class="">
		<Sidebar.MenuButton size="lg">
			{#snippet child({ props })}
				<a href={resolve('/')} {...props}>
					<div
						class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
					>
						<Command class="size-4" />
					</div>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold"> 医保定点医院 </span>
						<span class="truncate text-xs">北京</span>
					</div>
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
</Sidebar.Menu>
