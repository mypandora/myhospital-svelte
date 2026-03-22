<script>
	import { onMount } from 'svelte';

	// 使用 Svelte 5 的 $state API
	let p = $state(0); // store p 的初始值为 0
	let visible = $state(false); // store visible 的初始值为 false

	onMount(() => {
		visible = true; // 直接更新 store visible
		function next() {
			p += 0.1; // 直接修改 store p 的值
			const remaining = 1 - p;
			if (remaining > 0.15) {
				setTimeout(next, 500 / remaining); // 按比例调整时间间隔
			}
		}
		setTimeout(next, 250); // 启动递增函数
	});
</script>

{#if visible}
	<!-- 使用 $state 来访问 store 值 -->
	<div class="absolute top-0 left-0 z-50 h-1 w-full">
		<div
			class="absolute top-0 left-0 h-full bg-[#5cb85c] transition-all"
			style="width: {p * 100}%"
		></div>
	</div>
{/if}

{#if p >= 0.4}
	<!-- 根据 p 的值显示遮罩层 -->
	<div
		class="animate-fade pointer-events-none fixed z-40 h-full w-full bg-[rgba(255,255,255,0.3)]"
	></div>
{/if}
