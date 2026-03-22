<script>
	import { goto } from '$app/navigation';
	import { resetMode, setMode } from 'mode-watcher';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar';
	import BadgeCheck from 'lucide-svelte/icons/badge-check';
	import Bell from 'lucide-svelte/icons/bell';
	import LogOut from 'lucide-svelte/icons/log-out';
	import Sun from 'lucide-svelte/icons/sun';
	import MoonStar from 'lucide-svelte/icons/moon-star';
	import Monitor from 'lucide-svelte/icons/monitor';
	import User from 'lucide-svelte/icons/user';

	let { user, isMobile, showDashboard = false } = $props();

	async function handleLogout() {
		const response = await fetch(`/logout?/logout`, {
			method: 'POST',
			body: Object.create({}),
			headers: {
				'x-sveltekit-action': 'true'
			}
		});
		if (response.ok) {
			goto(`/login`);
		} else {
			// 退出失败，你可以在这里处理错误
		}
	}
</script>

<DropdownMenu.Content
	class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
	side={isMobile ? 'bottom' : 'right'}
	align="end"
	sideOffset={4}
>
	<DropdownMenu.Label class="p-0 font-normal" inset={false}>
		<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
			<Avatar.Root class="h-8 w-8 rounded-lg">
				<Avatar.Image class="" src={user.avatar} alt={user.lastName} />
				<Avatar.Fallback class="rounded-lg">{user.lastName}</Avatar.Fallback>
			</Avatar.Root>
			<div class="grid flex-1 text-left text-sm leading-tight">
				<span class="truncate font-semibold">{user.lastName}{user.firstName}</span>
				<span class="truncate text-xs">{user.email}</span>
			</div>
		</div>
	</DropdownMenu.Label>
	<DropdownMenu.Separator class="" />
	<DropdownMenu.Group>
		{#if user.role.name === 'Admin' && showDashboard}
			<DropdownMenu.Item class="" inset={false}>
				<a class="flex w-full items-center gap-2" href="/user">
					<User />
					<span>控制台</span>
				</a>
			</DropdownMenu.Item>
		{/if}
		<DropdownMenu.Item class="cursor-pointer" inset={false} onSelect={() => goto('/settings')}>
			<BadgeCheck />
			个人中心
		</DropdownMenu.Item>
		<DropdownMenu.Item class="cursor-pointer" inset={false}>
			<Bell />
			消息
		</DropdownMenu.Item>
	</DropdownMenu.Group>
	<DropdownMenu.Separator class="" />
	<DropdownMenu.Group>
		<DropdownMenu.Item class="cursor-pointer" inset={false} onclick={() => setMode('light')}>
			<Sun />
			<span>浅色</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item class="cursor-pointer" inset={false} onclick={() => setMode('dark')}>
			<MoonStar />
			<span>深色</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item class="cursor-pointer" inset={false} onclick={() => resetMode()}>
			<Monitor />
			<span>自动</span>
		</DropdownMenu.Item>
	</DropdownMenu.Group>
	<DropdownMenu.Separator class="" />
	<DropdownMenu.Item class="cursor-pointer" inset={false}>
		<LogOut />
		<button onclick={handleLogout}>退出</button>
	</DropdownMenu.Item>
</DropdownMenu.Content>
