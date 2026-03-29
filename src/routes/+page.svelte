<script>
	import { PUBLIC_AMAP_SERVICE_HOST, PUBLIC_AMAP_KEY } from '$env/static/public';
	import { onMount, onDestroy } from 'svelte';
	import { mode, setMode } from 'mode-watcher';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button/index.js';
	import HospitalDetail from './index/popup-detail.svelte';
	import HospitalList from './index/popup-list.svelte';
	import LoginAvatar from './index/avatar.svelte';
	import { Expand, Shrink, Sun, Moon } from '@lucide/svelte/icons';

	let AMapLoader = null;
	/** @type {Hospital | undefined} */
	let hospital = $state();
	/** @type {Hospital[]} */
	let hospitalList = $state([]);
	/** @type {Set<number>} */
	let allHospitalIds = $state(new SvelteSet());
	/** @type {HTMLElement | undefined} */
	let popupDetail = $state();
	/** @type {AMap.Map | null} */
	let map = null;
	/** @type {AMap.InfoWindow | undefined} */
	let infoWindow;
	/** @type {AMap.ContextMenu | undefined} */
	let contextMenu;
	/** @type {boolean} */
	let isDrawing = false;
	/** @type {boolean} */
	let isProcessing = false;
	/** @type {AMap.Circle | undefined} */
	let circle;
	/** @type {AMap.Circle[]} */
	let circles = $state([]);
	/** @type {AMap.Circle | undefined} */
	let selectedCircle;

	/** @type {SvelteMap<number, {marker: any, clickHandler: () => void}>} */
	const markerMap = new SvelteMap();

	/** @type {(() => void) | undefined} */
	let handleMapClickHandler;
	/** @type {((event: any) => void) | undefined} */
	let handleMapMouseMoveHandler;
	/** @type {(() => void) | undefined} */
	let handleMapRightClickHandler;
	// handleCircleClick 已移除，点击圆的逻辑在 handleMapClick 中处理
	/** @type {((e: any) => void) | undefined} */
	let handleCircleRightClick;
	/** @type {((e: any) => void) | undefined} */
	let handleCircleDragEnd;

	/** @type {SvelteMap<number, any>} */
	const circleEditors = new SvelteMap();

	/** @type {SvelteMap<number, SvelteSet<number>>} */
	const circleMarkerMap = new SvelteMap();

	/** @type {boolean} */
	let isFullscreen = $state(false);

	/** @type {any} */
	let AMapInstance = null;

	/** @type {number} */
	const MAX_CIRCLES = 10;

	/** @type {number} */
	const MIN_RADIUS = 50; // 最小半径50米

	async function initMap() {
		try {
			window._AMapSecurityConfig = {
				serviceHost: PUBLIC_AMAP_SERVICE_HOST
			};

			AMapLoader = await import('@amap/amap-jsapi-loader');
			const AMap = await AMapLoader.load({
				key: PUBLIC_AMAP_KEY,
				version: '2.0',
				plugins: [
					'AMap.Scale',
					'AMap.CitySearch',
					'AMap.ToolBar',
					'AMap.ControlBar',
					'AMap.Geolocation',
					'AMap.CircleEditor'
				]
			});

			AMapInstance = AMap;

			map = new AMap.Map('map', {
				viewMode: '2D',
				center: [116.397428, 39.90923],
				zoom: 5
			});

			toggleTheme();
			createPopup(AMap);
			setupEventHandlers(AMap);
			setupMapControls(AMap);
			requestUserLocation(AMap);
		} catch (error) {
			console.error('地图初始化失败:', error);
		}
	}

	function toggleTheme() {
		if (mode.current === 'dark') {
			map?.setMapStyle('amap://styles/dark');
		} else {
			map?.setMapStyle('amap://styles/normal');
		}
	}

	/** 切换地图样式 */
	function toggleMapStyle() {
		const newStyle = mode.current === 'dark' ? 'light' : 'dark';
		setMode(newStyle);
		toggleTheme();
	}

	/** 切换控件显示/隐藏 */
	function toggleControls() {
		isFullscreen = !isFullscreen;
		if (map) {
			// 获取所有控件元素（不包括右键菜单）
			const controls = document.querySelectorAll(
				'.amap-scale, .amap-toolbar, .amap-controlbar, .amap-geolocation'
			);
			controls.forEach((control) => {
				if (control instanceof HTMLElement) {
					control.style.display = isFullscreen ? 'none' : '';
				}
			});
		}
	}

	/**
	 * @param {any} AMap - 高德地图实例
	 */
	function createPopup(AMap) {
		infoWindow = new AMap.InfoWindow({
			content: popupDetail
		});
		infoWindow.on('close', handleCloseInfoWindow);
	}

	/**
	 * @param {any} AMap - 高德地图实例
	 */
	function setupEventHandlers(AMap) {
		contextMenu = createContextMenu(AMap);

		handleMapClickHandler = handleMapClick.bind(null, AMap);
		handleMapMouseMoveHandler = throttleMouseMove.bind(null, AMap);
		handleMapRightClickHandler = handleMapRightClick.bind(null, AMap);

		map?.on('click', handleMapClickHandler);
		map?.on('mousemove', handleMapMouseMoveHandler);
		map?.on('rightclick', handleMapRightClickHandler);
	}

	/**
	 * @param {any} AMap - 高德地图实例
	 */
	function createContextMenu(AMap) {
		const menu = new AMap.ContextMenu();
		menu.addItem(
			'删除此圆',
			() => {
				if (selectedCircle) {
					// 移除圆内的所有 marker（只删除不属于其他圆的）
					removeMarker(selectedCircle);
					// 移除圆
					removeCircle(selectedCircle);
					// 从列表中移除
					circles = circles.filter((c) => c !== selectedCircle);
					selectedCircle = undefined;
					// 关闭右键菜单
					contextMenu?.close();
				}
			},
			0
		);
		menu.addItem(
			'清空所有圆',
			() => {
				clearAllCircles();
				// 关闭右键菜单
				contextMenu?.close();
			},
			1
		);
		return menu;
	}

	/** 清空所有圆 */
	function clearAllCircles() {
		circles.forEach((c) => {
			removeMarker(c);
			removeCircle(c);
		});
		circles = [];
		circleMarkerMap.clear();
		selectedCircle = undefined;
	}

	/**
	 * 关闭所有圆编辑器
	 */
	function closeAllEditors() {
		circleEditors.forEach((editor) => {
			editor.close();
		});
	}

	/**
	 * @param {any} AMap - 高德地图实例
	 * @param {any} event - 点击事件
	 */
	function handleMapClick(AMap, event) {
		if (isProcessing) return; // 请求处理中,阻止新绘制

		// 检查点击是否在现有圆内
		const clickLngLat = event.lnglat;
		for (let i = circles.length - 1; i >= 0; i--) {
			const c = circles[i];
			if (c.contains(clickLngLat)) {
				// 点击在圆内，关闭其他编辑器，打开该圆的编辑器
				closeAllEditors();
				const circleId = c.getExtData()?.id;
				if (circleId !== undefined) {
					const editor = circleEditors.get(circleId);
					if (editor) {
						editor.open();
					}
				}
				return;
			}
		}

		// 点击空白区域，关闭所有编辑器
		closeAllEditors();

		// 不在任何圆内，正常绘制逻辑
		if (!isDrawing) {
			startDrawingCircle(AMap, event.lnglat);
		} else {
			finishDrawingCircle(AMap);
		}
	}

	let lastMoveTime = 0;
	const MOVE_THROTTLE_MS = 16;

	/**
	 * @param {any} AMap - 高德地图实例
	 * @param {any} event - 鼠标移动事件
	 */
	function throttleMouseMove(AMap, event) {
		const now = Date.now();
		if (now - lastMoveTime < MOVE_THROTTLE_MS) return;
		lastMoveTime = now;
		handleMapMouseMove(AMap, event);
	}

	/**
	 * @param {any} AMap - 高德地图实例
	 * @param {any} event - 鼠标移动事件
	 */
	function handleMapMouseMove(AMap, event) {
		if (isDrawing && circle) {
			const point = event.lnglat;
			const r = AMap.GeometryUtil.distance(circle.getCenter(), point);
			circle.setRadius(r);
		}
	}

	/**
	 * 开始绘制圆形
	 * @param {any} AMap - 高德地图实例
	 * @param {any} point - 点击位置
	 */
	function startDrawingCircle(AMap, point) {
		if (circles.length >= MAX_CIRCLES) {
			console.warn(`已达到${MAX_CIRCLES}个圆上限,无法绘制新的圆`);
			return;
		}

		isDrawing = true;
		circle = new AMap.Circle({
			center: point,
			radius: 0,
			bubble: true,
			strokeColor: '#FF33FF',
			strokeWeight: 3,
			strokeOpacity: 0.8,
			fillOpacity: 0.35,
			fillColor: '#1791fc',
			draggable: true,
			zIndex: 50,
			cursor: 'move'
		});

		handleCircleRightClick = handleCircleRightClickFn.bind(null, AMap);
		handleCircleDragEnd = handleCircleDragEndFn.bind(null, AMap);

		// 注意：click 事件已在地图的 handleMapClick 中统一处理
		circle.on('rightclick', handleCircleRightClick);
		circle.on('dragend', handleCircleDragEnd);

		if (map) {
			circle.setMap(map);
		}
	}

	// eslint-disable-next-line no-unused-vars
	function finishDrawingCircle(/** @type {any} */ _AMap) {
		if (!circle) return;

		isDrawing = false;
		const finishedCircle = circle;

		// 检查半径是否过小
		const radius = finishedCircle.getRadius();
		if (radius < MIN_RADIUS) {
			console.warn('圆的半径过小,已取消绘制');
			finishedCircle.setMap(null);
			circle = undefined;
			return;
		}

		circles = [...circles, finishedCircle];
		circle = undefined;

		const center = finishedCircle.getCenter();

		// 为新创建的圆添加编辑器
		setupCircleEditor(finishedCircle);

		// 初始化圆的 marker 映射
		const circleId = finishedCircle.getExtData()?.id || Date.now();
		circleMarkerMap.set(circleId, new SvelteSet());

		handleFetch({ lng: center.lng, lat: center.lat, radius });
	}

	/**
	 * 为圆设置编辑器
	 * @param {any} circleObj - 圆对象
	 */
	function setupCircleEditor(circleObj) {
		if (!map || !AMapInstance) return;

		const circleId = circleObj.getExtData()?.id || Date.now();
		circleObj.setExtData({ id: circleId });

		const editor = new AMapInstance.CircleEditor(map, circleObj, {
			// 编辑时的样式
			editOptions: {
				strokeColor: '#FF33FF',
				strokeWeight: 3,
				strokeOpacity: 0.8,
				fillOpacity: 0.35,
				fillColor: '#1791fc'
			},
			// 移动点样式（圆心）
			movePoint: {
				content: '<div class="circle-editor-move-point"></div>',
				offset: [-8, -8]
			},
			// 调整半径的点样式
			resizePoint: {
				content: '<div class="circle-editor-resize-point"></div>',
				offset: [-8, -8]
			}
		});

		circleEditors.set(circleId, editor);

		// 监听编辑结束事件
		editor.on('end', (/** @type {any} */ e) => {
			const target = e.target;
			if (target) {
				// 移除圆内的 marker
				removeMarker(target);
				const center = target.getCenter();
				const radius = target.getRadius();
				handleFetch({ lng: center.lng, lat: center.lat, radius });
			}
		});

		// 不自动打开编辑器，让右键菜单正常工作
		// 编辑器在点击圆时打开
	}

	/**
	 * @param {any} _AMap - 高德地图实例（未使用）
	 * @param {any} e - 事件对象
	 */
	// handleCircleClickFn 已移除，点击圆的逻辑在 handleMapClick 中统一处理

	/**
	 * @param {any} _AMap - 高德地图实例（未使用）
	 * @param {any} e - 事件对象
	 */
	function handleCircleRightClickFn(_AMap, e) {
		e.originEvent?.preventDefault();
		selectedCircle = e.target;
		if (map && contextMenu) {
			contextMenu.open(map, e.lnglat);
		}
	}

	/**
	 * @param {any} _AMap - 高德地图实例（未使用）
	 * @param {any} e - 事件对象
	 */
	function handleCircleDragEndFn(_AMap, e) {
		removeMarker(e.target);
		const center = e.target.getCenter();
		const radius = e.target.getRadius();
		handleFetch({ lng: center.lng, lat: center.lat, radius });
	}

	/** @param {Hospital[]} list - 医院列表 */
	function addMarker(list) {
		if (!Array.isArray(list)) return;

		const newList = [];
		list
			.filter((item) => !allHospitalIds.has(item.id))
			.forEach((item) => {
				allHospitalIds.add(item.id);
				newList.push(item);
			});

		newList.forEach((item) => {
			const { name, lng, lat } = item;
			if (!lat || !lng) return;
			/* global AMap */
			const marker = new AMap.Marker({
				map,
				position: new AMap.LngLat(lng, lat),
				title: name,
				extData: item
			});
			const clickHandler = () => {
				hospital = item;
				infoWindow?.open(map, new AMap.LngLat(lng, lat));
			};
			marker.on('click', clickHandler);
			markerMap.set(item.id, { marker, clickHandler });

			// 记录 marker 属于哪个圆
			circles.forEach((c) => {
				if (c.contains(marker.getPosition())) {
					const circleId = c.getExtData()?.id;
					if (circleId !== undefined) {
						const markerSet = circleMarkerMap.get(circleId) || new SvelteSet();
						markerSet.add(item.id);
						circleMarkerMap.set(circleId, markerSet);
					}
				}
			});
		});
	}

	/**
	 * @param {any} _AMap - 高德地图实例（未使用）
	 * @param {any} e - 事件对象
	 */
	function handleMapRightClick(_AMap, e) {
		// 检查是否点击在圆内
		const clickLngLat = e.lnglat;
		let clickedCircle = null;

		// 遍历所有圆，找到被点击的圆
		for (let i = circles.length - 1; i >= 0; i--) {
			const c = circles[i];
			if (c.contains(clickLngLat)) {
				clickedCircle = c;
				break;
			}
		}

		if (clickedCircle) {
			// 在圆内右键，打开右键菜单
			selectedCircle = clickedCircle;
			if (map && contextMenu) {
				contextMenu.open(map, clickLngLat);
			}
		} else {
			// 不在圆内，关闭右键菜单
			if (contextMenu) {
				contextMenu.close();
			}
		}
	}

	/** @param {any} circleObj - 圆形覆盖物 */
	function removeMarker(circleObj) {
		const circleId = circleObj.getExtData()?.id;
		const markerIdsInCircle = circleMarkerMap.get(circleId) || new SvelteSet();

		markerIdsInCircle.forEach((id) => {
			// 检查这个 marker 是否还属于其他圆
			let belongsToOtherCircle = false;
			for (const [otherId, otherMarkerIds] of circleMarkerMap) {
				if (otherId !== circleId && otherMarkerIds.has(id)) {
					belongsToOtherCircle = true;
					break;
				}
			}

			// 只删除不属于其他圆的 marker
			if (!belongsToOtherCircle) {
				const entry = markerMap.get(id);
				if (entry) {
					entry.marker.setMap(null);
					entry.marker.off('click', entry.clickHandler);
					markerMap.delete(id);
				}
				allHospitalIds.delete(id);
				hospitalList = hospitalList.filter((h) => h.id !== id);
			}
		});

		// 清理该圆的 marker 映射
		circleMarkerMap.delete(circleId);
	}

	/** @param {any} c - 圆形覆盖物 */
	function removeCircle(c) {
		// 注意：click 事件不再绑定到圆上
		c.off('rightclick', handleCircleRightClick);
		c.off('dragend', handleCircleDragEnd);

		// 关闭并移除编辑器
		const extData = c.getExtData();
		if (extData?.id) {
			const editor = circleEditors.get(extData.id);
			if (editor) {
				editor.close();
				circleEditors.delete(extData.id);
			}
			circleMarkerMap.delete(extData.id);
		}

		map?.remove(c);
	}

	/**
	 * @param {{ lng: number, lat: number, radius: number }} params
	 */
	async function handleFetch({ lng, lat, radius }) {
		isProcessing = true;
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		try {
			const response = await fetch('/', {
				method: 'POST',
				body: JSON.stringify({ lng, lat, radius }),
				headers: { 'content-type': 'application/json' },
				signal: controller.signal
			});

			if (!response.ok) {
				console.error('请求失败:', response.status);
				return;
			}

			const { data: hospitals } = await response.json();

			addMarker(hospitals);
		} catch (/** @type {any} */ error) {
			if (error.name === 'AbortError') {
				console.warn('请求超时');
			} else {
				console.error('请求异常:', error);
			}
		} finally {
			clearTimeout(timeoutId);
			isProcessing = false;
		}
	}

	function handleCloseInfoWindow() {
		if (infoWindow) {
			hospital = undefined;
			infoWindow.close();
		}
	}

	/**
	 * 设置地图控件
	 * @param {any} AMap - 高德地图实例
	 */
	function setupMapControls(AMap) {
		// 比例尺
		const scale = new AMap.Scale({
			position: {
				right: '108px',
				bottom: '45px'
			}
		});
		map?.addControl(scale);

		// 缩放工具条
		const toolBar = new AMap.ToolBar({
			position: {
				right: '28px',
				bottom: '84px'
			}
		});
		map?.addControl(toolBar);

		// 控制罗盘（旋转、倾斜、缩放）
		const controlBar = new AMap.ControlBar({
			position: {
				right: '-3px',
				bottom: '181px'
			},
			showControlButton: true
		});
		map?.addControl(controlBar);
	}

	/**
	 * 请求用户位置并定位
	 * @param {any} AMap - 高德地图实例
	 */
	function requestUserLocation(AMap) {
		// 检查是否是首次访问
		const hasAskedLocation = localStorage.getItem('hasAskedLocation');

		if (!hasAskedLocation) {
			// 首次访问，询问用户是否允许获取位置
			const geolocation = new AMap.Geolocation({
				enableHighAccuracy: true, // 高精度定位
				timeout: 10000, // 超时时间
				needAddress: true, // 需要地址信息
				extensions: 'all'
			});

			geolocation.getCurrentPosition((/** @type {string} */ status, /** @type {any} */ result) => {
				// 标记已询问过
				localStorage.setItem('hasAskedLocation', 'true');

				if (status === 'complete') {
					// 定位成功，移动到用户位置
					const { lng, lat } = result.position;
					map?.setCenter([lng, lat]);
					map?.setZoom(14);

					// 添加定位控件
					const geolocationControl = new AMap.Geolocation({
						position: {
							right: '27px',
							bottom: '158px'
						},
						panToLocation: true,
						zoomToAccuracy: true,
						showButton: true,
						showMarker: true,
						showCircle: true
					});
					map?.addControl(geolocationControl);
				} else {
					// 定位失败，使用城市定位作为备选
					console.warn('定位失败，尝试城市定位:', result.message);
					fallbackToCityLocation(AMap);

					// 仍然添加定位控件，让用户可以手动定位
					const geolocationControl = new AMap.Geolocation({
						position: {
							right: '27px',
							bottom: '158px'
						},
						panToLocation: true,
						zoomToAccuracy: true,
						showButton: true,
						showMarker: true,
						showCircle: true
					});
					map?.addControl(geolocationControl);
				}
			});
		} else {
			// 非首次访问，直接添加定位控件
			const geolocationControl = new AMap.Geolocation({
				position: {
					right: '27px',
					bottom: '158px'
				},
				panToLocation: true,
				zoomToAccuracy: true,
				showButton: true,
				showMarker: true,
				showCircle: true
			});
			map?.addControl(geolocationControl);

			// 使用城市定位
			fallbackToCityLocation(AMap);
		}
	}

	/**
	 * 备选方案：使用城市定位
	 * @param {any} AMap - 高德地图实例
	 */
	function fallbackToCityLocation(AMap) {
		const citysearch = new AMap.CitySearch();
		citysearch.getLocalCity((/** @type {string} */ status, /** @type {any} */ result) => {
			if (status === 'complete' && result.info === 'OK') {
				if (result?.city && result?.bounds) {
					map?.setBounds(result.bounds);
				}
			}
		});
	}

	onMount(() => {
		initMap();
	});

	onDestroy(() => {
		infoWindow?.off('close', handleCloseInfoWindow);

		if (handleMapClickHandler) map?.off('click', handleMapClickHandler);
		if (handleMapMouseMoveHandler) map?.off('mousemove', handleMapMouseMoveHandler);
		if (handleMapRightClickHandler) map?.off('rightclick', handleMapRightClickHandler);

		// 关闭所有编辑器
		circleEditors.forEach((editor) => {
			editor.close();
		});
		circleEditors.clear();

		circles.forEach((c) => {
			c.off('rightclick', handleCircleRightClick);
			c.off('dragend', handleCircleDragEnd);
			map?.remove(c);
		});
		circles = [];

		if (circle) {
			circle.off('rightclick', handleCircleRightClick);
			circle.off('dragend', handleCircleDragEnd);
			map?.remove(circle);
			circle = undefined;
		}

		markerMap.forEach(({ marker, clickHandler }) => {
			marker.off('click', clickHandler);
			marker.setMap(null);
		});
		markerMap.clear();
		circleMarkerMap.clear();

		map?.destroy();
		map = null;
	});
</script>

<svelte:head>
	<title>首页</title>
</svelte:head>

<div id="map" class="relative flex h-dvh flex-col"></div>

<HospitalDetail {hospital} bind:domRef={popupDetail} />

{#if hospitalList.length > 0}
	<HospitalList {hospitalList} />
{/if}

<LoginAvatar class="absolute top-4 right-4 z-10" />

<!-- 自定义地图控件 -->
<div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
	<!-- 地图样式切换 -->
	<Button
		class="fixed right-17 bottom-10"
		variant="outline"
		size="icon"
		onclick={toggleMapStyle}
		title="切换地图样式"
	>
		{#if mode.current === 'dark'}
			<Moon />
		{:else}
			<Sun />
		{/if}
	</Button>

	<!-- 控件显示/隐藏切换 -->
	<Button
		class="fixed right-6.5 bottom-10"
		variant="outline"
		size="icon"
		onclick={toggleControls}
		title={isFullscreen ? '显示控件' : '隐藏控件'}
	>
		{#if isFullscreen}
			<!-- 隐藏状态图标 - 眼睛关闭 -->
			<Shrink />
		{:else}
			<!-- 显示状态图标 - 眼睛打开 -->
			<Expand />
		{/if}
	</Button>
</div>
