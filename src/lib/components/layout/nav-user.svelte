<script>
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import LoginPop from './login-pop.svelte';

	let { user } = $props();
	const sidebar = useSidebar();
</script>

<Sidebar.Menu class="">
	<Sidebar.MenuItem class="">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<Avatar.Root class="h-8 w-8 rounded-lg">
							<Avatar.Image class="" src={user.photo} alt="用户头像" />
							<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{user.fristName}{user.lastName}</span>
							<span class="truncate text-xs">{user.email}</span>
						</div>
						<ChevronsUpDown class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>

			<LoginPop {user} isMobile={sidebar.isMobile} />
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
