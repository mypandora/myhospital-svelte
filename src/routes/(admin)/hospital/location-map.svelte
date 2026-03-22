<script>
	import { invalidate } from '$app/navigation';
	import { tick } from 'svelte';
	import { mode } from 'mode-watcher';
	import '@amap/amap-jsapi-types';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet/index.js';

	let {
		id,
		dialogOpen = $bindable(),
		name,
		address,
		longitude = 116.397861,
		latitude = 39.900401
	} = $props();
	/**	@type {AMap.Map} */
	let map;
	/** @type {AMap.Marker} */
	let marker;
	/** @type {number} */
	let lng = $state(longitude);
	/** @type {number} */
	let lat = $state(latitude);
	/** @type {number} */
	let newLng = $state(longitude);
	/** @type {number} */
	let newLat = $state(latitude);

	async function handleInitMap() {
		// 类似 nextTick 中初始化地图
		// 等待 DOM 更新完成
		await tick();

		try {
			const AMap = await loadAMap();
			initializeMap(AMap);
			setupEventHandlers(AMap);
		} catch (error) {
			console.error(error);
		}
	}

	async function loadAMap() {
		return await window.AMapLoader.load({
			key: import.meta.env.VITE_KEY,
			version: '2.0',
			plugins: ['AMap.Scale']
		});
	}

	/**
	 * @param {AMap} AMap - 参数对象
	 */
	async function initializeMap(AMap) {
		map = new AMap.Map('map', {
			viewMode: '2D',
			zoom: 18,
			center: [lng, lat]
		});

		if ($mode === 'dark') {
			// 设置地图的显示样式
			map.setMapStyle('amap://styles/dark');
		} else {
			map.setMapStyle('amap://styles/normal');
		}

		if (lng && lat) {
			marker = new AMap.Marker({
				position: [lng, lat]
			});
			marker.on('dragend', updatePosition); // 监听拖动结束事件
			map.add(marker);
		}
	}

	/**
	 * @param {AMap} AMap - 参数对象
	 */
	function setupEventHandlers(AMap) {
		// 监听地图点击事件
		map.on('click', function (e) {
			newLng = e.lnglat.getLng();
			newLat = e.lnglat.getLat();

			// 如果 marker 不存在，则创建 marker
			if (!marker) {
				marker = new AMap.Marker({
					position: [newLng, newLat],
					map: map,
					draggable: true // 设置标记可拖拽
				});
				marker.on('dragend', updatePosition); // 监听拖动结束事件
			} else {
				// 如果 marker 已存在，则更新位置
				marker.setPosition([newLng, newLat]);
			}
		});
	}

	function updatePosition() {
		fetch('/hospital', {
			method: 'PATCH',
			body: JSON.stringify({ id, lng: newLng, lat: newLat }),
			headers: {
				'content-type': 'application/json'
			}
		})
			.then(() => {
				invalidate(window.location.pathname);
			})
			.finally(() => {
				dialogOpen = false;
			});
	}

	$effect(() => {
		if (dialogOpen) {
			handleInitMap();
		}
	});
</script>

<Sheet.Root bind:open={dialogOpen}>
	<Sheet.Content class="md:max-w-full">
		<Sheet.Header class="">
			<Sheet.Title class=""
				>请为医院<span class="text-red-500">{name}</span>选择正确的地址: {address}</Sheet.Title
			>
			<Sheet.Description class="">使用鼠标在地图上选择正确的地址。</Sheet.Description>
		</Sheet.Header>
		<div id="map" class="my-2 h-[calc(100%-100px)] w-full"></div>
		<div class="absolute right-10 bottom-20 rounded bg-slate-400 p-2">
			经度: <span>{lng || 'N/A'}</span>, 纬度: <span>{lat || 'N/A'}</span>
		</div>

		<Sheet.Footer class="">
			<Button class="" onclick={updatePosition}>保存</Button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
