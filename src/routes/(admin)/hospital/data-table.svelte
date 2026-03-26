<script>
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { getCoreRowModel } from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	// 常量
	const HOSPITAL_TYPES = [
		'整形外科医院',
		'急救站',
		'眼科医院',
		'其他民族医院',
		'按摩医院',
		'中心卫生院',
		'综合医院',
		'-',
		'妇产（科）医院',
		'护理院',
		'口腔医院',
		'综合门诊部',
		'藏医院',
		'口腔病防治所（站、中心）',
		'骨伤医院',
		'耳鼻喉科医院',
		'中医诊所',
		'村卫生室',
		'精神病医院',
		'传染病医院',
		'妇幼保健院',
		'社区卫生服务中心',
		'乡卫生院',
		'其他中医专科医院',
		'中医（综合）门诊部',
		'儿童医院',
		'心血管病医院',
		'肿瘤医院',
		'中医专科医院',
		'结核病医院',
		'中西医结合医院',
		'专科门诊部',
		'口腔诊所',
		'社区卫生服务站',
		'职业病防治院',
		'中医（综合）医院',
		'口腔门诊部',
		'卫生所（室）',
		'其他专科疾病防治所（站、中心）',
		'中医门诊部',
		'血液病医院',
		'医务室',
		'其他',
		'普通诊所',
		'康复医院',
		'肛肠医院',
		'针炙医院',
		'皮肤病医院',
		'其他专科医院',
		'结核病防治所（站、中心）',
		'骨科医院',
		'其他专科疾病防治院',
		'胸科医院',
		'中西医结合门诊部',
		'急救中心'
	];
	const HOSPITAL_LEVELS = ['未评级', '一级', '二级', '三级'];

	/** @type {{data?: Array<import('./types').Hospital>, columns: import('@tanstack/table-core').ColumnDef<import('./types').Hospital>[], total?: number, pageIndex?: number, pageSize?: number, type?: string, lvl?: string}} */
	let { data, columns, total = 0, pageIndex = 1, pageSize = 10, type = '', lvl = '' } = $props();

	/** @type {import('@tanstack/table-core').SortingState} */
	let sorting = $state([]);
	/** @type {import('@tanstack/table-core').VisibilityState} */
	let columnVisibility = $state({});
	/** @type {import('@tanstack/table-core').RowSelectionState} */
	let rowSelection = $state({});
	/** @type {string} */
	let hospitalType = $state(type);
	/** @type {string} */
	let hospitalLvl = $state(lvl);

	let isLoading = $state(false);

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true, //turn off client-side pagination
		rowCount: total, //pass in the total row count so the table knows how many pages there are (pageCount calculated internally if not provided)
		// pageCount: total / 10, //alternatively directly pass in pageCount instead of rowCount
		manualSorting: true, //use pre-sorted row model instead of sorted row model
		manualFiltering: true,
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				const newPagination = updater({ pageIndex, pageSize });
				goto(
					`?page=${newPagination.pageIndex}&limit=${newPagination.pageSize}&type=${hospitalType}&lvl=${hospitalLvl}`
				);
			} else {
				goto(
					`?page=${updater.pageIndex}&limit=${updater.pageSize}&type=${hospitalType}&lvl=${hospitalLvl}`
				);
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}

			// Construct the new URL with sorting parameters
			const sortParams = sorting
				.map((sort) => `${sort.id},${sort.desc ? 'desc' : 'asc'}`)
				.join('&');

			const newUrl = `?page=${pageIndex}&limit=${pageSize}&sort=${sortParams}&type=${hospitalType}&lvl=${hospitalLvl}`;

			// Navigate to the new URL
			goto(newUrl);
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
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			}
		}
	});

	const handlySync = async () => {
		isLoading = true;
		try {
			await fetch('/hospital', {
				method: 'GET',
				headers: {
					'content-type': 'application/json'
				}
			});
			invalidate(window.location.pathname);
		} catch (error) {
			console.error(error);
		} finally {
			isLoading = false;
		}
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
</script>

<div class="w-full">
	<div class="flex items-center py-4">
		<div class="flex gap-2">
			<Button class="" variant="outline" onclick={handlySync}
				>{isLoading ? '同步中...' : '同步医院经纬度信息'}</Button
			>
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
					class="h-input rounded-9px border-border-input placeholder:text-foreground-alt/50 inline-flex w-[296px] items-center border bg-background px-[11px] text-sm transition-colors select-none"
					aria-label="请选择医院类型"
				>
					{hospitalType}
				</Select.Trigger>

				<Select.Content>
					{#each HOSPITAL_TYPES as type (type)}
						<Select.Item value={type}>{type}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={hospitalLvl}>
				<Select.Trigger
					class="h-input rounded-9px border-border-input placeholder:text-foreground-alt/50 inline-flex w-[296px] items-center border bg-background px-[11px] text-sm transition-colors select-none"
					aria-label="请选择医院评级"
				>
					{hospitalLvl}
				</Select.Trigger>

				<Select.Content class="">
					{#each HOSPITAL_LEVELS as lvl (lvl)}
						<Select.Item value={lvl}>{lvl}</Select.Item>
					{/each}
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

	<div class="flex items-center justify-between py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length}
		</div>

		<Pagination.Root class="ml-auto w-auto" count={total} perPage={pageSize}>
			{#snippet children({ pages, currentPage })}
				<Pagination.Content class="">
					<Pagination.Item>
						<Pagination.PrevButton class="" onclick={() => table.previousPage()}>
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
								onclick={() => table.setPageIndex(page.value)}
							>
								<Pagination.Link class="" {page} isActive={currentPage === page.value}>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Pagination.NextButton class="" onclick={() => table.nextPage()}>
							<span>下一页</span>
							<ChevronRight class="size-4" />
						</Pagination.NextButton>
					</Pagination.Item>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
	</div>
</div>
