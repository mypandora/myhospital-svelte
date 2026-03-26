<script>
	import { page } from '$app/state';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button/index.js';
	import LoginPop from '$lib/components/layout/login-pop.svelte';

	let props = $props();

	const user = page.data?.user;
</script>

<div {...props}>
	<DropdownMenu.Root>
		{#if user}
			<DropdownMenu.Trigger>
				<Avatar.Root class="">
					<Avatar.Image class="h-12 w-12" src={user.photo} alt="用户头像" />
					<Avatar.Fallback class="">{user.lastName}</Avatar.Fallback>
				</Avatar.Root>
			</DropdownMenu.Trigger>
		{:else}
			<Button class="" variant="link" href="/login">登录</Button>
		{/if}
		<LoginPop {user} isMobile={false} showDashboard={true} />
	</DropdownMenu.Root>
</div>
