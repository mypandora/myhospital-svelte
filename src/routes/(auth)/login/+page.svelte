<script>
	import { onMount, onDestroy } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import Facebook from '$lib/components/svg/brand-facebook.svelte';
	import GoogleSolid from '$lib/components/svg/brand-google.svelte';
	import AppleSolid from '$lib/components/svg/brand-apple.svelte';
	import Twitter from '$lib/components/svg/brand-x.svelte';
	import LoginForm from './form.svelte';
	// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
	import * as echarts from 'echarts/core';
	// 引入柱状图图表，图表后缀都为 Chart
	import { MapChart } from 'echarts/charts';
	// 引入标题，提示框，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
	import { TooltipComponent } from 'echarts/components';
	// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
	import { CanvasRenderer } from 'echarts/renderers';

	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();
	/** @type {import('echarts').EChartsType}*/
	let myChart;

	// 注册必须的组件
	echarts.use([MapChart, CanvasRenderer, TooltipComponent]);

	/**
	 * @param {import('echarts').MapSeriesOption} geoJson
	 */
	function initMap(geoJson) {
		myChart = echarts.init(document.getElementById('chinaMap'));
		echarts.registerMap('china', geoJson);

		const data = [
			{
				name: '北京',
				value: 1
			},
			{
				name: '天津',
				value: 0
			},
			{
				name: '上海',
				value: 0
			},
			{
				name: '重庆',
				value: 0
			},
			{
				name: '河北',
				value: 0
			},
			{
				name: '河南',
				value: 0
			},
			{
				name: '云南',
				value: 0
			},
			{
				name: '辽宁',
				value: 0
			},
			{
				name: '黑龙江',
				value: 0
			},
			{
				name: '湖南',
				value: 0
			},
			{
				name: '安徽',
				value: 0
			},
			{
				name: '山东',
				value: 0
			},
			{
				name: '新疆',
				value: 1
			},
			{
				name: '江苏',
				value: 0
			},
			{
				name: '浙江',
				value: 0
			},
			{
				name: '江西',
				value: 0
			},
			{
				name: '湖北',
				value: 0
			},
			{
				name: '广西',
				value: 0
			},
			{
				name: '甘肃',
				value: 0
			},
			{
				name: '山西',
				value: 0
			},
			{
				name: '内蒙古',
				value: 0
			},
			{
				name: '陕西',
				value: 0
			},
			{
				name: '吉林',
				value: 0
			},
			{
				name: '福建',
				value: 0
			},
			{
				name: '贵州',
				value: 0
			},
			{
				name: '广东',
				value: 0
			},
			{
				name: '青海',
				value: 0
			},
			{
				name: '西藏',
				value: 0
			},
			{
				name: '四川',
				value: 0
			},
			{
				name: '宁夏',
				value: 0
			},
			{
				name: '海南',
				value: 0
			},
			{
				name: '台湾',
				value: 0
			},
			{
				name: '香港',
				value: 0
			},
			{
				name: '澳门',
				value: 0
			}
		];

		myChart.setOption({
			tooltip: {
				trigger: 'item',
				showDelay: 0,
				transitionDuration: 0.2,
				formatter: function (params) {
					if (params.value === 0) {
						return params.name + ': 不支持';
					} else {
						return params.name + ': 已经支持';
					}
				}
			},
			geo: {
				map: 'china',
				roam: true,
				itemStyle: {
					areaColor: '#e7e8ea',
					borderColor: '#ccc'
				},
				regions: [
					{
						name: '北京', // 高亮区域名称
						itemStyle: {
							areaColor: '#ff6f61' // 高亮颜色
						}
					}
				]
			},
			series: [
				{
					name: 'china',
					type: 'map',
					roam: false,
					geoIndex: 0,
					label: {
						show: false
					},
					data
				}
			]
		});
	}

	onMount(() => {
		fetch('https://geojson.cn/api/china/china.json')
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP 错误！状态：${response.status}`);
				}

				return response.json();
			})
			.then((response) => {
				initMap(response);
			});
	});

	onDestroy(() => {
		myChart?.dispose();
	});
</script>

<svelte:head>
	<title>登录</title>
</svelte:head>

<div class="flex h-screen items-center justify-center">
	<div class="hidden h-full overflow-hidden lg:block lg:w-3/5">
		<div id="chinaMap" class="h-full object-cover"></div>
	</div>
	<div
		class="flex w-full items-center justify-center rounded-xl bg-background p-6 shadow sm:max-w-md lg:w-2/5 lg:max-w-full lg:rounded-none lg:p-14 lg:shadow-none"
	>
		<div class="w-full max-w-md space-y-8">
			<div class="text-center">
				<h2 class="mt-6 text-3xl font-bold">欢迎回来！</h2>
			</div>

			<div class="flex flex-row items-center justify-center space-x-3">
				<Button
					class="bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-[#3b5998]/50 dark:focus:ring-[#3b5998]/55"
				>
					<Facebook class="h-6 w-6" />
				</Button>
				<Button
					class="bg-[#1da1f2] hover:bg-[#1da1f2]/90 focus:ring-[#1da1f2]/50 dark:focus:ring-[#1da1f2]/55"
				>
					<Twitter class="h-6 w-6" />
				</Button>
				<Button
					class="bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-[#4285F4]/50 dark:focus:ring-[#4285F4]/55"
				>
					<GoogleSolid class="h-6 w-6" />
				</Button>
				<Button
					class="bg-[#050708] hover:bg-[#050708]/90 focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 dark:focus:ring-[#050708]/50"
				>
					<AppleSolid class="h-6 w-6" />
				</Button>
			</div>

			<div class="relative inline-flex w-full items-center justify-center">
				<hr class="my-8 h-px w-64 border-0 bg-gray-200 dark:bg-gray-700" />
				<span
					class="absolute left-1/2 -translate-x-1/2 bg-white px-3 font-normal text-gray-300 dark:bg-gray-900 dark:text-white"
					>or</span
				>
			</div>

			<LoginForm data={data.form} />
		</div>
	</div>
</div>
