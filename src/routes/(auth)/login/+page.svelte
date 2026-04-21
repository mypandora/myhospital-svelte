<script>
	import { onMount, onDestroy } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import Facebook from '$lib/components/svg/brand-facebook.svelte';
	import GoogleSolid from '$lib/components/svg/brand-google.svelte';
	import AppleSolid from '$lib/components/svg/brand-apple.svelte';
	import Twitter from '$lib/components/svg/brand-x.svelte';
	import LoginForm from './form.svelte';

	// 引入 echarts 核心模块
	import * as echarts from 'echarts/core';
	// 引入地图图表和特效散点图(可选，为后续加动态波纹做准备)
	import { MapChart, EffectScatterChart } from 'echarts/charts';
	// 引入提示框、地理坐标系、视觉映射组件
	import { TooltipComponent, GeoComponent, VisualMapComponent } from 'echarts/components';
	// 引入 Canvas 渲染器
	import { CanvasRenderer } from 'echarts/renderers';

	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();
	/** @type {import('echarts').EChartsType}*/
	let myChart;
	let resizeHandler;
	const maxVal = Math.max(...data.provinceStats.map((o) => o.value), 100);

	// 注册必须的组件
	echarts.use([
		MapChart,
		EffectScatterChart,
		CanvasRenderer,
		TooltipComponent,
		GeoComponent,
		VisualMapComponent
	]);

	/**
	 * @param {import('echarts').MapSeriesOption} geoJson
	 */
	function initMap(geoJson) {
		myChart = echarts.init(document.getElementById('chinaMap'));
		echarts.registerMap('china', geoJson);

		myChart.setOption({
			backgroundColor: 'transparent', // 保持透明，融入 Tailwind 背景
			tooltip: {
				trigger: 'item',
				backgroundColor: 'rgba(255, 255, 255, 0.95)',
				borderWidth: 0,
				shadowBlur: 15,
				shadowColor: 'rgba(0, 0, 0, 0.1)',
				textStyle: { color: '#333' },
				padding: [10, 15],
				formatter: function (params) {
					// 如果 params.value 是数组，说明鼠标在 effectScatter（散点）上
					if (Array.isArray(params.value)) {
						const [lng, lat, count] = params.value;
						return `
							<div style="font-weight:bold; border-bottom:1px solid #eee; padding-bottom:6px; margin-bottom:6px;">
								${params.name}中心节点
							</div>
							<div style="font-size:12px; color:#666;">
								覆盖医院: <span style="color:#ff6f61; font-weight:bold;">${count}</span> 家
							</div>
						`;
					}

					// 否则说明在 map（省份板块）上
					const val = params.value || 0;
					return `
            <div style="font-weight:bold; border-bottom:1px solid #eee; padding-bottom:6px; margin-bottom:6px;">
                ${params.name}
            </div>
            ${
							val === 0
								? '<span style="color:#999;">暂无支持节点</span>'
								: `全省医保定点: <span style="color:#4b7bbb; font-weight:bold;">${val}</span> 个`
						}
        `;
				}
			},
			visualMap: {
				show: true, // 可以在左下角显示
				min: 0,
				max: maxVal, // 这里填 provinceStats 中的最大值
				seriesIndex: 0, // 作用于第一个 series (map)
				inRange: {
					color: ['#e7e8ea', '#a7c0de', '#4b7bbb'] // 颜色渐变
				},
				textStyle: { color: '#888' }
			},
			geo: {
				map: 'china',
				roam: true,
				zoom: 1.2, // 稍微放大初始比例以填满左侧容器
				label: {
					show: false
				},
				itemStyle: {
					// 增加地图的厚度/立体感
					borderColor: '#ffffff',
					borderWidth: 1,
					shadowColor: 'rgba(0, 0, 0, 0.15)',
					shadowBlur: 15,
					shadowOffsetX: 0,
					shadowOffsetY: 10
				}
			},
			series: [
				{
					name: '省份资源',
					type: 'map',
					geoIndex: 0,
					data: data.provinceStats // [{name: '北京', value: 350}, ...]
				},
				{
					name: '核心节点',
					type: 'effectScatter', // 带有呼吸动画的散点
					coordinateSystem: 'geo', // 使用地理坐标系
					data: data.cityCoordPoints, // [{name: '北京', value: [经度, 纬度, 350]}, ...]
					symbolSize: function (val) {
						// 根据医院数量控制点的大小
						return Math.max(5, Math.min(20, val[2] / 50));
					},
					showEffectOn: 'render', // 渲染完就显示动画
					rippleEffect: {
						brushType: 'stroke', // 波纹效果
						scale: 3,
						period: 4
					},
					label: {
						show: false // 登录页干净为主，不显示城市名
					},
					itemStyle: {
						color: '#ff6f61', // 散点颜色，可以用品牌色
						shadowBlur: 10,
						shadowColor: '#ff6f61'
					},
					zlevel: 1 // 让散点浮在地图上面
				}
			]
		});
	}

	onMount(() => {
		// 监听窗口大小变化，让图表自适应容器
		resizeHandler = () => {
			myChart?.resize();
		};
		window.addEventListener('resize', resizeHandler);

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
		if (resizeHandler) {
			window.removeEventListener('resize', resizeHandler);
		}
	});
</script>

<svelte:head>
	<title>登录</title>
</svelte:head>

<div class="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
	<div class="relative hidden h-full overflow-hidden lg:block lg:w-3/5">
		<div id="chinaMap" class="absolute inset-0 object-cover p-8"></div>
	</div>

	<div
		class="z-10 flex w-full items-center justify-center rounded-xl bg-background p-6 shadow-lg sm:max-w-md lg:w-2/5 lg:max-w-full lg:rounded-none lg:p-14 lg:shadow-none"
	>
		<div class="w-full max-w-md space-y-8">
			<div class="text-center">
				<h2 class="mt-6 text-3xl font-bold tracking-tight">欢迎回来！</h2>
			</div>

			<div class="flex flex-row items-center justify-center space-x-3">
				<Button
					disabled={true}
					class="bg-[#3b5998] text-white hover:bg-[#3b5998]/90 focus:ring-[#3b5998]/50 dark:focus:ring-[#3b5998]/55"
				>
					<Facebook class="h-6 w-6" />
				</Button>
				<Button
					disabled={true}
					class="bg-[#1da1f2] text-white hover:bg-[#1da1f2]/90 focus:ring-[#1da1f2]/50 dark:focus:ring-[#1da1f2]/55"
				>
					<Twitter class="h-6 w-6" />
				</Button>
				<Button
					disabled={true}
					class="bg-[#4285F4] text-white hover:bg-[#4285F4]/90 focus:ring-[#4285F4]/50 dark:focus:ring-[#4285F4]/55"
				>
					<GoogleSolid class="h-6 w-6" />
				</Button>
				<Button
					disabled={true}
					class="bg-[#050708] text-white hover:bg-[#050708]/90 focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 dark:focus:ring-[#050708]/50"
				>
					<AppleSolid class="h-6 w-6" />
				</Button>
			</div>

			<div class="relative inline-flex w-full items-center justify-center">
				<hr class="my-8 h-px w-64 border-0 bg-gray-200 dark:bg-gray-800" />
				<span
					class="absolute left-1/2 -translate-x-1/2 bg-white px-3 font-normal text-gray-400 dark:bg-background dark:text-gray-500"
					>or</span
				>
			</div>

			<LoginForm data={data.form} />
		</div>
	</div>
</div>
