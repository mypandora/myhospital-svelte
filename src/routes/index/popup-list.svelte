<script>
	import { openHospitalPage } from '$lib/utils';
	import { X, Building2, RotateCw } from '@lucide/svelte/icons';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Cascader } from '$lib/components/ui/cascader/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as ScrollArea from '$lib/components/ui/scroll-area/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	/** @type {{ hospitalList: import('./types').Hospital[], onclose?: () => void }} */
	let { hospitalList, onclose } = $props();

	const TYPE_TREE = [
		{
			label: '医院',
			children: [
				{ label: '综合医院', value: '综合医院' },
				{
					label: '中医医院',
					children: [
						{ label: '中医（综合）医院', value: '中医（综合）医院' },
						{ label: '中医专科医院', value: '中医专科医院' },
						{ label: '肛肠医院', value: '肛肠医院' },
						{ label: '骨伤医院', value: '骨伤医院' },
						{ label: '针炙医院', value: '针炙医院' },
						{ label: '按摩医院', value: '按摩医院' },
						{ label: '其他中医专科医院', value: '其他中医专科医院' }
					]
				},
				{ label: '中西医结合医院', value: '中西医结合医院' },
				{
					label: '民族医院',
					children: [
						{ label: '蒙医院', value: '蒙医院' },
						{ label: '藏医院', value: '藏医院' },
						{ label: '维医院', value: '维医院' },
						{ label: '傣医院', value: '傣医院' },
						{ label: '其他民族医院', value: '其他民族医院' }
					]
				},
				{
					label: '专科医院',
					children: [
						{ label: '口腔医院', value: '口腔医院' },
						{ label: '眼科医院', value: '眼科医院' },
						{ label: '耳鼻喉科医院', value: '耳鼻喉科医院' },
						{ label: '肿瘤医院', value: '肿瘤医院' },
						{ label: '心血管病医院', value: '心血管病医院' },
						{ label: '胸科医院', value: '胸科医院' },
						{ label: '血液病医院', value: '血液病医院' },
						{ label: '妇产（科）医院', value: '妇产（科）医院' },
						{ label: '儿童医院', value: '儿童医院' },
						{ label: '精神病医院', value: '精神病医院' },
						{ label: '传染病医院', value: '传染病医院' },
						{ label: '皮肤病医院', value: '皮肤病医院' },
						{ label: '结核病医院', value: '结核病医院' },
						{ label: '职业病医院', value: '职业病医院' },
						{ label: '骨科医院', value: '骨科医院' },
						{ label: '康复医院', value: '康复医院' },
						{ label: '整形外科医院', value: '整形外科医院' },
						{ label: '美容医院', value: '美容医院' },
						{ label: '其他专科医院', value: '其他专科医院' }
					]
				},
				{ label: '疗养院', value: '疗养院' },
				{
					label: '护理院（站）',
					children: [
						{ label: '护理院', value: '护理院' },
						{ label: '护理站', value: '护理站' }
					]
				}
			]
		},
		{
			label: '社区卫生',
			children: [
				{ label: '社区卫生服务中心', value: '社区卫生服务中心' },
				{ label: '社区卫生服务站', value: '社区卫生服务站' }
			]
		},
		{
			label: '卫生院',
			children: [
				{ label: '中心卫生院', value: '中心卫生院' },
				{ label: '乡卫生院', value: '乡卫生院' }
			]
		},
		{
			label: '门诊/诊所/村卫生室',
			children: [
				{
					label: '门诊部',
					children: [
						{ label: '综合门诊部', value: '综合门诊部' },
						{ label: '中医门诊部', value: '中医门诊部' },
						{ label: '中医（综合）门诊部', value: '中医（综合）门诊部' },
						{ label: '中西医结合门诊部', value: '中西医结合门诊部' },
						{ label: '专科门诊部', value: '专科门诊部' },
						{ label: '口腔门诊部', value: '口腔门诊部' },
						{ label: '医疗美容门诊部', value: '医疗美容门诊部' }
					]
				},
				{
					label: '诊所',
					children: [
						{ label: '普通诊所', value: '普通诊所' },
						{ label: '中医诊所', value: '中医诊所' },
						{ label: '中西医结合诊所', value: '中西医结合诊所' },
						{ label: '口腔诊所', value: '口腔诊所' },
						{ label: '医疗美容诊所', value: '医疗美容诊所' },
						{ label: '其他诊所', value: '其他诊所' }
					]
				},
				{ label: '卫生所（室）', value: '卫生所（室）' },
				{ label: '医务室', value: '医务室' },
				{ label: '村卫生室', value: '村卫生室' }
			]
		},
		{
			label: '急救中心',
			children: [
				{ label: '急救中心', value: '急救中心' },
				{ label: '急救中心站', value: '急救中心站' },
				{ label: '急救站', value: '急救站' }
			]
		},
		{
			label: '妇幼保健',
			children: [
				{ label: '妇幼保健院', value: '妇幼保健院' },
				{ label: '妇幼保健所', value: '妇幼保健所' },
				{ label: '妇幼保健站', value: '妇幼保健站' }
			]
		},
		{
			label: '专科疾病防治',
			children: [
				{ label: '传染病防治院', value: '传染病防治院' },
				{ label: '结核病防治院', value: '结核病防治院' },
				{ label: '职业病防治院', value: '职业病防治院' },
				{ label: '皮肤病防治所', value: '皮肤病防治所' },
				{ label: '职业病防治所', value: '职业病防治所' },
				{ label: '其他专科疾病防治院', value: '其他专科疾病防治院' },
				{ label: '其他专科疾病防治所', value: '其他专科疾病防治所' }
			]
		},
		{
			label: '疾病预防控制',
			children: [
				{ label: '疾病预防控制中心', value: '疾病预防控制中心' },
				{ label: '卫生防疫站', value: '卫生防疫站' }
			]
		},
		{
			label: '其他卫生机构',
			children: [
				{ label: '血液中心', value: '血液中心' },
				{ label: '中心血站', value: '中心血站' },
				{ label: '卫生监督所', value: '卫生监督所' },
				{ label: '健康教育所', value: '健康教育所' },
				{ label: '计划生育技术服务中心', value: '计划生育技术服务中心' }
			]
		}
	];

	const LEVEL_OPTIONS = ['三级', '二级', '一级', '未定级'];

	/** @type {string} */
	let selectTypeName = $state('');
	/** @type {string} */
	let selectLevelName = $state('');

	function resetFilters() {
		selectTypeName = '';
		selectLevelName = '';
	}

	let filteredHospitalList = $derived(
		hospitalList.filter((hospital) => {
			const typeMatch = selectTypeName === '' || hospital.typeName === selectTypeName;
			const levelMatch = selectLevelName === '' || hospital.levelName === selectLevelName;
			return typeMatch && levelMatch;
		})
	);
</script>

<div class="absolute top-16 bottom-4 left-4 z-10 flex w-92 flex-col">
	<Card.Root class="flex flex-1 flex-col overflow-hidden">
		<Card.Header class="shrink-0 px-4 py-3">
			<div class="flex items-center justify-between">
				<Card.Title class="flex items-center gap-2 text-sm">
					<Building2 class="h-4 w-4 text-blue-500" />
					医院列表
					<Badge variant="secondary" class="text-xs"
						>{filteredHospitalList.length}/{hospitalList.length}</Badge
					>
				</Card.Title>
				{#if onclose}
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6"
						disabled={false}
						onclick={onclose}
						title="关闭列表"
					>
						<X class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		</Card.Header>

		<div class="flex shrink-0 items-center gap-2 px-4 pb-3">
			<Cascader
				class="flex-1"
				placeholder="机构类别"
				options={TYPE_TREE}
				bind:value={selectTypeName}
			/>

			<Select.Root type="single" bind:value={selectLevelName}>
				<Select.Trigger class="flex-1 text-xs" aria-label="医院等级">
					{selectLevelName || '医院等级'}
				</Select.Trigger>
				<Select.Content>
					{#each LEVEL_OPTIONS as lvl (lvl)}
						<Select.Item value={lvl}>{lvl}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			{#if selectTypeName || selectLevelName}
				<Button
					variant="ghost"
					size="icon"
					class="h-7 w-7 shrink-0"
					disabled={false}
					onclick={resetFilters}
					title="重置筛选"
				>
					<RotateCw class="h-3.5 w-3.5" />
				</Button>
			{/if}
		</div>

		<Card.Content class="flex-1 overflow-hidden p-0">
			<ScrollArea.Root orientation="vertical" class="h-full">
				<div
					class="sticky top-0 z-10 flex items-center bg-muted/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
				>
					<span class="flex-1">医院名称</span>
					<span class="w-14 text-center">等级</span>
					<span class="w-20 text-center">类别</span>
				</div>
				<ul class="px-1 text-xs">
					{#each filteredHospitalList as hospital, i}
						<li>
							<button
								class="flex w-full items-center rounded px-2 py-2 text-left transition-colors hover:bg-accent"
								onclick={() => openHospitalPage(hospital?.name)}
							>
								<span class="mr-2 w-5 shrink-0 text-muted-foreground/50">{i + 1}</span>
								<span class="flex-1 text-foreground">{hospital?.name}</span>
								<span class="w-14 shrink-0 text-center text-muted-foreground"
									>{hospital?.levelName}</span
								>
								<span class="w-20 shrink-0 text-center text-muted-foreground"
									>{hospital?.typeName}</span
								>
							</button>
						</li>
					{/each}
				</ul>
			</ScrollArea.Root>
		</Card.Content>
	</Card.Root>
</div>
