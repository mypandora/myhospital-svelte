<script>
	import { invalidate } from '$app/navigation';
	import { tick } from 'svelte';
	import { mode } from 'mode-watcher';
	import '@amap/amap-jsapi-types';
	import { Input } from '$lib/components/ui/input/index.js';
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

	let AMapLoader = null;

	async function handleInitMap() {
		// 类似 nextTick 中初始化地图
		// 等待 DOM 更新完成
		await tick();

		AMapLoader = await import('@amap/amap-jsapi-loader');

		window._AMapSecurityConfig = {
			serviceHost: 'http://localhost:3000/_AMapService'
		};

		try {
			const AMap = await loadAMap();
			initializeMap(AMap);
			setupEventHandlers(AMap);
		} catch (error) {
			console.error(error);
		}
	}

	async function loadAMap() {
		return await AMapLoader.load({
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

	function updateMarkerPosition() {
		if (marker) {
			marker.setPosition([newLng, newLat]);
		} else {
			marker = new AMap.Marker({
				position: [newLng, newLat],
				map: map,
				draggable: true
			});
			marker.on('dragend', updatePosition);
		}

		// Center the map on the new marker position
		map.setCenter([newLng, newLat]);
	}

	/**
	 * @param {AMap} AMap - 参数对象
	 */
	function setupEventHandlers(AMap) {
		// 监听地图点击事件
		map.on('click', function (e) {
			newLng = e.lnglat.getLng();
			newLat = e.lnglat.getLat();

			updateMarkerPosition();
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

	/**
	 * 根据地址获取经纬度
	 * @param {string} address - 地址
	 */
	async function fetchCoordinates(address) {
		const city = '北京市';
		const url = `/tianjing/tianjing-server/lbs-api/geocoding/geo?key=552280e3-8cbd-49a1-9d2a-9010045bc492&address=${address}&city=${city}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		return data.data.location.split(',');
	}

	async function getLngLat() {
		try {
			const [lng, lat] = await fetchCoordinates(name);
			newLng = lng;
			newLat = lat;
			updateMarkerPosition();
		} catch (error) {
			console.error('Fetch error:', error);
		}
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
			<Sheet.Title class="">
				<div class="flex items-center">
					<span>请为医院<span class="text-red-500">{name}</span>选择正确的地址: {address}</span>

					<div class="ml-auto flex items-center gap-2">
						<Input type="type" placeholder="email" class="max-w-xs" bind:value={name} />
						<Button class="" onclick={getLngLat}>重新定位</Button>
					</div>
				</div>
			</Sheet.Title>
			<Sheet.Description class="">使用鼠标在地图上选择正确的地址。</Sheet.Description>
		</Sheet.Header>
		<div id="map" class="my-2 h-[calc(100%-100px)] w-full"></div>
		<div class="absolute right-10 bottom-20 rounded bg-slate-400 p-2">
			经度: <span>{newLng || lng || 'N/A'}</span>, 纬度: <span>{newLat || lat || 'N/A'}</span>
		</div>

		<Sheet.Footer class="">
			<Button class="" onclick={updatePosition}>保存</Button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
