<script>
	/** @type {{ hospitalList: import('./types').Hospital[] }} */
	let { hospitalList } = $props();

	/** @type {string} */
	let selectType = $state('');
	/** @type {string} */
	let selectLvl = $state('');

	let filteredHospitalList = $derived(
		hospitalList.filter(
			/** @param {import('./types').Hospital} hospital */ (hospital) => {
				if (selectType === '' && selectLvl === '') {
					return true;
				}
				if (selectType !== '' && selectLvl !== '') {
					return hospital.type === selectType && hospital.lvl === selectLvl;
				}
				if (selectType === '') {
					return hospital.lvl === selectLvl;
				}
				if (selectLvl === '') {
					return hospital.type === selectType;
				}
			}
		)
	);

	/**
	 * 从医院名称跳转到官网详情页面
	 * @param {string} name
	 */
	function handleDetail(name) {
		const tempForm = document.createElement('form');
		tempForm.id = 'tempForm1';
		tempForm.method = 'post';
		tempForm.action = 'https://fw.ybj.beijing.gov.cn/ddyy/ddyy/list';
		tempForm.target = 'ddyy1form';

		const hideInput = document.createElement('input');
		hideInput.type = 'hidden';
		hideInput.name = 'search_LIKE_yymc';
		hideInput.value = name;

		tempForm.appendChild(hideInput);
		tempForm.addEventListener('submit', () => {
			window.open('https://fw.ybj.beijing.gov.cn/ddyy/ddyy/list', 'ddyy1form');
		});

		document.body.appendChild(tempForm);
		tempForm.submit();
		document.body.removeChild(tempForm);
	}
</script>

<div class="absolute top-4 bottom-4 left-4 w-90 space-y-2 bg-white p-2 shadow">
	<div class="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
		<select name="type" placeholder="请选择医院类别" bind:value={selectType}>
			<option value="">--请选择医院类别--</option>
			<option value="对外综合">对外综合</option>
			<option value="对外专科">对外专科</option>
			<option value="对外中医">对外中医</option>
			<option value="社区卫生站">社区卫生站</option>
			<option value="村卫生室">村卫生室</option>
			<option value="对内">对内</option>
		</select>
		<select name="lvl" placeholder="请选择医院等级" bind:value={selectLvl}>
			<option value="">--请选择医院等级--</option>
			<option value="三级">三级</option>
			<option value="二级">二级</option>
			<option value="一级">一级</option>
			<option value="未评级">未评级</option>
			<option value="无等级">无等级</option>
		</select>
	</div>
	<div class="overflow-y-auto">
		<div class="flex items-center justify-between bg-gray-100 py-2">
			<span class="flex-1">医院名称</span>
			<span class="w-16">编号</span>
			<span class="w-16">等级</span>
			<span class="w-16">医院类别</span>
		</div>
		<ul class="space-y-4 text-xs text-gray-500 dark:text-gray-400">
			{#each filteredHospitalList as hospital}
				<li class="flex border-b border-gray-200 pb-2 dark:border-gray-700">
					<button class="mr-2 flex-1 text-gray-900" onclick={() => handleDetail(hospital?.name)}
						>{hospital?.name}</button
					>
					<span class="w-16">{hospital?.code}</span>
					<span class="w-16">{hospital?.lvl}</span>
					<span class="w-16">{hospital?.type}</span>
				</li>
			{/each}
		</ul>
	</div>
</div>
