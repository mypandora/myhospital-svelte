<script>
	import { openHospitalPage } from '$lib/utils';

	/** @type {{hospital: any, domRef: any}} */
	let { hospital, domRef = $bindable() } = $props();
</script>

<div class="min-w-96 p-2" bind:this={domRef}>
	<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">医院信息</h2>
	<ul class="space-y-2 text-gray-500 dark:text-gray-400">
		<li class="gap-3">
			<span class="mr-2 text-gray-900">医院名称</span>
			<button class="mr-2 text-gray-900" onclick={() => openHospitalPage(hospital?.name)}
				>{hospital?.name}</button
			>
		</li>
		<li class="gap-3">
			<span class="mr-2 text-gray-900">医院编码</span>
			{hospital?.institutionCode}
		</li>
		<li class="gap-3">
			<span class="mr-2 text-gray-900">医院等级</span>
			{hospital?.levelName}
		</li>
		<li class="gap-3">
			<span class="mr-2 text-gray-900">医院类别</span>
			{hospital?.typeName}
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
