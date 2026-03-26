<script>
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import LifeBuoy from '@lucide/svelte/icons/life-buoy';
	import Send from '@lucide/svelte/icons/send';

	let { ref = $bindable(null), ...restProps } = $props();
</script>

<Sidebar.Group class="" bind:ref {...restProps}>
	<Sidebar.GroupContent class="">
		<Sidebar.Menu class="">
			<Sidebar.MenuItem class="">
				<Sidebar.MenuButton size="sm">
					<LifeBuoy class="mr-2 h-4 w-4" />
					<span>支持</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
			<Sidebar.MenuItem class="">
				<Sidebar.MenuButton size="sm">
					<Send class="mr-2 h-4 w-4" />
					<span>反馈</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
