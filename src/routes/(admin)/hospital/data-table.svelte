<script>
	import { goto, invalidateAll } from '$app/navigation';
	import {
		getCoreRowModel,
		getPaginationRowModel,
		getFilteredRowModel
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	/** @type {{data?: Array<import('./types').Hospital>, columns: import('@tanstack/table-core').ColumnDef<import('./types').Hospital>[], total?: number, pageIndex?: number, pageSize?: number, type?: string, lvl?: string}} */
	let { data, columns, total = 0, pageIndex = 1, pageSize = 10, type = '', lvl = '' } = $props();

	/** @type {import('@tanstack/table-core').PaginationState} */
	let pagination = $state({ pageIndex: pageIndex - 1, pageSize });
	/** @type {import('@tanstack/table-core').ColumnFiltersState} */
	let columnFilters = $state([]);
	/** @type {import('@tanstack/table-core').VisibilityState} */
	let columnVisibility = $state({});
	/** @type {import('@tanstack/table-core').RowSelectionState} */
	let rowSelection = $state({});
	/** @type {string} */
	let hospitalType = $state(type);
	/** @type {string} */
	let hospitalLvl = $state(lvl);

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		state: {
			get pagination() {
				return pagination;
			},
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			}
		}
	});

	const handlySync = () => {
		fetch('/hospital', {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		}).then(() => {
			invalidate(window.location.pathname);
		});
	};

	const handlyCopyAll = () => {
		fetch('/hospital', {
			method: 'POST',
			body: JSON.stringify({}),
			headers: {
				'content-type': 'application/json'
			}
		}).then(() => {
			invalidate(window.location.pathname);
		});
	};

	/** @type {(value: string) => void} */
	const handleTypeChange = (value) => {
		// goto(`?tye=${value}`);
		// invalidate('/hospitals/pagination');
		invalidateAll();
	};

	/** @type {(currentPage: number) => void} */
	const handlePrev = (currentPage) => {
		goto(`?page=${currentPage}`);
	};

	/** @type {(currentPage: number) => void} */
	const handleNext = (currentPage) => {
		goto(`?page=${currentPage}`);
	};

	/** @type {(currentPage: number) => void} */
	const handleGo = (currentPage) => {
		goto(`?page=${currentPage}`);
	};
</script>

<div class="w-full">
	<div class="flex items-center py-4">
		<div class="flex gap-2">
			<Button class="" variant="outline" onclick={handlySync}>同步医院经纬度信息</Button>
			<Button class="" variant="outline" onclick={handlyCopyAll}>复制多地址医院</Button>
			<Input
				placeholder="Filter name..."
				value={table.getColumn('name')?.getFilterValue() ?? ''}
				onchange={(e) => {
					table.getColumn('name')?.setFilterValue(e.currentTarget.value);
				}}
				oninput={(e) => {
					table.getColumn('name')?.setFilterValue(e.currentTarget.value);
				}}
				class="max-w-sm"
			/>
			<Select.Root type="single" bind:value={hospitalType} onValueChange={handleTypeChange}>
				<Select.Trigger
					class="h-input rounded-9px border-border-input placeholder:text-foreground-alt/50 bg-background inline-flex w-[296px] items-center border px-[11px] text-sm transition-colors select-none"
					aria-label="请选择医院类型"
				>
					{hospitalType}
				</Select.Trigger>

				<Select.Content>
					<Select.Item value="对内">对内</Select.Item>
					<Select.Item value="对外综合">对外综合</Select.Item>
					<Select.Item value="对外中医">对外中医</Select.Item>
					<Select.Item value="对外专科">对外专科</Select.Item>
					<Select.Item value="社区卫生站">社区卫生站</Select.Item>
					<Select.Item value="村卫生室">村卫生室</Select.Item>
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={hospitalLvl}>
				<Select.Trigger
					class="h-input rounded-9px border-border-input placeholder:text-foreground-alt/50 bg-background inline-flex w-[296px] items-center border px-[11px] text-sm transition-colors select-none"
					aria-label="请选择医院评级"
				>
					{hospitalLvl}
				</Select.Trigger>

				<Select.Content>
					<Select.Item value="未评级">未评级</Select.Item>
					<Select.Item value="一级">一级</Select.Item>
					<Select.Item value="二级">二级</Select.Item>
					<Select.Item value="三级">三级</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="ml-auto">列</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="" align="end">
				{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
					<DropdownMenu.CheckboxItem
						class="capitalize"
						controlledChecked
						checked={column.getIsVisible()}
						onCheckedChange={(value) => column.toggleVisibility(!!value)}
					>
						{column.id}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<div class="rounded-md border">
		<Table.Root class="">
			<Table.Header class="">
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row class="">
						{#each headerGroup.headers as header (header.id)}
							<Table.Head class="">
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body class="">
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row class="" data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell class="">
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row class="">
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<div class="text-muted-foreground flex-1 text-sm">
			{table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length}
		</div>

		<Pagination.Root class="" count={total} perPage={100}>
			{#snippet child({ pages, currentPage })}
				{@debug pages, currentPage}
				<Pagination.Content class="">
					<Pagination.Item>
						<Pagination.PrevButton class="" onclick={() => handlePrev(currentPage)}>
							<ChevronLeft class="size-4" />
							<span>上一页</span>
						</Pagination.PrevButton>
					</Pagination.Item>
					{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<Pagination.Item>
								<Pagination.Ellipsis class="" />
							</Pagination.Item>
						{:else}
							<Pagination.Item
								isVisible={currentPage === page.value}
								onclick={() => handleGo(currentPage)}
							>
								<Pagination.Link class="" {page} isActive={currentPage === page.value}
									>{page.value}</Pagination.Link
								>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Pagination.NextButton class="" onclick={() => handleNext(currentPage)}>
							<span>下一页</span>
							<ChevronRight class="size-4" />
						</Pagination.NextButton>
					</Pagination.Item>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
	</div>
</div>
