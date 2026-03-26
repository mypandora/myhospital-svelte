import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableActions from './data-table-actions.svelte';
import DataTableNameButton from './data-table-name-button.svelte';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';

/** @type {import('@tanstack/table-core').ColumnDef<import('./types').Hospital>[]} */
export const columns = [
	{
		id: 'select',
		header: ({ table }) =>
			renderComponent(Checkbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsAllPageRowsSelected() && !table.getIsAllPageRowsSelected(),
				/** @type {(value: boolean) => void} */
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				controlledChecked: true,
				'aria-label': '全选'
			}),
		cell: ({ row }) =>
			renderComponent(Checkbox, {
				checked: row.getIsSelected(),
				/** @type {(value: boolean) => void} */
				onCheckedChange: (value) => row.toggleSelected(!!value),
				controlledChecked: true,
				'aria-label': '当前行'
			}),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: 'name',
		header: ({ column }) =>
			renderComponent(DataTableNameButton, {
				onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
			})
	},
	{
		accessorKey: 'code',
		header: '医院编码',
		size: 270 //set column size for this column
	},
	{
		accessorKey: 'lvl',
		header: '医院等级'
	},
	{
		accessorKey: 'type',
		header: '医院类型'
	},
	{
		accessorKey: 'district',
		header: '所属区'
	},
	{
		accessorKey: 'address',
		header: '单位地址',
		size: 300
	},
	{
		accessorKey: 'zipCode',
		header: '邮编'
	},
	{
		accessorKey: 'introduction',
		header: '医院简介'
	},
	{
		accessorKey: 'lng',
		header: '经度'
	},
	{
		accessorKey: 'lat',
		header: '纬度'
	},
	{
		id: '操作',
		header: '操作',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id,
				name: row.original.name,
				address: row.original.address,
				longitude: row.original.lng,
				latitude: row.original.lat
			});
		}
	}
];
