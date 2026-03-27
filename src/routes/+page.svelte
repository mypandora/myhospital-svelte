<script>
	import { PUBLIC_AMAP_SERVICE_HOST, PUBLIC_AMAP_KEY } from '$env/static/public';
	import { onMount, onDestroy } from 'svelte';
	import { mode } from 'mode-watcher';
	import '@amap/amap-jsapi-types';
	import HospitalDetail from './index/popup-detail.svelte';
	import HospitalList from './index/popup-list.svelte';
	import LoginAvatar from './index/avatar.svelte';

	let AMapLoader = null;
	/** @type {import('./index/types').Hospital | undefined} */
	let hospital = $state();
	/** @type {import('./index/types').Hospital[]} */
	let hospitalList = $state([]);
	/** @type {Array<number>} */
	let allHospitalIds = $state([]); // 用于保存已绘制的医院 id,避免重复绘制[];
	/** @type {HTMLElement | undefined}*/
	let popupDetail = $state();

	/**	@type {AMap.Map | null} */
	let map = null;
	/** @type {AMap.InfoWindow}*/
	let infoWindow;
	/** @type {AMap.ContextMenu} */
	let contextMenu;
	/** @type {boolean}*/
	let isDrawing = false;
	/** @type {AMap.Circle | undefined} */
	let circle;
	/** @type {AMap.Circle | undefined} */
	let selectedCircle; // 用于保存当前右键选中的 Circle

	/** @type {((e: any) => void) | undefined} */
	let handleMapClickHandler;
	/** @type {((e: any) => void) | undefined} */
	let handleMapMouseMoveHandler;
	/** @type {(() => void) | undefined} */
	let handleMapRightClickHandler;

	/**
	 * 初始化地图
	 */
	async function initMap() {
		try {
			// // 配置高德密钥
			window._AMapSecurityConfig = {
				serviceHost: PUBLIC_AMAP_SERVICE_HOST
			};

			// 引入高德 jsapi-loader
			AMapLoader = await import('@amap/amap-jsapi-loader');
			// 加载高德地图相关脚本
			const AMap = await AMapLoader.load({
				key: PUBLIC_AMAP_KEY,
				version: '2.0',
				plugins: ['AMap.Scale', 'AMap.CitySearch', 'AMap.Circle', 'AMap.CircleEditor']
			});

			// 初始化地图
			map = new AMap.Map('map', {
				viewMode: '2D',
				zoom: 13,
				center: [116.397428, 39.90923]
			});

			toggleTheme();
			createPopup(AMap);
			setupEventHandlers(AMap);
			showCityInfo(AMap);
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * 切换主题样式
	 */
	function toggleTheme() {
		if (mode.current === 'dark') {
			// 设置地图的显示样式
			// map?.setMapStyle('amap://styles/dark');
			map?.setMapStyle('amap://styles/normal');
		} else {
			map?.setMapStyle('amap://styles/normal');
		}
	}

	/**
	 * 创建弹窗
	 * @param {AMap} AMap - 参数对象
	 */
	function createPopup(AMap) {
		infoWindow = new AMap.InfoWindow({
			content: popupDetail
		});
		infoWindow.on('close', handleCloseInfoWindow);
	}

	/**
	 * 设置地图相关事件
	 * @param {AMap} AMap - 参数对象
	 */
	function setupEventHandlers(AMap) {
		contextMenu = createContextMenu(AMap);

		handleMapClickHandler = handleMapClick.bind(null, AMap);
		handleMapMouseMoveHandler = handleMapMouseMove.bind(null, AMap);
		handleMapRightClickHandler = () => contextMenu && contextMenu.close();

		map?.on('click', handleMapClickHandler);
		map?.on('mousemove', handleMapMouseMoveHandler);
		map?.on('rightclick', handleMapRightClickHandler);
	}

	/**
	 * 创建右键菜单
	 * @param {AMap} AMap - 参数对象
	 */
	function createContextMenu(AMap) {
		const contextMenu = new AMap.ContextMenu();
		contextMenu.addItem(
			'删除',
			() => {
				if (selectedCircle) {
					removeMarker(selectedCircle);
					removeCircle(selectedCircle);
					selectedCircle = undefined;
				}
			},
			0
		);
		return contextMenu;
	}

	/**
	 * 地图点击事件
	 * @param {AMap} AMap - 参数对象
	 * @param {AMap.Event<'click'> & { lnglat: AMap.LngLat }} event - 参数对象
	 */
	function handleMapClick(AMap, event) {
		if (!isDrawing) {
			startDrawingCircle(AMap, event.lnglat);
		} else {
			finishDrawingCircle();
		}
	}

	/**
	 * 地图鼠标移动事件
	 * @param {AMap} AMap - 参数对象
	 * @param {AMap.Event<'click'> & { lnglat: AMap.LngLat }} event - 参数对象
	 */
	function handleMapMouseMove(AMap, event) {
		if (isDrawing && circle) {
			const movePoint = event.lnglat;
			const radius = AMap.GeometryUtil.distance(circle.getCenter(), movePoint);
			circle.setRadius(radius);
		}
	}

	/**
	 * 开始绘制圆形
	 * @param {AMap} AMap - 参数对象
	 * @param {AMap.LngLat} point - 参数对象
	 */
	function startDrawingCircle(AMap, point) {
		isDrawing = true;
		circle = new AMap.Circle({
			center: point,
			radius: 0, // 初始半径为0
			bubble: false,
			strokeColor: '#FF33FF',
			strokeWeight: 3,
			strokeOpacity: 0.2,
			fillOpacity: 0.35,
			fillColor: '#1791fc',
			draggable: true,
			zIndex: 50
		});
		circle.on('click', handleCircleClick);
		circle.on('rightclick', handleCircleRightClick);
		circle.on('dragend', handleCircleDragEnd);
		if (map) {
			circle.setMap(map);
		}
	}

	/**
	 * 结束绘制圆形
	 */
	function finishDrawingCircle() {
		isDrawing = false;
		if (circle) {
			const { lng, lat } = circle.getCenter();
			const radius = circle.getRadius();
			handleFetch({ lng, lat, radius });
			// circle = undefined; // 重置圆形对象
		}
	}

	/**
	 * 处理圆形点击事件
	 * @param {any} e - 事件对象
	 */
	function handleCircleClick(e) {
		const circle = e.target;
		hospitalList = [];
		map?.getAllOverlays('marker').forEach((marker) => {
			if (circle.contains(marker.getPosition())) {
				hospitalList.push(marker.getExtData());
			}
		});
	}

	/**
	 * 处理圆形右键点击事件
	 * @param {any} e - 事件对象
	 */
	function handleCircleRightClick(e) {
		selectedCircle = e.target;
		if (map) {
			contextMenu.open(map, e.lnglat);
		}
	}

	/**
	 * 处理圆形拖动结束事件
	 * @param {any} e - 事件对象
	 */
	function handleCircleDragEnd(e) {
		// 删除旧的不在当前圆形范围内的 marker
		removeMarker(e.target);
		// 发送请求，获取新的医院数据
		const { lng, lat } = e.target.getCenter();
		const radius = e.target.getRadius();
		handleFetch({ lng, lat, radius });
	}

	/**
	 * 根据查询到的医院数据添加地图标记
	 * @param {Array<import('./index/types').Hospital>} list 医院信息数组
	 */
	function addMarker(list) {
		if (!Array.isArray(list)) {
			return;
		}

		/** @type {Array<import('./index/types').Hospital>} */
		const newList = [];
		list
			// 过滤已绘制的
			.filter((item) => !allHospitalIds.includes(item.id))
			.forEach((item) => {
				allHospitalIds.push(item.id);
				newList.push(item);
			});

		newList.forEach((item, i) => {
			const { lng, lat, name } = item;

			const marker = new AMap.Marker({
				map,
				position: new AMap.LngLat(lng, lat),
				title: name,
				extData: item
			});
			marker.on('click', () => {
				hospital = item;
				infoWindow.open(map, [lng, lat]);
			});
		});
	}

	/**
	 * 删除圆形内的标记
	 * @param {AMap.Circle} circle - 圆形对象
	 */
	function removeMarker(circle) {
		// 创建一个数组来保存 Circle 内的 Marker
		/** @type {Array<AMap.Marker>} */
		const markersInCircle = [];

		// 遍历地图上的所有 Marker
		map?.getAllOverlays('marker').forEach((marker) => {
			// 检查 Marker 是否在 Circle 内
			if (circle.contains(marker.getPosition())) {
				markersInCircle.push(marker);
			}
		});
		markersInCircle.forEach((marker) => {
			const idx = allHospitalIds.indexOf(marker.getExtData().id);
			if (idx !== -1) {
				allHospitalIds.splice(idx, 1);
			}
			hospitalList = hospitalList.filter((item) => item.id !== marker.getExtData().id);
			marker.setMap(null);
		});
	}

	/**
	 * 删除圆形
	 * @param {AMap.Circle} circle - 圆形对象
	 */
	function removeCircle(circle) {
		circle.off('click', handleCircleClick);
		circle.off('rightclick', handleCircleRightClick);
		circle.off('dragend', handleCircleDragEnd);
		// 从地图上删除 Circle
		map?.remove(circle);
	}

	/**
	 * 根据坐标范围查询医院数据
	 * @param {Object} params - 参数对象
	 * @param {number} params.lng - 经度
	 * @param {number} params.lat - 纬度
	 * @param {number} params.radius - 半径
	 */
	async function handleFetch({ lng, lat, radius }) {
		const response = await fetch('/', {
			method: 'POST',
			body: JSON.stringify({ lng, lat, radius }),
			headers: {
				'content-type': 'application/json'
			}
		});

		if (!response.ok) return;

		const hospitals = await response.json();

		addMarker(hospitals);
	}

	function handleCloseInfoWindow() {
		if (infoWindow) {
			hospital = undefined;
			infoWindow.close();
		}
	}

	/**
	 * 显示当前城市
	 * @param {AMap} AMap - 参数对象
	 */
	function showCityInfo(AMap) {
		//实例化城市查询类
		const citysearch = new AMap.CitySearch();
		//自动获取用户IP，返回当前城市
		citysearch.getLocalCity(function (status, result) {
			if (status === 'complete' && result.info === 'OK') {
				if (result && result.city && result.bounds) {
					const citybounds = result.bounds;
					//地图显示当前城市
					map.setBounds(citybounds);
				}
			}
		});
	}

	onMount(() => {
		initMap();
	});

	onDestroy(() => {
		//解绑地图的点击事件
		handleMapClickHandler && map?.off('click', handleMapClickHandler);
		handleMapMouseMoveHandler && map?.off('mousemove', handleMapMouseMoveHandler);
		handleMapRightClickHandler && map?.off('rightclick', handleMapRightClickHandler);
		//销毁地图，并清空地图容器
		map?.destroy();
		map = null;
	});
</script>

<svelte:head>
	<title>首页</title>
</svelte:head>

<div id="map" class="relative flex h-dvh flex-col"></div>

<!-- 某个医院的详情弹框 -->
<HospitalDetail {hospital} bind:domRef={popupDetail} />

{#if hospitalList.length > 0}
	<HospitalList {hospitalList} />
{/if}

<LoginAvatar class="absolute top-4 right-4 z-10" />
