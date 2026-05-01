<script>
	import { cn } from '$lib/utils.js';

	/** @typedef {{ label: string, value?: string, keywords?: string[], children?: CascaderOption[] }} CascaderOption */

	let {
		ref = $bindable(null),
		class: className,
		placeholder = '请选择...',
		value = $bindable(''),
		options = [],
		disabled = false,
		onValueChange,
		...restProps
	} = $props();

	let open = $state(false);
	let search = $state('');
	let activeIndex = $state(0);

	// ===============================
	// 1️⃣ flatten（只做一次）
	// ===============================
	function flattenTree(nodes, parentPath = []) {
		let result = [];

		for (const node of nodes) {
			const path = [...parentPath, node.label];

			if (node.children?.length) {
				result.push(...flattenTree(node.children, path));
			} else {
				result.push({
					label: path.join(' / '),
					value: node.value ?? path.join('/'),
					path,
					searchText: [...path, ...(node.keywords ?? [])].join(' ').toLowerCase()
				});
			}
		}

		return result;
	}

	let flatItems = $derived.by(() => flattenTree(options));

	// ===============================
	// 2️⃣ 搜索（带防抖）
	// ===============================
	let debouncedSearch = $state('');

	let timer;
	$effect(() => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			debouncedSearch = search;
		}, 200);
	});

	let filteredItems = $derived.by(() => {
		const q = debouncedSearch.trim().toLowerCase();
		if (!q) return flatItems;

		return flatItems.filter((item) => item.searchText.includes(q));
	});

	// ===============================
	// 3️⃣ 当前选中项
	// ===============================
	let selectedItem = $derived.by(() => flatItems.find((i) => i.value === value));

	let displayLabel = $derived.by(() => selectedItem?.label ?? '');

	// ===============================
	// 4️⃣ 选择逻辑
	// ===============================
	function handleSelect(item) {
		value = item.value;
		open = false;
		search = '';
		activeIndex = 0;
		onValueChange?.(item.value);
	}

	// ===============================
	// 5️⃣ 键盘导航（核心）
	// ===============================
	function handleKeydown(e) {
		if (!open) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = (activeIndex + 1) % filteredItems.length;
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = (activeIndex - 1 + filteredItems.length) % filteredItems.length;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			const item = filteredItems[activeIndex];
			if (item) handleSelect(item);
		}

		if (e.key === 'Escape') {
			open = false;
		}
	}

	// ===============================
	// 6️⃣ 高亮
	// ===============================
	function highlight(text, keyword) {
		if (!keyword) return text;

		const regex = new RegExp(`(${keyword})`, 'ig');
		return text.replace(regex, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>');
	}
</script>

<div class="relative min-w-0 flex-1" bind:this={ref} onkeydown={handleKeydown} tabindex="0" {...restProps}>
	<!-- Trigger -->
	<button
		type="button"
		class={cn(
			'flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm shadow-xs',
			'focus-visible:ring-2 focus-visible:ring-ring',
			!displayLabel && 'text-muted-foreground',
			className
		)}
		{disabled}
		onclick={() => !disabled && (open = !open)}
	>
		<span class="min-w-0 flex-1 truncate text-left">
			{displayLabel || placeholder}
		</span>

		<svg class="ml-2 h-4 w-4 shrink-0 opacity-50" viewBox="0 0 24 24">
			<path d="m6 9 6 6 6-6" stroke="currentColor" fill="none" />
		</svg>
	</button>

	{#if open}
		<!-- overlay -->
		<div class="fixed inset-0 z-40" onclick={() => (open = false)} />

		<!-- panel -->
		<div class="absolute z-50 mt-1 min-w-full rounded-md border bg-popover shadow-md" style="width: max-content; min-width: 12rem; max-width: 24rem;">
			<!-- search -->
			<div class="flex items-center border-b px-3">
				<input
					class="h-9 w-full bg-transparent text-sm outline-none"
					placeholder="搜索..."
					bind:value={search}
				/>
			</div>

			<!-- list -->
			<div class="max-h-64 overflow-y-auto p-1">
				{#if filteredItems.length === 0}
					<div class="py-6 text-center text-sm text-muted-foreground">无匹配结果</div>
				{:else}
					{#each filteredItems as item, i (item.value)}
						<button
							type="button"
							class={cn(
								'flex w-full items-center rounded-sm px-2 py-1.5 text-sm whitespace-nowrap',
								'hover:bg-accent',
								i === activeIndex && 'bg-accent',
								item.value === value && 'font-medium'
							)}
							onclick={() => handleSelect(item)}
							onmouseenter={() => (activeIndex = i)}
						>
							<!-- check -->
							<span class="mr-2 w-4 shrink-0">
								{#if item.value === value}✔{/if}
							</span>

							<!-- path -->
							{#each item.path as seg, idx}
								<span
									class={idx === item.path.length - 1
										? 'text-foreground'
										: 'text-muted-foreground'}
								>
									{@html highlight(seg, debouncedSearch)}
								</span>

								{#if idx < item.path.length - 1}
									<span class="text-muted-foreground/50">/</span>
								{/if}
							{/each}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>
