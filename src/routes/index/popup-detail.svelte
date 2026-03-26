<script>
	/** @type {{hospital: any, domRef: any}} */
	let { hospital, domRef = $bindable() } = $props();

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

<div class="min-w-96 p-2" bind:this={domRef}>
	<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">医院信息</h2>
	<ul class="space-y-2 text-gray-500 dark:text-gray-400">
		<li class="gap-3">
			<span class="mr-2 text-gray-900">医院名称</span>
			<button class="mr-2 text-gray-900" onclick={() => handleDetail(hospital?.name)}
				>{hospital?.name}</button
			>
		</li>
		<li class="gap-3">
			<span class="mr-2 text-gray-900">医院编码</span>
			{hospital?.code}
		</li>
		<li class="gap-3">
			<span class="mr-2 text-gray-900">医院等级</span>
			{hospital?.lvl}
		</li>
		<li class="gap-3">
			<span class="mr-2 text-gray-900">医院类别</span>
			{hospital?.type}
		</li>
		<li class="gap-3">
			<span class="mr-2 text-gray-900">单位地址</span>
			{hospital?.address}
		</li>
		<li class="gap-3">
			<span class="mr-2 text-gray-900">医院简介</span>
			{hospital?.introduction}
		</li>
	</ul>
</div>
