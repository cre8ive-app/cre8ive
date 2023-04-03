<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import Panzoom, { type PanzoomObject } from '@panzoom/panzoom'
	import cardStore from '$lib/stores/cardStore'
	import { page } from '$app/stores'
	import { findMouseButton } from '$lib/utils'
	import canvasStore from '$lib/stores/canvasStore'
	import generalStore from '$lib/stores/generalStore'

	let panzoomElem: HTMLElement | null = null
	let panzoomInstance: PanzoomObject | null = null
	let zoomTimeoutId: any
	let prevSelectedCards: HTMLElement[] | null = null
	let spaceId: string | null
	let canvasId: string | null

	const onContextMenu = (e: MouseEvent) => {
		e.preventDefault()
	}

	const onZoom = (e: WheelEvent) => {
		panzoomInstance && panzoomInstance.zoomWithWheel(e)
	}

	const onPointerDown = (e: PointerEvent) => {
		if (findMouseButton(e.button) === 'left') return false
		panzoomInstance && panzoomInstance.handleDown(e)
	}

	const onPointerMove = (e: PointerEvent) => {
		if (findMouseButton(e.button) === 'left') return false
		panzoomInstance && panzoomInstance.handleMove(e)
	}

	const onPointerUp = (e: PointerEvent) => {
		if (findMouseButton(e.button) === 'left') return false
		panzoomInstance && panzoomInstance.handleUp(e)
	}

	const onPanzoomStart = () => {
		if ($cardStore.selectedCards.length > 0 && !prevSelectedCards) {
			prevSelectedCards = $cardStore.selectedCards
			cardStore.setSelectedCards([])
		}
	}

	const onPanEnd = (e: any) => {
		if (e && e.detail) {
			if (prevSelectedCards) {
				cardStore.setSelectedCards([...prevSelectedCards])
				prevSelectedCards = null
			}

			canvasStore.updateCanvasTransform(
				e.detail.x,
				e.detail.y,
				e.detail.scale
			)

			canvasStore.setIsUnSaved('canvasPanned')
		}
	}

	const onZoomEnd = (e: any) => {
		if (!e || !e.detail) return

		if ($cardStore.selectedCards.length > 0 && !prevSelectedCards) {
			prevSelectedCards = $cardStore.selectedCards
			cardStore.setSelectedCards([])
		}

		if (zoomTimeoutId) clearTimeout(zoomTimeoutId)

		zoomTimeoutId = setTimeout(() => {
			zoomTimeoutId = null

			// TODO: reuse general store > card selection?
			if (prevSelectedCards) {
				cardStore.setSelectedCards([...prevSelectedCards])
				prevSelectedCards = null
			}

			canvasStore.updateCanvasTransform(
				e.detail.x,
				e.detail.y,
				e.detail.scale
			)

			canvasStore.setIsUnSaved('canvasZoomed')
		}, 500)
	}

	const initPanZoom = (ele: HTMLElement) => {
		panzoomElem = ele
		panzoomInstance = Panzoom(ele, {
			canvas: true,
			animate: true, // TODO: not working
			noBind: true,
			cursor: 'default',
			minScale: 0,
			maxScale: 20,
		})

        generalStore.setPanzoom(panzoomInstance)

		if (panzoomInstance && panzoomElem) {
			document.querySelector('body')?.addEventListener('contextmenu', onContextMenu)
			panzoomElem.parentElement?.addEventListener('wheel', onZoom)
			document.addEventListener('pointerdown', onPointerDown)
			document.addEventListener('pointermove', onPointerMove)
			document.addEventListener('pointerup', onPointerUp)
			panzoomElem.addEventListener('panzoomstart', onPanzoomStart)
            panzoomElem.addEventListener('panzoomend', onPanEnd)
            panzoomElem.addEventListener('panzoomzoom', onZoomEnd)
		}
	}

	onMount(async () => {
        spaceId = $page.url.searchParams.get('space-id')
		canvasId = $page.url.searchParams.get('canvas-id')

		if (!spaceId || !canvasId) {
			return false
		}

		const canvasSettings = await canvasStore.loadCanvasSettings(spaceId, canvasId)

		if (canvasSettings && panzoomInstance) {
			panzoomInstance.zoom(canvasSettings.scale, { animate: true })
			setTimeout(() => {
				if (panzoomInstance) {
					panzoomInstance.pan(canvasSettings.pan.left, canvasSettings.pan.top, { animate: true })
				}
			})
		}
	})

	onDestroy(() => {
		if (panzoomInstance && panzoomElem) {
			document.querySelector('body')?.removeEventListener('contextmenu', onContextMenu)
			panzoomElem.parentElement?.removeEventListener('wheel', onZoom)
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('pointermove', onPointerMove)
			document.removeEventListener('pointerup', onPointerUp)
			panzoomElem.removeEventListener('panzoomstart', onPanzoomStart)
			panzoomElem.removeEventListener('panzoomend', onPanEnd)
			panzoomElem.removeEventListener('panzoomzoom', onZoomEnd)
		}
	})
</script>

<div id="canvas-container" class="bg-gray-100 dark:bg-neutral-800" use:initPanZoom>
    <slot />
</div>

<style>
    #canvas-container {
		width: 100vw;
		height: 100vh;
	}
</style>
