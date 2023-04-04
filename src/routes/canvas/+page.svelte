<script lang="ts">
	import { onMount } from 'svelte'
	import Panzoom from '$lib/components/Panzoom.svelte'
	import Moveable from '$lib/components/Moveable.svelte'
	import Selecto from '$lib/components/Selecto.svelte'
	import Card from '$lib/components/Card.svelte'
	import ZoomDisplay from '$lib/components/ZoomDisplay.svelte'
	import FullscreenMode from '$lib/components/FullscreenMode.svelte'
	import ResetZoom from '$lib/components/ResetZoom.svelte'
	import cardStore from '$lib/stores/cardStore'
	import { pb } from '$lib/pocketbase'
	import { nanoid } from 'nanoid'
	import { page } from '$app/stores'
	import LeftMenu from '$lib/components/LeftMenu.svelte'
	import { goto } from '$app/navigation'
	import { findMouseButton, isFullScreen, mouseCoords } from '$lib/utils'
	import { MenuItem } from '$lib/stores/generalStore'

	// @ts-ignore
	import Dropzone from 'svelte-file-dropzone'

	import generalStore from '$lib/stores/generalStore'
	import canvasStore from '$lib/stores/canvasStore'

	$: canvasTitle = $canvasStore.canvasSettings.name
	let spaceId: string | null
	let canvasId: string | null
	let fullScreen: boolean = false // TODO: set and get this from store
	let lastClick: PointerEvent | null = null

	// TODO: Autosave
	// onInterval(async () => {
	// 	if (!$canvasStore.isSaving) {
	// 		canvasStore.save()
	// 	}
	// }, 5000)

	onMount(async () => {
		spaceId = $page.url.searchParams.get('space-id')
		canvasId = $page.url.searchParams.get('canvas-id')

		// TODO: handle auth check at route level
		if (!pb.authStore.isValid || !spaceId || !canvasId) {
			goto('/login')
			return false
		}
	})

	// TODO: handle different media
	const handleFileUpload = async (e: any) => {
		if (!e || !e.detail || !e.detail.event) return false

		const panzoomInstance = $generalStore.panzoom
		let files = null

		files = e.detail.acceptedFiles

		if (!files || !panzoomInstance) return false

		const coords = mouseCoords(e.detail.event, panzoomInstance.getScale())

		let { left, top } = coords ? coords : { left: 200, top: 200 }

		files.forEach(async (file: any) => {
			const id = nanoid(15)
			const formData = new FormData()

			formData.append('id', id)
			formData.append('canvas_id', canvasId as string)
			formData.append('type', 'image')
			formData.append('width', 200 + '')
			formData.append('height', 200 + '')
			formData.append('top', top + '')
			formData.append('left', left + '')
			formData.append(
				'style',
				JSON.stringify({
					backgroundColor: 'none',
					color: 'none',
					border: 'none',
					transform: `translate(${left}px, ${top}px)`,
					width: '200px',
					height: '200px'
				})
			)

			formData.append('settings', JSON.stringify({ borderStyle: '' }))

			formData.append('content', '')
			formData.append('media', file)

			cardStore.addCard(id, formData)

			left = left + 250
		})
	}

	const canvasMouseDown = (e: PointerEvent) => {
		const clickedMouseButton = findMouseButton(e.button)

		if ($generalStore.isMenuActive.addNewCard && clickedMouseButton === 'left') {
			const panzoomInstance = $generalStore.panzoom

			if (!panzoomInstance) return false

			const coords = mouseCoords(e, panzoomInstance.getScale())

			let { left, top } = coords ? coords : { left: 200, top: 200 }

			const id = nanoid(15)

			const card = {
				id,
				canvas_id: canvasId,
				type: 'text',
				width: '200px',
				height: '200px',
				top,
				left,
				style: {
					backgroundColor: 'rgb(255, 255, 255)',
					color: 'rgb(0, 0, 0)',
					border: '1px solid #000000',
					transform: `translate(${top}px, ${left}px)`,
					width: '200px',
					height: '200px'
				},
				content: '',
				settings: { borderStyle: '' }
			}

			cardStore.addCard(id, card)
		}
	}

	const handleKeyboardShortcuts = async (e: KeyboardEvent) => {
		if (e.code === 'F11') e.preventDefault()

		// Select tool
		if (e.code === 'KeyS' && e.shiftKey === true && e.ctrlKey === true) {
			e.preventDefault()
			generalStore.toggleIsMenuActive(MenuItem.select, true)
		}

		// Add new card tool
		if (e.code === 'KeyA' && e.shiftKey === true && e.ctrlKey === true) {
			e.preventDefault()
			generalStore.toggleIsMenuActive(MenuItem.addNewCard, true)
		}

		// Group selected cards
		if (e.code === 'KeyG' && e.ctrlKey === true) {
			e.preventDefault()

			if ($cardStore.selectedCards.length > 1) {
				const cardIds = $cardStore.selectedCards.map((card: any) => card.getAttribute('id'))
				canvasStore.setGroupedCardIds(cardIds)
			}
		}

		// Un-Group selected cards
		if (e.code === 'KeyG' && e.shiftKey === true && e.ctrlKey === true) {
			e.preventDefault()

			if ($cardStore.selectedCards.length > 0) {
				const cardIds = $cardStore.selectedCards.map((card: any) => card.getAttribute('id'))
				canvasStore.ungroupCards(cardIds)
			}
		}

		// Duplicate selected cards
		if (e.code === 'KeyD' && e.ctrlKey === true) {
			e.preventDefault()

			if ($cardStore.selectedCards.length > 0) {
				const cardIds = $cardStore.selectedCards.map((card: any) => card.getAttribute('id'))

				const newCardIds = await cardStore.duplicateCards(cardIds)

				if (newCardIds) {
					setTimeout(() => {
						const cardEles = newCardIds.map(
							(cardId) => document.getElementById(cardId) as HTMLElement
						)
						cardStore.setSelectedCards(cardEles)
					}, 100)
				}
			}
		}

		// Delete selected cards
		if ((e.code === 'Delete' || e.code === 'Backspace') && !$cardStore.activeEditorId) {
			e.preventDefault()

			if ($cardStore.selectedCards.length > 0) {
				cardStore.deleteCards($cardStore.selectedCards)
			}
		}

		// Save
		if (e.code === 'KeyS' && e.ctrlKey === true) {
			e.preventDefault()
			canvasStore.save()
		}
	}

	const handlePaste = (e: any) => {
		const items = (e.clipboardData || e.originalEvent.clipboardData).items
		const files: File[] = []

		for (let index in items) {
			const item = items[index]

			if (item.kind === 'file') {
				files.push(item.getAsFile())
			}
		}

		if (!lastClick && files.length > 0) {
			alert('Please click on the canvas before pasting the media')
			return false
		}

		handleFileUpload({ detail: { event: lastClick, acceptedFiles: files } })
		lastClick = null
	}

	const fullScreenChanged = (e: Event) => {
		fullScreen = isFullScreen() ? true : false
	}
</script>

<svelte:head>
	<title>{canvasTitle}</title>
</svelte:head>

<svelte:window
	on:keydown={handleKeyboardShortcuts}
	on:paste={handlePaste}
	on:fullscreenchange={fullScreenChanged}
/>

<div class="main-wrapper overflow-hidden">
	<div id="toolbar-container" />

	{#if !fullScreen}
		<LeftMenu />
		<ZoomDisplay />
		<ResetZoom />
	{/if}

	<FullscreenMode />

	<div
		id="canvas-wrapper"
		class="bg-gray-100 dark:bg-neutral-800"
		class:noPointerEvents={$generalStore.showProgress}
	>
		<Moveable />
		<Selecto />

		<div on:pointerdown={(e) => canvasMouseDown(e)} on:pointerup={(e) => (lastClick = e)}>
			<Dropzone
				accept={'.jpg, .jpeg, .png, .gif, .webp'}
				on:drop={handleFileUpload}
				disabled={false}
				noKeyboard={true}
				noClick={true}
				disableDefaultStyles={true}
				multiple={true}
				containerStyles="outline: none;"
			>
				<Panzoom>
					<Card />
				</Panzoom>
			</Dropzone>
		</div>
	</div>
</div>

<style>
	#toolbar-container {
		position: absolute;
		width: 50%;
		height: auto;
		top: 5%;
		left: 0;
		right: 0;
		margin: 0 auto;
	}

	.noPointerEvents {
		pointer-events: none !important;
	}
</style>
