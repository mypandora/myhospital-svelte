<script>
	import { page } from '$app/state';
	import { Users, House, Hospital } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import NavLogo from '$lib/components/layout/nav-logo.svelte';
	import NavUser from '$lib/components/layout/nav-user.svelte';
	import NavMenu from '$lib/components/layout/nav-menu.svelte';
	import NavSecondary from '$lib/components/layout/nav-secondary.svelte';
	import { selectedMenuItem } from '$lib/stores/menus.js';

	// Menu items.
	const items = [
		{
			title: '首页',
			url: '/',
			icon: House
		},
		{
			title: '用户管理',
			url: '/user',
			icon: Users
		},
		{
			title: '医院管理',
			url: '/hospital',
			icon: Hospital
		}
	];

	const user = page.data?.user;
	let currentUrl = $derived(page.data?.pathname);
	const currentMenuItem = items.find((item) => item.url === currentUrl);
	selectedMenuItem.set(currentMenuItem);
</script>

<Sidebar.Root class="" side="left" variant="sidebar" collapsible="icon">
	<Sidebar.Header class="">
		<NavLogo />
	</Sidebar.Header>
	<Sidebar.Separator class="" />

	<Sidebar.Content class="">
		<NavMenu {items} {currentUrl} />
		<NavSecondary class="mt-auto" />
	</Sidebar.Content>

	<Sidebar.Separator class="" />

	<Sidebar.Footer class="">
		<NavUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
