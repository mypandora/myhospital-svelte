<script>
	import { Copy, MapPin, Pencil, Trash2, Ellipsis } from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { goto, invalidate } from '$app/navigation';
	import LocationMap from './location-map.svelte';

	/** @type {{id: string, name: string, address: string, longitude?:number, latitude?:number}} */
	let { id, name, address, longitude, latitude } = $props();
	/** @type {boolean} */
	let dialogOpen = $state(false);

	function handleCopy() {
		fetch('/hospital', {
			method: 'POST',
			body: JSON.stringify({ id }),
			headers: {
				'content-type': 'application/json'
			}
		}).then(() => {});
	}

	function handleEdit() {
		goto(`/hospital/${id}`);
	}

	function handleDelete() {
		fetch('/hospital', {
			method: 'DELETE',
			body: JSON.stringify({ id }),
			headers: {
				'content-type': 'application/json'
			}
		}).then((res) => {
			invalidate('/hospital');
		});
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
		<DropdownMenu.Item class="" inset onclick={handleCopy}>
			<Button variant="ghost" size="icon" class="relative size-8 p-0" onclick={handleCopy}>
				<Copy class="size-4" />
				复制
			</Button>
		</DropdownMenu.Item>
		<DropdownMenu.Item class="" inset>
			<Button
				variant="ghost"
				size="icon"
				class="relative size-8 p-0"
				onclick={() => (dialogOpen = true)}
			>
				<MapPin class="size-4" />
				定位
			</Button>
		</DropdownMenu.Item>
		<DropdownMenu.Item class="" inset>
			<Button variant="ghost" size="icon" class="relative size-8 p-0" onclick={handleEdit}>
				<Pencil class="size-4" />
				编辑
			</Button>
		</DropdownMenu.Item>
		<DropdownMenu.Item class="" inset>
			<Button variant="ghost" size="icon" class="relative size-8 p-0" onclick={handleDelete}>
				<Trash2 class="size-4" />
				删除
			</Button>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

{#if dialogOpen}
	<LocationMap {id} {name} {address} bind:dialogOpen {longitude} {latitude} />
{/if}
