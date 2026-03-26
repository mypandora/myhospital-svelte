<script>
	import { Pencil, Trash2, Ellipsis } from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';

	/** @type {{id: string}} */
	let { id } = $props();

	function handleEdit() {
		// 跳转到用户详情页面
		goto(`/user/${id}`);
	}

	function handleDelete() {
		console.log('Delete');
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="">
		<DropdownMenu.Group>
			<DropdownMenu.Item class="" inset onclick={handleEdit}>
				<Button variant="ghost" size="icon" class="relative size-8 p-0">
					<Pencil class="size-4" />
					编辑
				</Button>
			</DropdownMenu.Item>
			<DropdownMenu.Item class="" inset onclick={handleDelete}>
				<Button variant="ghost" size="icon" class="relative size-8 p-0">
					<Trash2 class="size-4" />
					删除
				</Button>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
